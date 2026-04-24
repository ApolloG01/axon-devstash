import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...\n")

  // Check system item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })

  console.log(`System item types (${itemTypes.length}):`)
  for (const type of itemTypes) {
    console.log(`  ${type.icon.padEnd(12)} ${type.name.padEnd(10)} ${type.color}`)
  }

  // Check table counts
  const [users, collections, items, tags] = await Promise.all([
    prisma.user.count(),
    prisma.collection.count(),
    prisma.item.count(),
    prisma.tag.count(),
  ])

  console.log("\nTable counts:")
  console.log(`  users:       ${users}`)
  console.log(`  collections: ${collections}`)
  console.log(`  items:       ${items}`)
  console.log(`  tags:        ${tags}`)

  console.log("\nDatabase connection OK.")
}

main()
  .catch((e) => {
    console.error("Database connection failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
