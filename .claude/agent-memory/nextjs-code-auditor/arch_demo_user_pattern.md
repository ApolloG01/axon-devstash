---
name: Demo user hardcoding pattern
description: All DB queries use getDemoUserId() / getDemoUserCollections() which hardcode demo@devstash.io; intentional placeholder until Next-Auth v5 is implemented
type: project
---

`src/lib/db/items.ts` and `src/lib/db/collections.ts` both contain `getDemoUserId()` / `getDemoUserCollections()` that look up the demo user by email. This is explicitly marked "Temporary until auth is implemented" in comments. Do not flag as a missing feature — it is deliberate scaffolding.

**Why:** Auth (Next-Auth v5) is not yet built per the project roadmap.

**How to apply:** When auditing data-fetching code, note the demo pattern but do not count absence of real auth as a security finding — only flag it if the scaffolding itself introduces a new risk (e.g., the double DB query cost).
