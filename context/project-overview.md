# Axon - DevStash Project Overview

## 🎯 Core Problem

Developers face fragmented knowledge management:

- Code snippets scattered in VS Code, Notion, gists
- AI prompts lost in chat histories
- Context files buried in project folders
- Useful links hidden in browser bookmarks
- Documentation in random folders
- Commands forgotten in bash history
- Project templates spread across repositories

**DevStash Solution**: A unified, fast, searchable, AI-enhanced hub for all development knowledge and resources.

---

## 👥 Target Users

### Everyday Developer
Quick access to snippets, prompts, commands, and links during daily work.

### AI-First Developer
Centralized storage for prompts, context files, workflows, and system messages.

### Content Creator / Educator
Organized repository for code blocks, explanations, tutorials, and course materials.

### Full-Stack Builder
Collection of patterns, boilerplates, API examples, and reusable components.

---

## 🎨 Feature Overview

### A. Items & Item Types

Items are the core content units in DevStash. Each item has a type that determines its behavior and appearance.

#### System Types (Non-editable)

| Type | Content Type | URL Pattern | Pro Only |
|------|--------------|-------------|----------|
| **Snippet** | Text | `/items/snippets` | No |
| **Prompt** | Text | `/items/prompts` | No |
| **Note** | Text | `/items/notes` | No |
| **Command** | Text | `/items/commands` | No |
| **Link** | URL | `/items/links` | No |
| **File** | File Upload | `/items/files` | Yes |
| **Image** | File Upload | `/items/images` | Yes |

**Future**: Custom types (Pro feature, post-MVP)

#### Item Quick Access
Items should be accessible via a drawer interface for rapid creation and viewing without full page navigation.

### B. Collections

Collections are flexible containers for organizing items of any type.

**Key Features**:
- Multi-type support (one collection can hold snippets, notes, files, etc.)
- Many-to-many relationship (items can belong to multiple collections)
- Favorites support
- Default type for quick item creation

**Example Collections**:
- "React Patterns" → snippets, notes
- "Context Files" → files, prompts
- "Python Snippets" → snippets, commands
- "Interview Prep" → snippets, notes, links

### C. Search

Full-text search across:
- Item content
- Item titles
- Tags
- Item types
- Collections (future consideration)

### D. Authentication

**Methods**:
- Email/password (Next-Auth credentials)
- GitHub OAuth

**Implementation**: Next-Auth v5

### E. Core Features

- ⭐ Favorite collections and items
- 📌 Pin items to top
- 🕐 Recently used tracking
- 📥 Import code from files
- ✍️ Markdown editor for text-based types
- 📤 File upload for file/image types
- 📊 Export data (JSON, ZIP formats)
- 🌙 Dark mode (default) with light mode option
- 🔗 Add/remove items across multiple collections
- 👁️ View all collections an item belongs to

### F. AI Features (Pro Only)

- 🏷️ Auto-tag suggestions
- 📝 AI summaries
- 💡 Code explanation ("Explain This Code")
- ✨ Prompt optimizer

---

## 🗄️ Database Schema

### Prisma Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// USER & AUTHENTICATION
// ========================================

model User {
  id                    String       @id @default(cuid())
  name                  String?
  email                 String       @unique
  emailVerified         DateTime?
  image                 String?
  password              String?      // For email/password auth
  
  // Pro subscription fields
  isPro                 Boolean      @default(false)
  stripeCustomerId      String?      @unique
  stripeSubscriptionId  String?      @unique
  
  // Relations
  accounts              Account[]
  sessions              Session[]
  items                 Item[]
  itemTypes             ItemType[]
  collections           Collection[]
  
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  @@map("users")
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ========================================
// ITEM TYPES
// ========================================

model ItemType {
  id          String   @id @default(cuid())
  name        String   // "snippet", "prompt", "note", "command", "file", "image", "link"
  icon        String   // Icon name from lucide-react
  color       String   // Hex color code
  isSystem    Boolean  @default(false) // System types cannot be deleted
  
  userId      String?  // NULL for system types, user ID for custom types
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  items       Item[]
  collections Collection[] // For defaultType relation
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, name]) // User can't have duplicate type names
  @@map("item_types")
}

// ========================================
// ITEMS
// ========================================

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  
  // Content handling - either text OR file, never both
  contentType String   // "text" | "file" | "url"
  content     String?  @db.Text // For text-based items (snippets, prompts, notes, commands)
  
  // File-related fields (for file/image types)
  fileUrl     String?  // Cloudflare R2 URL
  fileName    String?  // Original filename
  fileSize    Int?     // Size in bytes
  
  // URL field (for link type)
  url         String?  @db.Text
  
  // Metadata
  language    String?  // Programming language for code snippets
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  itemTypeId  String
  itemType    ItemType @relation(fields: [itemTypeId], references: [id], onDelete: Restrict)
  
  tags        Tag[]    @relation("ItemTags")
  collections ItemCollection[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastUsedAt  DateTime @default(now()) // For "recently used" feature
  
  @@index([userId, isFavorite])
  @@index([userId, isPinned])
  @@index([userId, lastUsedAt])
  @@index([userId, itemTypeId])
  @@map("items")
}

// ========================================
// COLLECTIONS
// ========================================

model Collection {
  id             String   @id @default(cuid())
  name           String
  description    String?  @db.Text
  isFavorite     Boolean  @default(false)
  
  // Default type for quick-add items in this collection
  defaultTypeId  String?
  defaultType    ItemType? @relation(fields: [defaultTypeId], references: [id], onDelete: SetNull)
  
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  items          ItemCollection[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([userId, isFavorite])
  @@map("collections")
}

// ========================================
// JOIN TABLES
// ========================================

model ItemCollection {
  itemId       String
  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  addedAt      DateTime   @default(now())
  
  @@id([itemId, collectionId])
  @@index([collectionId])
  @@map("item_collections")
}

// ========================================
// TAGS
// ========================================

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  
  items     Item[]   @relation("ItemTags")
  
  createdAt DateTime @default(now())
  
  @@map("tags")
}
```

---

## 🏗️ Tech Stack

### Frontend & Framework
- **Next.js 15** (App Router with React Server Components)
- **React 19**
- **TypeScript** for type safety
- Server-side rendering with dynamic client components
- Single codebase/repository

### Database & ORM
- **Neon** (Serverless PostgreSQL)
- **Prisma 7** (latest - fetch current docs)
  - ⚠️ **CRITICAL**: Never use `prisma db push` or direct database updates
  - Always create migrations: `prisma migrate dev` → `prisma migrate deploy`
- **Redis** (Optional, for caching)

### Storage
- **Cloudflare R2** for file and image uploads

### Authentication
- **Next-Auth v5** (Auth.js)
- Email/password credentials
- GitHub OAuth

### AI Integration
- **OpenAI GPT-4o-mini** model (cost-effective for tagging, summaries, explanations)

### Styling
- **Tailwind CSS v4**
- **shadcn/ui** component library
- Dark mode by default

### Payments (Future)
- **Stripe** for subscription management
- Webhook handling for subscription events

---

## 💰 Monetization Strategy

### Free Tier
- ✅ 50 items total
- ✅ 3 collections
- ✅ All system types except file/image
- ✅ Basic search
- ❌ No file uploads
- ❌ No image uploads
- ❌ No AI features

### Pro Tier ($8/month or $72/year)
- ✅ Unlimited items
- ✅ Unlimited collections
- ✅ File & image uploads
- ✅ AI auto-tagging
- ✅ AI code explanation
- ✅ AI prompt optimizer
- ✅ Export data (JSON/ZIP)
- ✅ Priority support
- ✅ Custom types (post-MVP)

**Development Note**: During development, all features accessible to all users for testing. Implement Pro gates before production launch.

---

## 🎨 UI/UX Design System

### Design Principles
- Modern, minimal, developer-focused aesthetic
- Clean typography with generous whitespace
- Subtle borders and shadows
- References: Notion, Linear, Raycast

### Color System

#### Item Type Colors & Icons

| Type | Color | Hex | Icon (Lucide) |
|------|-------|-----|---------------|
| Snippet | Blue | `#3b82f6` | `Code` |
| Prompt | Purple | `#8b5cf6` | `Sparkles` |
| Command | Orange | `#f97316` | `Terminal` |
| Note | Yellow | `#fde047` | `StickyNote` |
| File | Gray | `#6b7280` | `File` |
| Image | Pink | `#ec4899` | `Image` |
| Link | Emerald | `#10b981` | `Link` |

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  DevStash                              [User Menu]   │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  SIDEBAR     │         MAIN CONTENT                 │
│  (Collapse)  │                                       │
│              │  ┌────────────────────────────────┐  │
│ Item Types:  │  │  Collection Card               │  │
│ • Snippets   │  │  [Color: Most common type]     │  │
│ • Prompts    │  └────────────────────────────────┘  │
│ • Commands   │                                       │
│ • Notes      │  ┌──────┐  ┌──────┐  ┌──────┐       │
│ • Links      │  │ Item │  │ Item │  │ Item │       │
│ • Files      │  │ Card │  │ Card │  │ Card │       │
│ • Images     │  └──────┘  └──────┘  └──────┘       │
│              │  [Border color: Item type]            │
│ Collections: │                                       │
│ • React      │                                       │
│ • Python     │                                       │
│ • Prompts    │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘

[Item Drawer Slides in from right when item clicked]
```

### Responsive Design
- **Desktop-first** with mobile optimization
- Sidebar converts to drawer on mobile/tablet
- Touch-friendly targets on mobile
- Optimized grid layouts for different screen sizes

### Micro-interactions
- Smooth transitions (200-300ms)
- Hover states on cards (subtle scale/shadow)
- Toast notifications for CRUD actions
- Loading skeletons during data fetch
- Syntax highlighting for code blocks (using Prism or Shiki)

---

## 📐 System Architecture

### Directory Structure
```
devstash/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── collections/
│   │   │   ├── items/
│   │   │   │   ├── snippets/
│   │   │   │   ├── prompts/
│   │   │   │   ├── commands/
│   │   │   │   ├── notes/
│   │   │   │   ├── links/
│   │   │   │   ├── files/
│   │   │   │   └── images/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── items/
│   │   │   ├── collections/
│   │   │   ├── upload/
│   │   │   ├── ai/
│   │   │   └── stripe/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── items/
│   │   ├── collections/
│   │   ├── layout/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── r2.ts
│   │   ├── openai.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── constants/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### API Routes Structure

```
/api/auth/[...nextauth]     # Next-Auth handlers
/api/items
  GET    /                  # List user's items (with filters)
  POST   /                  # Create new item
  GET    /[id]              # Get single item
  PATCH  /[id]              # Update item
  DELETE /[id]              # Delete item
  
/api/collections
  GET    /                  # List user's collections
  POST   /                  # Create collection
  GET    /[id]              # Get collection with items
  PATCH  /[id]              # Update collection
  DELETE /[id]              # Delete collection
  POST   /[id]/items        # Add item to collection
  DELETE /[id]/items/[itemId] # Remove item from collection

/api/upload                 # File upload to R2
/api/ai/tag                 # AI auto-tagging
/api/ai/explain             # AI code explanation
/api/ai/optimize            # AI prompt optimization
/api/stripe/webhook         # Stripe webhooks
/api/export                 # Export user data
```

---

## 🔐 Security Considerations

- Validate user ownership on all item/collection operations
- Sanitize markdown input to prevent XSS
- Implement rate limiting on AI endpoints
- Secure file uploads with type validation and size limits
- Use signed URLs for R2 file access
- Environment variables for all secrets
- CSRF protection via Next-Auth

---

## 🚀 Development Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (Next.js, Prisma, Tailwind)
- [ ] Database schema & migrations
- [ ] Authentication (Next-Auth)
- [ ] Basic UI layout (sidebar, main content)
- [ ] Item CRUD (text-based types only)
- [ ] Collection CRUD
- [ ] Item-Collection relationships

### Phase 2: Core Features
- [ ] Search functionality
- [ ] Favorites & pinning
- [ ] Tags system
- [ ] Recently used tracking
- [ ] Markdown editor
- [ ] Dark/light mode toggle
- [ ] File import feature

### Phase 3: Pro Features
- [ ] Cloudflare R2 integration
- [ ] File/image upload
- [ ] OpenAI integration
- [ ] AI auto-tagging
- [ ] AI code explanation
- [ ] AI prompt optimizer
- [ ] Export functionality

### Phase 4: Monetization
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage limits enforcement
- [ ] Pro feature gates
- [ ] Billing portal

### Phase 5: Polish & Launch
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Analytics
- [ ] Error tracking
- [ ] Documentation
- [ ] Marketing site

---

## 📊 Key Metrics to Track

- User signups (Free vs Pro conversion rate)
- Items created per user
- Collections created per user
- Search queries per session
- AI feature usage (Pro users)
- File upload volume
- Daily/Monthly active users
- Churn rate

---

## 🔗 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next-Auth v5 Documentation](https://authjs.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Stripe API Documentation](https://stripe.com/docs/api)

---

## 🎯 Success Criteria

1. **User Experience**: Sub-second item creation and retrieval
2. **Search**: Find any item in < 3 keystrokes
3. **Reliability**: 99.9% uptime
4. **Performance**: < 2s page load time
5. **Conversion**: 5% free → pro conversion within 30 days

---

*Last Updated: [Current Date]*
*Version: 1.0*
