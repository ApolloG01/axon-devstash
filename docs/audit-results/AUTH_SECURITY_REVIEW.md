# Auth Security Review
**Last audited:** 2026-05-03  
**Auditor:** auth-auditor agent  
**Scope:** Credentials auth, email verification, password reset, profile mutations

---

## Files Audited

- `src/actions/auth.ts` — credentials sign-in, registration, forgot password, reset password
- `src/actions/profile.ts` — change password, delete account
- `src/auth.ts` — NextAuth v5 configuration and authorize callback
- `src/auth.config.ts` — edge-safe config (Credentials placeholder + GitHub)
- `src/lib/resend.ts` — email sending helpers (verification + reset)
- `src/app/api/auth/verify-email/route.ts` — email verification GET endpoint
- `src/app/api/auth/register/route.ts` — REST registration endpoint (separate from Server Action)
- `src/app/(auth)/sign-in/page.tsx` and `sign-in-form.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/profile/change-password-form.tsx`
- `src/components/profile/delete-account-dialog.tsx`
- `src/proxy.ts` — route protection middleware
- `src/types/next-auth.d.ts`

---

## 🟠 HIGH

### No Rate Limiting on Any Auth Endpoint

- **Files:** `src/actions/auth.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/verify-email/route.ts`
- **Problem:** No rate limiting exists on any authentication endpoint: sign-in (`credentialsSignIn`), registration (`registerUser` and `POST /api/auth/register`), forgot-password (`requestPasswordReset`), or email verification (`GET /api/auth/verify-email`). No rate-limiting package (e.g., Upstash, `@vercel/kv`, `next-rate-limit`) is present in `package.json` or imported anywhere in the codebase.
- **Impact:** An attacker can brute-force sign-in credentials without throttling. The forgot-password endpoint can be abused to spam arbitrary email addresses. Token-guessing attacks against verification links are unconstrained. Registration can be flooded to accumulate pending-verification users in the database.
- **Fix:** Add rate limiting at the middleware/proxy layer or inside each Server Action. For a Neon/Vercel deployment, Upstash Redis with `@upstash/ratelimit` is the standard approach. At minimum, protect sign-in (e.g., 10 attempts per IP per 15 minutes) and forgot-password (e.g., 5 per IP per hour).

---

## 🟡 MEDIUM

### Password Minimum Length Not Enforced Server-Side at Registration

- **File:** `src/actions/auth.ts` (lines 41–74), `src/app/api/auth/register/route.ts` (lines 1–30)
- **Problem:** The `registerUser` Server Action checks only that the password field is non-empty (`if (!name || !email || !password)`). There is no `password.length < 8` guard in this path. The `POST /api/auth/register` route has the same gap. By contrast, `resetPassword` (line 125) and `changePassword` (profile.ts line 21) both correctly enforce `length < 8`. The register page also has no `minLength` attribute on the password `<Input>`, so there is no client-side enforcement either.
- **Impact:** A user can register with a one-character password. If the account is later discovered (e.g., via the enumeration issue below), such a weak password can be trivially cracked.
- **Fix:** Add the same guard used in `resetPassword` to `registerUser` and to the API register route:
  ```ts
  if (password.length < 8) return "Password must be at least 8 characters."
  ```
  Also add `minLength={8}` to the password `<Input>` in `register/page.tsx` for a consistent user experience.

### Email Enumeration via Unverified Account Check in credentialsSignIn

- **File:** `src/actions/auth.ts` (lines 17–19)
- **Problem:** Before delegating to NextAuth's `signIn()`, the action performs a pre-check:
  ```ts
  const user = await prisma.user.findUnique({ where: { email }, ... })
  if (user?.password && !user.emailVerified) {
    return "Please verify your email before signing in. Check your inbox."
  }
  ```
  This check fires **without verifying the password**. An attacker can submit any password with a target email. If the specific "verify your email" message is returned, the attacker learns (a) an account with that email exists, and (b) it was created via credentials (not OAuth-only). All other cases return the generic "Invalid email or password." message, so only unverified credential accounts are exposed.
- **Impact:** Targeted phishing and credential stuffing become more effective. An attacker probing email addresses can identify which ones have recently registered but not yet verified. The window is open until the user verifies their email (up to 24 hours).
- **Fix:** Move the unverified-email check into the `authorize` callback in `src/auth.ts`, where it already returns `null` for unverified accounts (line 40). Remove the pre-check from `credentialsSignIn` entirely. The generic NextAuth error "Invalid email or password." will cover this case without revealing account existence. If you need to surface a "check your inbox" hint, do so via a separate resend-verification flow that itself returns a uniform response regardless of whether the email exists.

### Token Namespace Collision Causes Unhandled 500 in verify-email

- **File:** `src/app/api/auth/verify-email/route.ts`
- **Problem:** The verification endpoint looks up a token by value and uses `record.identifier` directly as an email address for `prisma.user.update()`. It does not check whether the token belongs to a verification record (plain email identifier) or a password-reset record (identifier prefixed `password-reset:`). If a valid, unexpired password-reset token is submitted to this endpoint:
  1. The record is found and passes the expiry check.
  2. `prisma.user.update({ where: { email: "password-reset:user@example.com" } })` is called.
  3. No user has that email string, so Prisma throws `P2025 RecordNotFoundError`.
  4. The route has no `try/catch`, so Next.js returns a 500 response.
  5. The token is **not** deleted (the `delete` call is after the failed `update`), so the reset token is neither consumed nor invalidated by this misuse.
- **Impact:** This is not a privilege-escalation vector (no account gets verified), but it produces an unhandled 500 response visible to users, and it confirms to an attacker that the token is a reset token rather than a verification token (the normal path returns a redirect, not a 500). It could also be used to probe token type.
- **Fix:** Add a namespace guard before acting on the token, and wrap the handler in try/catch:
  ```ts
  if (record.identifier.startsWith("password-reset:")) {
    await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }
  ```

---

## 🔵 LOW

### API Register Route Does Not Trim Email Input

- **File:** `src/app/api/auth/register/route.ts` (line 7)
- **Problem:** The Server Action `registerUser` trims the email (`(formData.get("email") as string)?.trim()`), but the API route destructures the JSON body directly without trimming: `const { name, email, ... } = await req.json()`. A user who registers via the API with trailing whitespace in their email will store a subtly different email than intended, breaking subsequent lookup by the trimmed form.
- **Impact:** Low practical risk since registration is primarily done via the Server Action, but inconsistency between the two registration paths could create hard-to-debug authentication failures.
- **Fix:** Add `.trim()` to `email` (and `name`) when destructuring from the JSON body, mirroring the Server Action.

### Dashboard Layout Does Not Enforce Authentication Server-Side

- **File:** `src/app/(dashboard)/layout.tsx` (line 21), `src/app/(dashboard)/dashboard/page.tsx`
- **Problem:** The dashboard layout calls `auth()` but uses the result only to populate the `user` prop with a graceful fallback (`session?.user ?? { name: null, email: null, image: null }`). It does not redirect unauthenticated requests to `/sign-in`. The dashboard page uses a hardcoded demo user ID (`getDemoUserId()`) rather than the session user. Route protection depends entirely on `proxy.ts` running as Next.js middleware.
- **Impact:** If `proxy.ts` is ever misconfigured or bypassed, unauthenticated users can browse the dashboard and see the demo user's data. This is currently acceptable during development per the project's stated intent ("all features accessible to all users for testing"), but it must be resolved before production.
- **Note:** `proxy.ts` uses the correct Next.js 16 `proxy.ts` filename and `export const proxy` named export per the Next.js 16 convention. The build artifacts examined were stale (built before `proxy.ts` was created or last modified) and cannot be used to confirm or deny that the proxy is running. **Verify by running `npm run build` and checking that `/.next/server/middleware-manifest.json` contains a non-empty `middleware` object after the build.**
- **Fix (before production):** Add an explicit `redirect("/sign-in")` guard in the dashboard layout:
  ```ts
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  ```
  And replace the hardcoded demo user throughout the dashboard with `session.user.id`.

---

## ✅ Passed Checks

**A. Password Hashing**
- bcrypt cost factor is 12 in all three password-storage paths: `registerUser` (auth.ts line 57), `resetPassword` (auth.ts line 138), and `changePassword` (profile.ts line 35). Cost factor 12 meets and exceeds the minimum of 10.
- bcrypt is used exclusively — no MD5, SHA, or plaintext storage anywhere in the codebase.
- Password comparison uses `bcrypt.compare` in both `src/auth.ts` (authorize callback, line 37) and `src/actions/profile.ts` (changePassword, line 30). No string equality used.

**B. Token Generation**
- Both verification and reset tokens use `randomBytes(32).toString("hex")` from Node's `crypto` module (`src/actions/auth.ts` lines 60, 99). This provides 256 bits of entropy, well above the 128-bit minimum.
- Tokens are stored as-is (plain hex strings) in the `VerificationToken` table. No accidental predictability introduced by encoding or transformation.

**C. Token Expiration**
- Email verification tokens expire in 24 hours (`Date.now() + 24 * 60 * 60 * 1000`, auth.ts line 61). This is standard.
- Password reset tokens expire in 1 hour (`Date.now() + 60 * 60 * 1000`, auth.ts line 100). This is at or below the recommended maximum.
- Both endpoints check expiry server-side before acting: verify-email route line 13 (`record.expires < new Date()`); resetPassword line 129 (`record.expires < new Date()`).
- Expired tokens are deleted from the database after rejection in both paths (verify-email line 14; resetPassword line 130).

**D. Single-Use Enforcement**
- Email verification token is deleted immediately after successful verification (`src/app/api/auth/verify-email/route.ts` line 23).
- Password reset token is deleted immediately after successful password update (`src/actions/auth.ts` line 141).
- Requesting a new reset token deletes any existing reset token for that email first (`deleteMany` on line 97 of auth.ts), preventing token accumulation.

**E. Token Namespace Collision (partial)**
- Password reset tokens use a `password-reset:` prefix on the `identifier` field, distinct from verification tokens which use the bare email as identifier.
- The `resetPassword` action validates the prefix with `record.identifier.startsWith(RESET_PREFIX)` (auth.ts line 129), preventing a verification token from being used as a reset token.
- The gap (reset token submitted to verify-email endpoint) is covered in the MEDIUM finding above.

**F. Session Validation on Mutations**
- `changePassword` reads `userId` exclusively from `const session = await auth()` (profile.ts line 12–13). No `userId` parameter is accepted from form data.
- `deleteAccount` reads `userId` exclusively from the server-side session (profile.ts line 42–43). No client-supplied ID is trusted.
- Neither Server Action accepts any security-sensitive field from the client.

**G. Information Disclosure — Forgot Password**
- `requestPasswordReset` returns `null` (the "check your inbox" UI state) unconditionally whether the email exists, does not exist, or belongs to an OAuth-only account. No differentiated response leaks email existence in this flow.
- GitHub-only accounts (no `password` field) are silently skipped via `if (!user?.password) { return null }` (auth.ts line 92–94), indistinguishable from a non-existent email.

**H. Route Protection — Profile**
- `/profile` is protected at the page level by an explicit server-side auth check in `src/app/(dashboard)/profile/page.tsx` (lines 17–18): `const session = await auth(); if (!session?.user?.id) redirect("/sign-in")`. This provides defense-in-depth independent of middleware.
- `proxy.ts` includes `/profile` in its matcher and condition check.

**I. Input Validation — Email Trimming (Server Actions)**
- All four Server Actions trim email before database lookup: `credentialsSignIn` (auth.ts line 15), `registerUser` (auth.ts line 46), `requestPasswordReset` (auth.ts line 86). The API route gap is noted in the LOW finding.

**J. Password Length — Change Password and Reset Password**
- `changePassword` enforces `newPassword.length < 8` server-side (profile.ts line 21).
- `resetPassword` enforces `password.length < 8` server-side (auth.ts line 125).

---

## ℹ️ Not Checked (Out of Scope)

- **NextAuth-handled concerns:** CSRF protection on sign-in/sign-out, secure cookie flags (HttpOnly, SameSite, Secure), OAuth state parameter and PKCE, session cookie rotation, JWT signature verification. These are handled by NextAuth v5 and were not audited.
- **Stripe / subscription logic:** Not yet implemented; out of scope for this auth audit.
- **AI endpoints:** Rate limiting on AI features is a separate concern and not part of the auth surface.
- **Cloudflare R2 / file upload security:** Out of scope for this auth review.
- **Front-end XSS / Markdown sanitization:** Not part of the auth-specific audit scope.
- **OAuth token storage:** Handled by NextAuth's PrismaAdapter and not audited here.
