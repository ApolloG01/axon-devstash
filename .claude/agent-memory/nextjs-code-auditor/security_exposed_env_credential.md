---
name: Exposed .env credential
description: .env file with a real Neon DATABASE_URL (including password) exists on disk; .gitignore covers it but it was already in the working tree at audit time
type: project
---

The file `.env` (not `.env.local`) contains a real Neon PostgreSQL connection string with embedded credentials. The `.gitignore` pattern `.env*` should prevent it from being committed, but the file exists on disk and could have been committed before the ignore rule was in place. The credential should be rotated and the file renamed to `.env.local` per Next.js convention.

**Why:** Real database credentials in a committed or accidentally-staged file are a critical exposure risk.

**How to apply:** Always check that `.env` itself is not tracked by git before assuming .gitignore protects it. Recommend `.env.local` naming going forward.
