# Memory Index

- [Exposed .env credential](security_exposed_env_credential.md) — DATABASE_URL with real credentials committed to .env (not .env.local); .gitignore covers .env* but the file exists in the working tree
- [Demo user hardcoding pattern](arch_demo_user_pattern.md) — All data queries are hardcoded to demo@devstash.io; confirmed intentional until auth is built
- [getDemoUserCollections N+1 risk](perf_collections_n1.md) — getCollectionsByUserId fetches all items per collection including full itemType; acceptable now but will degrade at scale
- [force-dynamic placement](quality_force_dynamic_placement.md) — export const dynamic placed after imports in dashboard/page.tsx; must be first statement
- [sidebar URL construction bug](bug_sidebar_url_type.md) — Sidebar appends 's' to type.name for href but link and note don't pluralise correctly
- [Tag global namespace leak](security_tag_global.md) — Tags table has no userId; tags are global across all users, enabling enumeration
- [prisma.ts uses non-null assertion on DATABASE_URL](quality_prisma_env_assertion.md) — DATABASE_URL! will throw a cryptic runtime error if env var is missing
