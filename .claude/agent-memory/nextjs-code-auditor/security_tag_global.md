---
name: Tag global namespace
description: The Tag model has no userId; tags are shared globally across all users, which leaks tag names between accounts
type: project
---

`prisma/schema.prisma` defines `Tag` with only `id`, `name` (unique), and `items`. There is no `userId` on tags. This means all users share a single global tag namespace. When auth is implemented, any user can see that a tag name exists (via connectOrCreate) that was created by another user. Tag names themselves may contain sensitive terminology.

**Why:** This is a data privacy issue that becomes exploitable once real multi-user auth is in place.

**How to apply:** Flag as a MEDIUM architectural issue now; escalate to HIGH before auth goes live.
