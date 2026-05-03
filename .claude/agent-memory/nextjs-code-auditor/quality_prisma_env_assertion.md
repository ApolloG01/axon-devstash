---
name: Prisma DATABASE_URL non-null assertion
description: src/lib/prisma.ts uses DATABASE_URL! which throws a confusing runtime error if the env var is missing
type: project
---

`src/lib/prisma.ts` line 7 uses `process.env.DATABASE_URL!`. If the env var is absent (e.g., misconfigured deployment), the PrismaPg constructor throws a cryptic error rather than a clear "DATABASE_URL is not set" message. A guard with an explicit throw would improve debuggability.

**How to apply:** Suggest adding: `if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set")` before the adapter instantiation.
