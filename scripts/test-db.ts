import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...\n")

  // ── System item types ──────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
  console.log(`System item types (${itemTypes.length}):`)
  for (const t of itemTypes) {
    console.log(`  ${t.icon.padEnd(12)} ${t.name.padEnd(10)} ${t.color}`)
  }

  // ── Demo user ──────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  })
  console.log("\nDemo user:")
  if (user) {
    console.log(`  name:          ${user.name}`)
    console.log(`  email:         ${user.email}`)
    console.log(`  emailVerified: ${user.emailVerified?.toISOString()}`)
    console.log(`  isPro:         ${user.isPro}`)
    console.log(`  password hash: ${user.password ? "✓ set" : "✗ missing"}`)
  } else {
    console.log("  ✗ Demo user not found")
  }

  // ── Collections ────────────────────────────────────────────────
  const collections = await prisma.collection.findMany({
    where: { userId: user?.id },
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  })
  console.log(`\nCollections (${collections.length}):`)
  for (const col of collections) {
    console.log(`  ${col.name.padEnd(22)} ${col._count.items} items`)
  }

  // ── Items ──────────────────────────────────────────────────────
  const items = await prisma.item.findMany({
    where: { userId: user?.id },
    include: {
      itemType: true,
      tags: true,
      collections: { include: { collection: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  console.log(`\nItems (${items.length}):`)
  for (const item of items) {
    const colNames = item.collections.map((ic) => ic.collection.name).join(", ")
    const tagNames = item.tags.map((t) => `#${t.name}`).join(" ")
    console.log(`  [${item.itemType.name.padEnd(8)}] ${item.title}`)
    console.log(`             collection: ${colNames}`)
    if (tagNames) console.log(`             tags: ${tagNames}`)
  }

  // ── Summary ────────────────────────────────────────────────────
  const tagCount = await prisma.tag.count()
  console.log("\nSummary:")
  console.log(`  users:       ${user ? 1 : 0}`)
  console.log(`  collections: ${collections.length}`)
  console.log(`  items:       ${items.length}`)
  console.log(`  tags:        ${tagCount}`)
  console.log("\nDatabase OK.")
}

main()
  .catch((e) => {
    console.error("Database error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
