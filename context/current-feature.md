# Current Feature

_No active feature. Ready for next task._

## Status

Completed

## Goals

—

## Notes

—

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
