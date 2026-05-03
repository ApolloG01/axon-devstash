---
name: Exposed .env credential
description: .env (not .env.local) contains a real Neon PostgreSQL password; .gitignore covers it but the credential should be rotated
type: project
---

`.env` line 2 contains a full Neon connection string including username and password for `ep-tiny-firefly-al3vrt0s-pooler.c-3.eu-central-1.aws.neon.tech`. The `.gitignore` pattern `.env*` prevents future commits, but if this file was ever staged before the ignore rule existed, the credential is in git history.

**Why:** Live database credentials must be rotated whenever there is any doubt about exposure.

**How to apply:** Recommend the user check `git log --all -- .env` to verify it was never committed. If it was, rotate the credential immediately in the Neon console.
