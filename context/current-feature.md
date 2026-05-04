# Current Feature

## Status

<!-- Not Started | In Progress | Complete -->

## Goals

<!--  List goals here -->

## Notes

<!--  Additional context, constraints, or implementation details -->

## History

<!--  Keep this updated. Earliest to latest -->

- **2026-04-22**: Initial Next.js 15 + Tailwind CSS v4 setup. Scaffolded project, configured CLAUDE.md, added context files, pushed to GitHub.
- **2026-04-22**: Started Dashboard UI Phase 1 — shadcn/ui init, dashboard route, top bar, layout placeholders.
- **2026-04-23**: Completed Dashboard UI Phase 1 — shadcn/ui initialized with Button and Input components, `/dashboard` route created, dark mode configured as default, top bar with search input and "New Item" button built (display only), placeholder sidebar and main content areas in place.
- **2026-04-23**: Started Dashboard UI Phase 2 — collapsible sidebar, item types, collections, user avatar, mobile drawer.
- **2026-04-23**: Completed Dashboard UI Phase 2 — collapsible sidebar with toggle button, item types with colored icons linking to `/items/TYPE`, favorite and recent collections sections, user avatar area at bottom, mobile Sheet drawer support.
- **2026-04-23**: Started Dashboard UI Phase 3 — main content area, stats cards, recent collections, pinned items, recent items.
- **2026-04-23**: Completed Dashboard UI Phase 3 — 4 stats cards, collections grid with type color accents, pinned items section, recent items grid with type badges and tags.
- **2026-04-24**: Started Prisma + Neon PostgreSQL setup — install Prisma 7, define schema, create initial migration.
- **2026-04-24**: Completed Prisma + Neon PostgreSQL setup — Prisma 7 configured with PrismaPg adapter, full schema defined, initial migration applied, system item types seeded via prisma/seed.ts.
- **2026-04-24**: Started Seed Data — demo user, system item types, collections, and items per seed-spec.md.
- **2026-04-24**: Completed Seed Data — demo user (demo@devstash.io), 7 system item types, 5 collections, 18 items, 31 tags seeded via prisma/seed.ts.
- **2026-04-24**: Started Dashboard Collections — replace mock data with real Prisma queries, type color accents, type icons per collection.
- **2026-04-24**: Completed Dashboard Collections — src/lib/db/collections.ts created, collections fetched from Neon in server component, accent color derived from most-used type, type icons displayed per card, collection stats updated to live data.
- **2026-04-24**: Started Dashboard Items — replace mock item data with real Prisma queries for pinned and recent items.
- **2026-04-24**: Completed Dashboard Items — src/lib/db/items.ts created, pinned and recent items fetched from Neon, all stats live from DB, page set to force-dynamic to ensure fresh data on every request.
- **2026-04-24**: Started Dashboard Stats & Sidebar from Database — replace sidebar mock data with real Prisma queries.
- **2026-04-24**: Completed Dashboard Stats & Sidebar from Database — sidebar now fetches item types and collections from DB, data passed server → client via props, colored circles for recent collections, Types and Collections section labels added, fixed wrong demo user email in getDemoUserCollections().
- **2026-04-28**: Completed Add Pro Badge to Sidebar — installed shadcn/ui Badge component, added subtle outline PRO badge next to Files and Images in the sidebar item types list, hidden when sidebar is collapsed.
- **2026-04-29**: Completed Code Quality Quick Wins — DATABASE_URL guard with explicit error throw, shared ICON_MAP constant, consolidated getDemoUserId with React cache(), fixed recentCollections ordering, root route redirect to /dashboard, APP_NAME constant, sidebar font-size typo fix.
- **2026-04-29**: Completed Auth Setup — NextAuth v5 (next-auth@beta) installed with @auth/prisma-adapter, split auth config for edge compatibility (auth.config.ts + auth.ts), GitHub OAuth provider added, src/proxy.ts guards /dashboard/* routes with redirect to sign-in, Session extended with user.id, AUTH_SECRET generated and added to .env.
- **2026-04-29**: Completed Auth Credentials — Credentials provider added to auth.config.ts (edge-safe placeholder) and auth.ts (bcrypt validation), POST /api/auth/register created with duplicate-email (409) and password-match (400) guards, both GitHub and email/password sign-in working on default NextAuth page.
- **2026-04-30**: Completed Auth UI — Custom /sign-in and /register pages using Server Actions (secure POST, no credentials in URL), UserAvatar component (GitHub image or initials fallback), UserMenu sidebar dropdown with sign-out, sonner toasts for register/login/sign-out events (top-center, richColors).
- **2026-05-03**: Completed Email Verification on Register — Resend integration for verification emails, VerificationToken stored in DB (24h expiry), GET /api/auth/verify-email endpoint, unverified accounts blocked from sign-in with clear error, verified/error/registered toasts on sign-in page, dev terminal URL logging for local testing.
- **2026-05-03**: Completed Forgot Password — /forgot-password and /reset-password pages, reset tokens in VerificationToken with password-reset: prefix (1h expiry), bcrypt password update, success toast on sign-in, OAuth accounts silently skipped, dev terminal URL logging.
- **2026-05-03**: Completed Profile Page — /profile route (protected), user info with avatar, usage stats with per-type breakdown, change password form (credentials accounts only), delete account with AlertDialog confirmation.
- **2026-05-03**: Completed Rate Limiting for Auth — src/lib/rate-limit.ts created with Upstash Redis sliding window (fail-open on error); credentialsSignIn limited to 5/15min/IP+email, registerUser and /api/auth/register limited to 3/1h/IP, requestPasswordReset limited to 3/1h/IP; 429 + Retry-After header on API route; inline error surfaced on all auth forms.
- **2026-05-04**: Completed Items List View — dynamic `/items/[type]` route, `getItemsByType(userId, typeName)` query, plural-slug→DB-name mapping, auth via `auth()`, 404 on unknown type, responsive 2-column grid of `ItemCard`, `/items/*` added to proxy middleware matcher.
- **2026-05-04**: Completed Vitest Setup — vitest + vite-tsconfig-paths installed, `vitest.config.ts` configured for node environment, `npm test` / `npm run test:watch` scripts added, `src/lib/utils.test.ts` verifies setup, `docs/testing.md` documents server action mocking pattern, workflow updated to require `npm test` before commit.
- **2026-05-04**: Completed Item List 3-Column Layout — items grid on `/items/[type]` updated to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for responsive 1→2→3 column layout.
