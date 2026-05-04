# Item Types

All 7 system item types in Axon DevStash. System types are seeded at startup (`prisma/seed.ts`), have `isSystem: true`, and cannot be deleted by users.

---

## Type Definitions

### Snippet

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_snippet` |
| Icon        | `Code` (Lucide) |
| Color       | `#3b82f6` (Blue) |
| Content type | `text` |
| Pro only    | No |

**Purpose**: Reusable code fragments — functions, hooks, patterns, boilerplate.

**Key fields**: `content` (the code text), `language` (e.g. `"typescript"`, `"dockerfile"`), `tags`.

---

### Prompt

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_prompt` |
| Icon        | `Sparkles` (Lucide) |
| Color       | `#8b5cf6` (Purple) |
| Content type | `text` |
| Pro only    | No |

**Purpose**: AI system prompts, instruction sets, and workflow templates for LLM use.

**Key fields**: `content` (the prompt text), `tags`. `language` is typically `null`.

---

### Command

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_command` |
| Icon        | `Terminal` (Lucide) |
| Color       | `#f97316` (Orange) |
| Content type | `text` |
| Pro only    | No |

**Purpose**: Shell commands, CLI one-liners, deployment scripts, and terminal workflows.

**Key fields**: `content` (the command string), `language` (typically `"bash"`), `tags`.

---

### Note

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_note` |
| Icon        | `StickyNote` (Lucide) |
| Color       | `#fde047` (Yellow) |
| Content type | `text` |
| Pro only    | No |

**Purpose**: Freeform text notes, markdown documentation, written references.

**Key fields**: `content` (markdown text), `tags`. `language` is typically `null`.

---

### File

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_file` |
| Icon        | `File` (Lucide) |
| Color       | `#6b7280` (Gray) |
| Content type | `file` |
| Pro only    | Yes |

**Purpose**: Uploaded files (PDFs, configs, context files, documents) stored in Cloudflare R2.

**Key fields**: `fileUrl` (R2 URL), `fileName` (original filename), `fileSize` (bytes). `content` and `url` are `null`.

---

### Image

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_image` |
| Icon        | `Image` (Lucide) |
| Color       | `#ec4899` (Pink) |
| Content type | `file` |
| Pro only    | Yes |

**Purpose**: Uploaded images (screenshots, diagrams, design references) stored in Cloudflare R2.

**Key fields**: `fileUrl` (R2 URL), `fileName`, `fileSize`. `content` and `url` are `null`.

---

### Link

| Property    | Value       |
| ----------- | ----------- |
| DB ID       | `type_link` |
| Icon        | `Link` (Lucide) |
| Color       | `#10b981` (Emerald) |
| Content type | `url` |
| Pro only    | No |

**Purpose**: Bookmarked URLs — documentation pages, tools, references, external resources.

**Key fields**: `url` (the full URL string). `content`, `fileUrl`, `fileName`, `fileSize` are all `null`.

---

## Summaries

### Content Type Classification

The `contentType` field on `Item` determines which storage fields are used:

| `contentType` | Active fields         | Types that use it        |
| ------------- | --------------------- | ------------------------ |
| `"text"`      | `content`, `language` | snippet, prompt, command, note |
| `"file"`      | `fileUrl`, `fileName`, `fileSize` | file, image |
| `"url"`       | `url`                 | link |

A single item uses only one content type — the other fields are `null`.

### Shared Properties

All 7 types share these `Item` fields regardless of content type:

- `id`, `title`, `description`
- `isFavorite`, `isPinned`
- `lastUsedAt` (for recently used tracking)
- `userId` (owner), `itemTypeId` (type reference)
- `tags` (many-to-many via `Tag`)
- `collections` (many-to-many via `ItemCollection`)
- `createdAt`, `updatedAt`

### Display Differences

| Aspect          | text types (snippet/prompt/command/note) | file types (file/image) | url type (link) |
| --------------- | ---------------------------------------- | ----------------------- | --------------- |
| Primary display | Rendered `content` (code block or markdown) | File preview / download link | Clickable URL with favicon |
| Language badge  | Yes (when `language` set)                | No                      | No |
| Copy action     | Copy text content                        | Download file           | Copy URL |
| Pro gate        | No                                       | Yes                     | No |

### Icon Map (runtime)

Icons are resolved at runtime via `src/constants/icon-map.ts`:

```ts
ICON_MAP["Code"]      // snippet
ICON_MAP["Sparkles"]  // prompt
ICON_MAP["Terminal"]  // command
ICON_MAP["StickyNote"] // note
ICON_MAP["File"]      // file
ICON_MAP["Image"]     // image
ICON_MAP["Link"]      // link
```

The `icon` field stored in `ItemType.icon` is the string key looked up in `ICON_MAP`.
