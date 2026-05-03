---
name: force-dynamic export placement
description: export const dynamic = "force-dynamic" appears before imports in dashboard/page.tsx but after the module boundary — Next.js requires it to be the first export in the file
type: project
---

In `src/app/(dashboard)/dashboard/page.tsx` line 1, `export const dynamic = "force-dynamic"` is placed before imports. This is actually correct Next.js convention (route segment config must be exported from the route module). However, if it were ever moved after any logic, the segment config would still be read correctly by Next.js — but it reads cleaner at the top.

**How to apply:** The current placement is fine. Do not flag as an error.
