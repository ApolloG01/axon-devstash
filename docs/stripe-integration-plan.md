# Stripe Subscription Integration Plan

**Tier:** Free ($0) / Pro ($8/mo or $72/yr)  
**Researched:** 2026-05-08

---

## Current State Analysis

### User Model

The `User` model already has all the Stripe fields needed — no schema migration required:

```prisma
isPro                Boolean      @default(false)
stripeCustomerId     String?      @unique
stripeSubscriptionId String?      @unique
```

### Auth & Session

- **Strategy:** JWT (not database sessions)
- **Session callback** in `src/auth.ts` currently only forwards `token.sub` → `session.user.id`
- **`isPro`** is NOT currently in the session — must be added to both the JWT token and the session object
- **Type extension** in `src/types/next-auth.d.ts` only declares `id` — needs `isPro` added

### Middleware (Proxy)

`src/proxy.ts` uses the edge-safe `authConfig` (no Prisma). Adding `isPro` gating at the middleware level is not practical — keep gating in Server Actions and Server Components.

### Environment Variables

All five Stripe env vars are already stubbed in `.env`:
```
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_MONTHLY=...
STRIPE_PRICE_ID_YEARLY=...
```

### Existing Pro Feature Surfaces

| Feature | Location | Gating needed |
|---------|----------|---------------|
| File upload (`/api/upload`) | `src/app/api/upload/route.ts` | Check `isPro` before processing |
| Image upload | same route, `kind === "image"` | Check `isPro` |
| New Item dialog (file/image types) | `src/components/items/new-item-dialog.tsx` | Hide or disable file/image types for Free |
| Item count (Free: 50 items) | `src/actions/items.ts → createItem` | Count check before insert |
| Collection count (Free: 3) | `src/actions/collections.ts → createCollection` | Count check before insert |
| Sidebar PRO badge | `src/components/layout/sidebar-content.tsx` | Currently decorative — keep as-is |

### Server Action Pattern

All actions follow:
```ts
const session = await auth()
if (!session?.user?.id) return { success: false, error: "Unauthorized" }
// ... then operate
return { success: true, data: ... }
// or
return { success: false, error: "..." }
```

The same pattern will be used for Pro gate errors, returning `{ success: false, error: "Pro required" }`.

---

## Implementation Plan

### Implementation Order

1. Install Stripe SDK
2. Extend session types + auth callbacks
3. Create `src/lib/stripe.ts`
4. Create Stripe webhook route (`/api/stripe/webhook`)
5. Create checkout session action
6. Create billing portal action
7. Add Billing section to Settings page
8. Enforce Free tier limits in Server Actions
9. Gate upload route for Pro
10. Gate file/image types in the New Item UI

---

## Step 1 — Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

---

## Step 2 — Extend Session with `isPro`

### `src/types/next-auth.d.ts`

```ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isPro: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean
  }
}
```

### `src/auth.ts` — add JWT + session callbacks

The JWT callback syncs `isPro` from the DB on every validation so Stripe webhook updates are automatically picked up on the next page load (no `update()` call needed):

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.sub = user.id
    }
    // Always sync isPro from DB — picks up webhook-driven changes on next session validation
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      })
      token.isPro = dbUser?.isPro ?? false
    }
    return token
  },
  session({ session, token }) {
    if (token.sub) session.user.id = token.sub
    session.user.isPro = token.isPro ?? false
    return session
  },
},
```

> **Why always-sync?** The Stripe webhook updates `isPro` in the DB. If we only set `isPro` on initial login (`if (user)` block), sessions won't reflect the upgrade until the user logs out and back in. Always syncing costs one small DB lookup per session validation and makes a simple page reload sufficient to pick up Pro status.

---

## Step 3 — `src/lib/stripe.ts`

```ts
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
})

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const
```

---

## Step 4 — Webhook Route: `src/app/api/stripe/webhook/route.ts`

This is the most critical piece. It must:
- Read the raw body (not parsed JSON)
- Verify the Stripe signature
- Handle `checkout.session.completed` and `customer.subscription.deleted`

```ts
import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== "subscription") break

      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const userId = session.metadata?.userId

      if (!userId) break

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: true,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      })
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          isPro: false,
          stripeSubscriptionId: null,
        },
      })
      break
    }

    case "invoice.payment_failed": {
      // Optional: notify user via email or mark account as past_due
      // For now, Stripe handles retries — no action needed
      break
    }
  }

  return NextResponse.json({ received: true })
}

// Must disable body parsing so we can verify Stripe signature on raw body
export const config = {
  api: { bodyParser: false },
}
```

> **Important:** Add `/api/stripe/webhook` to the middleware `matcher` exclusion (it's already excluded since `proxy.ts` only guards dashboard/items/collections paths — no change needed).

---

## Step 5 — Checkout Action: `src/actions/billing.ts`

```ts
"use server"

import { auth } from "@/auth"
import { stripe, STRIPE_PRICES } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createCheckoutSession(interval: "monthly" | "yearly") {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, isPro: true },
  })
  if (!user) return { success: false, error: "User not found" }
  if (user.isPro) return { success: false, error: "Already Pro" }

  const priceId = STRIPE_PRICES[interval]

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.stripeCustomerId ? undefined : user.email ?? undefined,
    customer: user.stripeCustomerId ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  if (!checkoutSession.url) return { success: false, error: "Could not create checkout session" }

  redirect(checkoutSession.url)
}

export async function createBillingPortalSession() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })
  if (!user?.stripeCustomerId) return { success: false, error: "No billing account found" }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  redirect(portalSession.url)
}
```

---

## Step 6 — Billing Section in Settings Page

Add a new "Billing" section to `src/app/(dashboard)/settings/page.tsx`. The page already fetches `user` from the DB — extend that query:

```ts
// In settings/page.tsx, extend the existing user select:
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: {
    password: true,
    isPro: true,
    stripeCustomerId: true,
  },
})
```

Add a new `<BillingSection>` server component or inline section:

**`src/components/settings/billing-section.tsx`**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing"

interface BillingSectionProps {
  isPro: boolean
  hasStripeCustomer: boolean
}

export function BillingSection({ isPro, hasStripeCustomer }: BillingSectionProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const result = await createCheckoutSession(interval)
    if (result && !result.success) {
      toast.error(result.error)
      setLoading(false)
    }
    // On success, action redirects to Stripe — no further handling needed
  }

  async function handleManage() {
    setLoading(true)
    const result = await createBillingPortalSession()
    if (result && !result.success) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  if (isPro) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-400">Pro</span>
          <span className="text-xs text-muted-foreground">— active subscription</span>
        </div>
        {hasStripeCustomer && (
          <Button variant="outline" size="sm" onClick={handleManage} disabled={loading}>
            {loading ? "Loading…" : "Manage Billing"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upgrade to Pro for unlimited items, collections, file uploads, and AI features.
      </p>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={interval === "monthly" ? "default" : "outline"}
          onClick={() => setInterval("monthly")}
        >
          Monthly — $8/mo
        </Button>
        <Button
          size="sm"
          variant={interval === "yearly" ? "default" : "outline"}
          onClick={() => setInterval("yearly")}
        >
          Yearly — $72/yr
        </Button>
      </div>

      <Button onClick={handleUpgrade} disabled={loading}>
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </Button>
    </div>
  )
}
```

Then in `settings/page.tsx`:
```tsx
// Pass searchParams for upgrade success toast
const { passwordChanged, upgraded } = await searchParams

// After existing sections, add:
<Separator />
<section className="space-y-4">
  <div>
    <h2 className="text-sm font-semibold">Billing</h2>
    <p className="text-xs text-muted-foreground mt-0.5">
      Manage your Pro subscription.
    </p>
  </div>
  <BillingSection isPro={user.isPro} hasStripeCustomer={!!user.stripeCustomerId} />
</section>

// And add the upgraded toast:
{upgraded === "1" && <PageToast message="Welcome to Pro! Your account has been upgraded." />}
```

---

## Step 7 — Free Tier Limits in Server Actions

### Items limit (50 free items)

In `src/actions/items.ts → createItem`:

```ts
export async function createItem(data: CreateItemInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  // Free tier limit
  if (!session.user.isPro) {
    const count = await prisma.item.count({ where: { userId: session.user.id } })
    if (count >= 50) {
      return { success: false, error: "Free plan limit reached (50 items). Upgrade to Pro for unlimited items." }
    }
  }

  // ... rest of existing logic
}
```

### Collections limit (3 free collections)

In `src/actions/collections.ts → createCollection`:

```ts
if (!session.user.isPro) {
  const count = await prisma.collection.count({ where: { userId: session.user.id } })
  if (count >= 3) {
    return { success: false, error: "Free plan limit reached (3 collections). Upgrade to Pro for unlimited collections." }
  }
}
```

### File/Image upload gate

In `src/app/api/upload/route.ts`:

```ts
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

// File/image uploads are Pro-only
if (!session.user.isPro) {
  return NextResponse.json({ error: "File uploads require a Pro subscription." }, { status: 403 })
}
```

> **Note:** `session.user.isPro` is available in API routes because the JWT callback always syncs it from the DB.

### New Item dialog — hide file/image for Free users

Pass `isPro` as a prop to `NewItemDialog` (already received in the server component that renders it). Filter `itemTypes` before passing:

```ts
// In dashboard layout or page that passes itemTypes to NewItemDialog:
const visibleTypes = session.user.isPro
  ? itemTypes
  : itemTypes.filter((t) => t.name !== "file" && t.name !== "image")
```

---

## Step 8 — Add `NEXT_PUBLIC_APP_URL` to Environment

```
# .env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://your-domain.com
```

---

## Stripe Dashboard Setup

1. **Create Products** in Stripe Dashboard → Products:
   - "DevStash Pro Monthly" — recurring, $8/month
   - "DevStash Pro Yearly" — recurring, $72/year
   - Copy both Price IDs into `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`

2. **Customer Portal** — Stripe Dashboard → Settings → Billing → Customer Portal:
   - Enable "Cancel subscriptions"
   - Enable "Update payment methods"
   - Set return URL to `https://your-domain.com/settings`

3. **Webhook Endpoint** — Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `invoice.payment_failed` (optional but recommended)
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

4. **Local testing** — use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client + price ID constants |
| `src/app/api/stripe/webhook/route.ts` | Webhook handler |
| `src/actions/billing.ts` | `createCheckoutSession` + `createBillingPortalSession` |
| `src/components/settings/billing-section.tsx` | Billing UI in settings |

## Files to Modify

| File | Change |
|------|--------|
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to Session and JWT |
| `src/auth.ts` | Add `jwt` callback that always syncs `isPro` from DB |
| `src/app/(dashboard)/settings/page.tsx` | Add Billing section, upgraded toast, extend user select |
| `src/actions/items.ts` | Free tier item count gate in `createItem` |
| `src/actions/collections.ts` | Free tier collection count gate in `createCollection` |
| `src/app/api/upload/route.ts` | Pro-only gate before processing uploads |
| `.env` | Add `NEXT_PUBLIC_APP_URL` |

---

## Testing Checklist

### Local Testing
- [ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook` running
- [ ] Checkout flow completes → `isPro` flips to `true` in DB
- [ ] Page reload reflects Pro status (session synced via JWT callback)
- [ ] Settings shows "Pro — active subscription" + Manage Billing button
- [ ] Subscription cancellation event → `isPro` flips to `false`
- [ ] Free user blocked at 50 items (test with seeded data or manual count)
- [ ] Free user blocked at 3 collections
- [ ] File upload blocked for Free user (403 from `/api/upload`)
- [ ] Pro user can upload files/images normally
- [ ] Billing portal opens and allows cancellation

### Edge Cases
- [ ] User with GitHub OAuth (no `stripeCustomerId`) starts checkout — `customer_email` pre-filled from session
- [ ] Already-Pro user clicking Upgrade → "Already Pro" error surfaced via toast
- [ ] Webhook received with unknown `userId` in metadata → graceful no-op
- [ ] Stripe signature verification failure → 400, no DB writes

---

## Notes

- **Session sync strategy:** The JWT `jwt` callback always fetches `isPro` from the DB. This costs one extra DB round-trip per session validation but eliminates any risk of stale Pro status after a webhook update. A page reload is all that's needed after upgrade.
- **Pro feature flags:** `session.user.isPro` is the single source of truth for all gating — both client and server. Never trust client-side prop alone without a server-side check in the action.
- **Downgrade behavior:** When `customer.subscription.deleted` fires, `isPro` is set to `false`. Existing file items are preserved in the DB — files remain accessible but the user can't upload new ones. You may want to add a grace period or soft-delete policy later.
- **No Stripe.js needed client-side** — Checkout is a server-side redirect to Stripe's hosted page. `@stripe/stripe-js` is only needed if building a custom card element (not needed here).
