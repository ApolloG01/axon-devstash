# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe SDK, extend the session with `isPro`, create the Stripe client singleton, scaffold billing server actions, and enforce Free-tier limits in `createItem` / `createCollection`. All logic in this phase is testable without a running Stripe CLI.

## Requirements

- Install `stripe` and `@stripe/stripe-js`
- Extend `Session` and `JWT` types with `isPro`
- Add JWT + session callbacks to `src/auth.ts` that always sync `isPro` from the DB
- Create `src/lib/stripe.ts` with the Stripe client singleton and price ID constants
- Create `src/actions/billing.ts` with `createCheckoutSession` and `createBillingPortalSession`
- Enforce item count limit (50) in `createItem`
- Enforce collection count limit (3) in `createCollection`
- Add `NEXT_PUBLIC_APP_URL` to `.env`
- Write Vitest unit tests for the usage-limits module

## Files to Create

1. `src/lib/stripe.ts` — Stripe client + `STRIPE_PRICES` constants
2. `src/actions/billing.ts` — `createCheckoutSession(interval)` + `createBillingPortalSession()`
3. `src/lib/usage-limits.ts` — pure helper functions for Free-tier checks (unit-testable)
4. `src/lib/usage-limits.test.ts` — Vitest tests for the helper

## Files to Modify

| File | Change |
|------|--------|
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to `Session["user"]` and `JWT` |
| `src/auth.ts` | Add `jwt` callback (always-sync `isPro` from DB) + `session` callback |
| `src/actions/items.ts` | Call `checkItemLimit` before `createItemInDb` |
| `src/actions/collections.ts` | Call `checkCollectionLimit` before `createCollectionInDb` |
| `.env` | Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` |

## Implementation Notes

### `src/types/next-auth.d.ts`

```ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: { id: string; isPro: boolean } & DefaultSession["user"]
  }
}
declare module "next-auth/jwt" {
  interface JWT { isPro?: boolean }
}
```

### `src/auth.ts` — JWT callback

Always sync `isPro` from the DB on every session validation so a page reload picks up webhook-driven changes without a logout/login cycle:

```ts
async jwt({ token, user }) {
  if (user) token.sub = user.id
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
```

### `src/lib/stripe.ts`

```ts
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set")

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
})

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const
```

### `src/lib/usage-limits.ts`

Extract the count-check logic into pure async functions that take a `prisma` + `userId`:

```ts
export async function checkItemLimit(userId: string): Promise<string | null>
export async function checkCollectionLimit(userId: string): Promise<string | null>
```

Return `null` if within limits, an error string if over. Keeps actions thin and limits unit-testable.

### `src/actions/billing.ts`

Follow the existing `{ success, error }` return pattern. `redirect()` is called on success so the function only returns on failure:

```ts
export async function createCheckoutSession(interval: "monthly" | "yearly")
export async function createBillingPortalSession()
```

## Unit Tests (`src/lib/usage-limits.test.ts`)

Use the existing Vitest + Prisma mock pattern from `docs/testing.md`.

Cover these cases for `checkItemLimit`:
- Free user under limit → returns `null`
- Free user at limit (50) → returns error string
- Pro user at limit (50+) → returns `null` (no check)

Cover these cases for `checkCollectionLimit`:
- Free user under limit → returns `null`
- Free user at limit (3) → returns error string
- Pro user at limit (3+) → returns `null`

## Environment Variables

```
# already in .env — just need values:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# new:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing (Manual)

1. Sign in and confirm `session.user.isPro` is `false` (check via a console log in a server component)
2. Seed 50 items for a Free user → creating a 51st should return the limit error
3. Seed 3 collections → creating a 4th should return the limit error
4. Manually flip `isPro = true` in the DB → reload → limit checks should be skipped
5. `npm test` — all usage-limits tests pass

## Out of Scope (Phase 2)

- Webhook route
- `BillingSection` UI component
- Upload route Pro gate
- `NewItemDialog` file/image gating
- Stripe CLI testing
