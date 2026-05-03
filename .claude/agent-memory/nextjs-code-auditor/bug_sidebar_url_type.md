---
name: Sidebar type URL construction
description: sidebar-content.tsx builds hrefs as /items/${type.name}s which produces /items/links and /items/images correctly but /items/notes and /items/snippets — need to verify all are valid routes
type: project
---

In `src/components/layout/sidebar-content.tsx` line 74, hrefs are built as `` `/items/${type.name}s` `` (appending literal 's'). This produces:
- /items/snippets, /items/prompts, /items/commands, /items/notes, /items/files, /items/images, /items/links

The routes don't exist yet (dashboard is the only route), so this can't break currently. When routes are built, "note" → "/items/notes" is fine, "link" → "/items/links" is fine, but the naive pluralisation will fail for "snippet" → "snippets" (correct) and would fail for any irregular plural. Flag for review when item type routes are built.

**How to apply:** When item type routes are implemented, ensure the URL slug logic is centralised rather than constructed inline in the sidebar.
