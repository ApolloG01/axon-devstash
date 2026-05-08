# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Overview

Wire up the Stripe webhook endpoint, enforce Pro-only gates on the upload route and `NewItemDialog`, and add the Billing section to the Settings page. This phase requires the Stripe CLI (`stripe listen`) for local end-to-end testing.

## Prerequisites

- Phase 1 complete: `isPro` in session, `src/lib/stripe.ts`, `src/actions/billing.ts`, Free-tier limits in actions
- Stripe CLI installed locally
- Stripe Dashboard: products created, price IDs in `.env`, customer portal configured, webhook endpoint registered

## Requirements

- Create `POST /api/stripe/webhook` — raw body, signature verification, `checkout.session.completed` and `customer.subscription.deleted` handlers
- Gate `POST /api/upload` — return 403 for Free users
- Gate file/image types in `NewItemDialog` — hide for Free users
- Add Billing section to `/settings` — upgrade flow for Free, manage billing for Pro
- Show "Welcome to Pro" toast when `?upgraded=1` is present in settings URL

## Files to Create

1. `src/app/api/stripe/webhook/route.ts` — webhook handler
2. `src/components/settings/billing-section.tsx` — Billing UI (`"use client"`)

## Files to Modify

| File | Change |
|------|--------|
| `src/app/api/upload/route.ts` | Add `!session.user.isPro` → 403 guard before any processing |
| `src/app/(dashboard)/settings/page.tsx` | Extend user select with `isPro` + `stripeCustomerId`, import `BillingSection`, add `upgraded` toast |
| `src/components/items/new-item-dialog.tsx` | Filter `itemTypes` prop — hide `file` and `image` for Free users |

## Implementation Notes

### Webhook Route (`src/app/api/stripe/webhook/route.ts`)

- Read raw body via `req.text()` — do NOT use `req.json()`
- Verify with `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)`
- Return 400 on missing signature or invalid signature
- Handle `checkout.session.completed`: update `isPro`, `stripeCustomerId`, `stripeSubscriptionId` for `session.metadata.userId`
- Handle `customer.subscription.deleted`: set `isPro = false`, `stripeSubscriptionId = null` via `updateMany` on subscription ID
- Handle `invoice.payment_failed`: no-op (Stripe retries automatically)
- The `config = { api: { bodyParser: false } }` export is NOT required in App Router — raw body is already available via `req.text()`

### Upload Route Gate

Add immediately after the auth check, before any file processing:

```ts
if (!session.user.isPro) {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription." },
    { status: 403 }
  )
}
```

### `NewItemDialog` Gating

The dialog already receives `itemTypes` as a prop from the server component that renders it. Filter before passing:

```ts
const visibleTypes = session.user.isPro
  ? itemTypes
  : itemTypes.filter((t) => t.name !== "file" && t.name !== "image")
```

Pass `visibleTypes` instead of `itemTypes` to `<NewItemDialog>`.

### `BillingSection` Component (`"use client"`)

Props: `{ isPro: boolean; hasStripeCustomer: boolean }`

- **Free state**: interval toggle (Monthly $8/mo | Yearly $72/yr) + "Upgrade to Pro" button → calls `createCheckoutSession(interval)`
- **Pro state**: "Pro — active subscription" label + "Manage Billing" button (only if `hasStripeCustomer`) → calls `createBillingPortalSession()`
- Both actions redirect on success; show `toast.error(result.error)` on returned failure

### Settings Page Changes

Extend the existing user query:

```ts
select: { password: true, isPro: true, stripeCustomerId: true }
```

Add to `searchParams` destructure: `upgraded`

Render after existing sections:

```tsx
<Separator />
<section className="space-y-4">
  <div>
    <h2 className="text-sm font-semibold">Billing</h2>
    <p className="text-xs text-muted-foreground mt-0.5">Manage your Pro subscription.</p>
  </div>
  <BillingSection isPro={user.isPro} hasStripeCustomer={!!user.stripeCustomerId} />
</section>
{upgraded === "1" && <PageToast message="Welcome to Pro! Your account has been upgraded." />}
```

## Stripe Dashboard Setup (one-time)

1. **Products** → create "DevStash Pro Monthly" ($8/mo) and "DevStash Pro Yearly" ($72/yr) → copy Price IDs to `.env`
2. **Customer Portal** → Settings → Billing → enable cancel + update payment, set return URL to `http://localhost:3000/settings`
3. **Webhook** → Developers → Webhooks → Add endpoint: `https://your-domain.com/api/stripe/webhook`, events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

## Testing (Requires Stripe CLI)

### Setup

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Checklist

- [ ] Checkout flow completes → DB `isPro` flips to `true`
- [ ] Page reload shows "Pro — active subscription" in Settings (session synced via JWT callback)
- [ ] `?upgraded=1` shows "Welcome to Pro" toast
- [ ] "Manage Billing" button opens Stripe customer portal
- [ ] Cancel subscription in portal → `customer.subscription.deleted` fires → `isPro` flips to `false`
- [ ] Free user: file/image types hidden in `NewItemDialog`
- [ ] Free user: `POST /api/upload` returns 403
- [ ] Pro user: file/image types visible, upload succeeds
- [ ] Invalid Stripe signature → 400, no DB writes (test by sending a bad `stripe-signature` header)
- [ ] Already-Pro user clicking Upgrade → "Already Pro" toast (action returns early)
- [ ] Webhook with unknown `userId` in metadata → no DB update, no crash

### Trigger Events Manually

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

## Edge Cases

- GitHub OAuth users (no password) start checkout — `customer_email` pre-filled from `user.email`
- User with existing `stripeCustomerId` re-subscribes — `customer` field used instead of `customer_email`
- Webhook arrives before `createCheckoutSession` returns — idempotent `update` is safe
