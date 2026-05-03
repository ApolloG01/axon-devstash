---
name: getCollectionsByUserId performance profile
description: Collections query includes all ItemCollection rows with full itemType; computes accent color in JS rather than SQL; not a true N+1 but will degrade at scale
type: project
---

`getCollectionsByUserId` in `src/lib/db/collections.ts` fetches every `ItemCollection` row for every collection, including the full `itemType` sub-select. This is a single SQL query (Prisma joins) but returns a large payload that grows with item count per collection. The accent-color computation is done in JS by iterating all items. For the current scale (seed data: ~18 items) this is fine.

**Why:** Noted for future optimization when collections can have hundreds of items. Consider a `groupBy` aggregation query or a denormalized `accentColor` column.

**How to apply:** Don't flag as a current HIGH but watch it as the data set grows.
