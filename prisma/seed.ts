import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ========================================
// SYSTEM ITEM TYPES
// ========================================

const systemItemTypes = [
  { id: "type_snippet", name: "snippet", icon: "Code",       color: "#3b82f6", isSystem: true },
  { id: "type_prompt",  name: "prompt",  icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "command", icon: "Terminal",    color: "#f97316", isSystem: true },
  { id: "type_note",    name: "note",    icon: "StickyNote",  color: "#fde047", isSystem: true },
  { id: "type_file",    name: "file",    icon: "File",        color: "#6b7280", isSystem: true },
  { id: "type_image",   name: "image",   icon: "Image",       color: "#ec4899", isSystem: true },
  { id: "type_link",    name: "link",    icon: "Link",        color: "#10b981", isSystem: true },
]

// ========================================
// COLLECTIONS
// ========================================

const collections = [
  { id: "col_react",    name: "React Patterns",      description: "Reusable React patterns and hooks",           defaultTypeId: "type_snippet" },
  { id: "col_ai",       name: "AI Workflows",         description: "AI prompts and workflow automations",         defaultTypeId: "type_prompt"  },
  { id: "col_devops",   name: "DevOps",               description: "Infrastructure and deployment resources",     defaultTypeId: "type_command" },
  { id: "col_terminal", name: "Terminal Commands",    description: "Useful shell commands for everyday development", defaultTypeId: "type_command" },
  { id: "col_design",   name: "Design Resources",     description: "UI/UX resources and references",              defaultTypeId: "type_link"    },
]

// ========================================
// ITEMS
// ========================================

const items = [
  // ── React Patterns ──────────────────────────────────────────────
  {
    id: "item_react_1",
    title: "useDebounce hook",
    description: "Debounce any value with a configurable delay",
    contentType: "text",
    content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    collectionIds: ["col_react"],
    tags: ["hooks", "react", "typescript"],
    isFavorite: true,
  },
  {
    id: "item_react_2",
    title: "Context provider pattern",
    description: "Typed React context with provider and hook",
    contentType: "text",
    content: `import { createContext, useContext, useState } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    collectionIds: ["col_react"],
    tags: ["context", "react", "typescript"],
  },
  {
    id: "item_react_3",
    title: "useLocalStorage hook",
    description: "Persist state to localStorage with type safety",
    contentType: "text",
    content: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue] as const
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    collectionIds: ["col_react"],
    tags: ["hooks", "react", "localStorage"],
  },

  // ── AI Workflows ────────────────────────────────────────────────
  {
    id: "item_ai_1",
    title: "Senior code reviewer",
    description: "Thorough PR review from a senior engineer's perspective",
    contentType: "text",
    content: `You are a senior software engineer conducting a thorough code review.

Review the provided code for:
- Correctness and edge cases
- Performance and efficiency
- Security vulnerabilities
- Readability and maintainability
- Adherence to best practices

Be specific, cite line numbers, and suggest improvements with code examples. Prioritise critical issues over style nitpicks.`,
    language: null,
    itemTypeId: "type_prompt",
    collectionIds: ["col_ai"],
    tags: ["code-review", "engineering"],
    isFavorite: true,
  },
  {
    id: "item_ai_2",
    title: "Documentation generator",
    description: "Generate clear JSDoc and README documentation",
    contentType: "text",
    content: `You are a technical writer. Generate comprehensive documentation for the provided code.

Include:
- JSDoc comments for all exported functions and types
- Parameter descriptions with types
- Return value descriptions
- Usage examples
- Edge cases and gotchas

Write for a developer who is new to this codebase. Be concise but complete.`,
    language: null,
    itemTypeId: "type_prompt",
    collectionIds: ["col_ai"],
    tags: ["docs", "jsdoc"],
  },
  {
    id: "item_ai_3",
    title: "Refactoring assistant",
    description: "Improve code quality without changing behaviour",
    contentType: "text",
    content: `You are an expert at refactoring code. Improve the provided code while preserving its exact behaviour.

Focus on:
- Reducing complexity and nesting
- Extracting reusable functions
- Improving naming clarity
- Removing duplication (DRY)
- Applying relevant design patterns

Show the refactored code and explain each change with a one-line justification.`,
    language: null,
    itemTypeId: "type_prompt",
    collectionIds: ["col_ai"],
    tags: ["refactoring", "clean-code"],
  },

  // ── DevOps ──────────────────────────────────────────────────────
  {
    id: "item_devops_1",
    title: "Dockerfile — Node.js multi-stage",
    description: "Production-optimised multi-stage build for Node.js apps",
    contentType: "text",
    content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
    language: "dockerfile",
    itemTypeId: "type_snippet",
    collectionIds: ["col_devops"],
    tags: ["docker", "node", "devops"],
  },
  {
    id: "item_devops_2",
    title: "Deploy to production",
    description: "Pull latest, install deps, build and restart PM2",
    contentType: "text",
    content: "git pull origin main && npm ci && npm run build && pm2 restart all",
    language: "bash",
    itemTypeId: "type_command",
    collectionIds: ["col_devops"],
    tags: ["deploy", "pm2"],
  },
  {
    id: "item_devops_3",
    title: "Docker documentation",
    description: "Official Docker documentation and reference",
    contentType: "url",
    url: "https://docs.docker.com",
    itemTypeId: "type_link",
    collectionIds: ["col_devops"],
    tags: ["docker", "docs"],
  },
  {
    id: "item_devops_4",
    title: "GitHub Actions docs",
    description: "CI/CD workflows with GitHub Actions",
    contentType: "url",
    url: "https://docs.github.com/en/actions",
    itemTypeId: "type_link",
    collectionIds: ["col_devops"],
    tags: ["ci-cd", "github", "docs"],
  },

  // ── Terminal Commands ────────────────────────────────────────────
  {
    id: "item_cmd_1",
    title: "Reset local branch to origin",
    description: "Hard reset local branch to match remote",
    contentType: "text",
    content: "git fetch origin && git reset --hard origin/$(git branch --show-current)",
    language: "bash",
    itemTypeId: "type_command",
    collectionIds: ["col_terminal"],
    tags: ["git"],
  },
  {
    id: "item_cmd_2",
    title: "Remove all stopped containers",
    description: "Clean up exited Docker containers",
    contentType: "text",
    content: "docker rm $(docker ps -aq -f status=exited)",
    language: "bash",
    itemTypeId: "type_command",
    collectionIds: ["col_terminal"],
    tags: ["docker", "cleanup"],
  },
  {
    id: "item_cmd_3",
    title: "Find process on port",
    description: "See which process is listening on a given port",
    contentType: "text",
    content: "lsof -i :[port] | grep LISTEN",
    language: "bash",
    itemTypeId: "type_command",
    collectionIds: ["col_terminal"],
    tags: ["networking", "debug"],
  },
  {
    id: "item_cmd_4",
    title: "Clean npm cache and reinstall",
    description: "Full clean reinstall of node_modules",
    contentType: "text",
    content: "rm -rf node_modules package-lock.json && npm cache clean --force && npm install",
    language: "bash",
    itemTypeId: "type_command",
    collectionIds: ["col_terminal"],
    tags: ["npm", "cleanup"],
  },

  // ── Design Resources ─────────────────────────────────────────────
  {
    id: "item_design_1",
    title: "Tailwind CSS docs",
    description: "Official Tailwind CSS utility class reference",
    contentType: "url",
    url: "https://tailwindcss.com/docs",
    itemTypeId: "type_link",
    collectionIds: ["col_design"],
    tags: ["tailwind", "css", "docs"],
  },
  {
    id: "item_design_2",
    title: "shadcn/ui components",
    description: "Beautifully designed component library built on Radix UI",
    contentType: "url",
    url: "https://ui.shadcn.com",
    itemTypeId: "type_link",
    collectionIds: ["col_design"],
    tags: ["components", "ui", "shadcn"],
    isFavorite: true,
  },
  {
    id: "item_design_3",
    title: "Radix UI primitives",
    description: "Unstyled, accessible UI primitives for React",
    contentType: "url",
    url: "https://www.radix-ui.com",
    itemTypeId: "type_link",
    collectionIds: ["col_design"],
    tags: ["components", "accessibility", "react"],
  },
  {
    id: "item_design_4",
    title: "Lucide icons",
    description: "Open-source icon library with 1000+ icons",
    contentType: "url",
    url: "https://lucide.dev/icons",
    itemTypeId: "type_link",
    collectionIds: ["col_design"],
    tags: ["icons", "design"],
  },
]

// ========================================
// SEED
// ========================================

async function main() {
  console.log("Seeding database...\n")

  // System item types
  console.log("  System item types:")
  for (const type of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: {},
      create: { ...type, userId: null },
    })
    console.log(`    ✓ ${type.name}`)
  }

  // Demo user
  console.log("\n  Demo user:")
  const password = await bcrypt.hash("12345678", 12)
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password,
      isPro: false,
      emailVerified: new Date(),
    },
  })
  console.log(`    ✓ ${user.email}`)

  // Collections
  console.log("\n  Collections:")
  for (const col of collections) {
    await prisma.collection.upsert({
      where: { id: col.id },
      update: {},
      create: { ...col, userId: user.id },
    })
    console.log(`    ✓ ${col.name}`)
  }

  // Items + collection associations
  console.log("\n  Items:")
  for (const item of items) {
    const { collectionIds, tags, ...itemData } = item
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...itemData,
        content: "content" in itemData ? itemData.content ?? null : null,
        url: "url" in itemData ? (itemData as { url: string }).url : null,
        userId: user.id,
        tags: {
          connectOrCreate: tags?.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })) ?? [],
        },
        collections: {
          create: collectionIds.map((collectionId) => ({ collectionId })),
        },
      },
    })
    console.log(`    ✓ ${item.title}`)
  }

  console.log("\nSeed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
