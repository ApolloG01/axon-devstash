# Item CRUD Architecture

Design for the unified CRUD system across all 7 item types (snippet, prompt, command, note, link, file, image).

---

## Guiding Principles

- **One action file** handles all mutations. No per-type action files.
- **lib/db** handles all reads, called directly from server components.
- **contentType drives variation** (`"text"` / `"file"` / `"url"`), not the type name.
- **Type-specific logic lives in components**, not in actions or queries.
- **Auth enforced in every mutation** via `auth()` from `@/auth` — never trust client-passed user IDs.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # All item mutations (create, update, delete, toggle)
│
├── lib/db/
│   └── items.ts                  # All item queries (already exists — extend it)
│
├── app/(dashboard)/
│   └── items/
│       └── [type]/
│           └── page.tsx          # One dynamic route for all 7 types
│
└── components/
    └── items/
        ├── item-list.tsx         # Grid of ItemCard components
        ├── item-card.tsx         # (move from components/dashboard/) — single card display
        ├── item-drawer.tsx       # Right-side drawer: view + quick actions
        ├── item-form.tsx         # Create / edit form — adapts by contentType
        ├── item-content.tsx      # Content preview — adapts by contentType
        └── item-actions.tsx      # Favorite / pin / delete / copy buttons
```

---

## Routing: `/items/[type]`

`[type]` is the item type name string — one of: `snippet`, `prompt`, `command`, `note`, `link`, `file`, `image`.

```
/items/snippet   →  shows all snippets
/items/prompt    →  shows all prompts
/items/command   →  shows all commands
/items/note      →  shows all notes
/items/link      →  shows all links
/items/file      →  shows all files      (Pro gate)
/items/image     →  shows all images     (Pro gate)
```

The sidebar already links to these URLs (`/items/TYPE`).

### `app/(dashboard)/items/[type]/page.tsx`

```ts
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getItemsByType } from "@/lib/db/items"
import { ItemList } from "@/components/items/item-list"

const VALID_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"]

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) notFound()

  const session = await auth()
  if (!session?.user?.id) notFound()

  const items = await getItemsByType(session.user.id, type)

  return <ItemList items={items} type={type} />
}
```

---

## Data Fetching — `src/lib/db/items.ts`

Extend the existing file with these queries. All functions take `userId` so they are safe to call from any server component.

```ts
// Existing queries (already implemented):
getPinnedItems(userId)
getRecentItems(userId, limit?)
getItemStats(userId)
getSystemItemTypes()

// New queries to add:
getItemsByType(userId: string, typeName: string): Promise<ItemWithType[]>
getItemById(userId: string, id: string): Promise<ItemFull | null>
getFavoriteItems(userId: string): Promise<ItemWithType[]>
searchItems(userId: string, query: string): Promise<ItemWithType[]>
```

### `ItemFull` type (for single-item view/edit)

```ts
export type ItemFull = {
  id: string
  title: string
  description: string | null
  contentType: string        // "text" | "file" | "url"
  content: string | null     // text types
  language: string | null    // snippet / command
  fileUrl: string | null     // file / image types
  fileName: string | null
  fileSize: number | null
  url: string | null         // link type
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: Date
  createdAt: Date
  updatedAt: Date
  itemType: { id: string; name: string; color: string; icon: string }
  tags: Array<{ name: string }>
  collections: Array<{ collection: { id: string; name: string } }>
}
```

---

## Mutations — `src/actions/items.ts`

Single file, `"use server"` directive. Every action calls `auth()` first.

Return type for all mutations:

```ts
type ActionResult = { success: true } | { success: false; error: string }
```

### Action signatures

```ts
// Create — contentType-specific fields passed in formData
createItem(prevState: ActionResult | null, formData: FormData): Promise<ActionResult>

// Update — same as create but includes the item id
updateItem(prevState: ActionResult | null, formData: FormData): Promise<ActionResult>

// Delete
deleteItem(id: string): Promise<ActionResult>

// Toggles (called from buttons, not forms)
toggleFavorite(id: string): Promise<ActionResult>
togglePinned(id: string): Promise<ActionResult>

// Touch lastUsedAt (called when drawer opens)
touchLastUsed(id: string): Promise<void>
```

### `createItem` logic

```ts
export async function createItem(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Not authenticated." }

  const title   = (formData.get("title") as string)?.trim()
  const typeId  = formData.get("itemTypeId") as string
  const contentType = formData.get("contentType") as string  // "text" | "file" | "url"

  // Validate ownership of itemTypeId (must be a system type or belong to this user)
  // Validate required fields by contentType
  // Create item in DB
  // Return { success: true } — caller revalidates path or uses router.refresh()
}
```

### Auth enforcement pattern

Every mutation follows this pattern — no exceptions:

```ts
const session = await auth()
if (!session?.user?.id) return { success: false, error: "Not authenticated." }
const userId = session.user.id

// For update/delete/toggle: verify ownership before touching the record
const item = await prisma.item.findUnique({ where: { id }, select: { userId: true } })
if (!item || item.userId !== userId) return { success: false, error: "Not found." }
```

---

## Component Responsibilities

### `ItemList`

Server-compatible display wrapper. Receives `items` and `type` as props.

- Renders the page header (type name, item count, "New Item" button)
- Renders a responsive grid of `ItemCard` components
- Handles empty state ("No snippets yet. Create your first one.")

```ts
// 'use client' not required — pure display
function ItemList({ items, type }: { items: ItemWithType[]; type: string })
```

### `ItemCard`

Already exists at `src/components/dashboard/item-card.tsx`. Move to `src/components/items/item-card.tsx` and extend:

- Left accent bar colored by `itemType.color`
- Title, description, content preview (truncated)
- Type badge, language badge, tag pills
- Favorite star indicator
- `onClick` → opens `ItemDrawer`

No mutations. Read-only display.

### `ItemDrawer`

Client component. Slides in from the right when a card is clicked.

- Calls `touchLastUsed(item.id)` on open
- Renders `ItemContent` for the full content view
- Renders `ItemActions` (favorite, pin, edit, delete)
- "Edit" button opens `ItemForm` in edit mode within the drawer

```ts
'use client'
function ItemDrawer({ item }: { item: ItemFull })
```

### `ItemContent`

Adapts to `contentType` — the only place type-rendering logic lives:

| `contentType` | What renders |
| ------------- | ------------ |
| `"text"`      | Syntax-highlighted code block (snippet/command) or markdown (note/prompt) |
| `"file"`      | File name + size + download button; image types show `<img>` preview |
| `"url"`       | Clickable anchor with favicon, URL displayed below |

```ts
function ItemContent({ item }: { item: ItemFull })
// No 'use client' needed unless copying to clipboard
```

### `ItemForm`

Client component (uses `useActionState` for form state). Used for both create and edit.

**Shared fields** (all types):

- `title` (required)
- `description`
- `itemTypeId` (hidden when editing, select when creating)
- `tags` (comma-separated or tag input)

**Conditional fields** driven by `contentType`:

| `contentType` | Extra fields |
| ------------- | ------------ |
| `"text"`      | `content` textarea (required) + `language` select (snippet/command only) |
| `"file"`      | File upload input (required on create) |
| `"url"`       | `url` input (required) |

The `contentType` is derived from the selected `itemTypeId` — the form resolves it by looking up the type from the already-loaded `ItemType` list (passed as a prop).

```ts
'use client'
function ItemForm({
  itemTypes: ItemType[],
  defaultTypeId?: string,   // pre-selected when opened from a type page
  item?: ItemFull,          // undefined = create mode, defined = edit mode
  onSuccess: () => void,
})
```

### `ItemActions`

Client component. Renders the action buttons for an item.

- **Favorite** → calls `toggleFavorite(id)` then `router.refresh()`
- **Pin** → calls `togglePinned(id)` then `router.refresh()`
- **Copy** → copies `content` or `url` to clipboard (no server call)
- **Delete** → calls `deleteItem(id)` then closes drawer + `router.refresh()`

```ts
'use client'
function ItemActions({ item: ItemFull })
```

---

## Type-Specific Logic Summary

Type-specific behavior is isolated to three locations only:

| Location | What it handles |
| -------- | --------------- |
| `ItemContent` | How content is rendered (code block / file preview / link) |
| `ItemForm` | Which fields appear based on `contentType` |
| `ItemCard` | Language badge (shown only when `language` is non-null) |

Actions and DB queries are type-agnostic — they work with the generic `Item` model and `contentType` field.

---

## Data Flow Summary

```
User clicks "New Item"
  → ItemForm (create mode) renders with itemTypes prop
  → user fills form, submits
  → createItem() server action runs
  → revalidatePath("/items/[type]") or router.refresh()
  → ItemTypePage re-fetches via getItemsByType()
  → ItemList re-renders with new item

User clicks item card
  → ItemDrawer opens
  → touchLastUsed() called
  → ItemContent renders based on contentType
  → ItemActions rendered

User clicks favorite
  → toggleFavorite() server action
  → router.refresh() updates card star state
```
