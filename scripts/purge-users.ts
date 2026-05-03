import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const KEEP_EMAIL = "sorrid01@gmail.com"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const keepUser = await prisma.user.findUnique({ where: { email: KEEP_EMAIL } })

  if (!keepUser) {
    console.error(`User ${KEEP_EMAIL} not found — aborting to avoid full wipe.`)
    process.exit(1)
  }

  const usersToDelete = await prisma.user.findMany({
    where: { id: { not: keepUser.id } },
    select: { id: true, email: true },
  })

  if (usersToDelete.length === 0) {
    console.log("No other users found. Nothing to delete.")
    return
  }

  console.log(`Deleting ${usersToDelete.length} user(s):`)
  for (const u of usersToDelete) {
    console.log(`  ${u.email} (${u.id})`)
  }

  const userIds = usersToDelete.map((u) => u.id)

  // Delete in dependency order
  await prisma.itemCollection.deleteMany({
    where: { item: { userId: { in: userIds } } },
  })
  await prisma.item.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.collection.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.itemType.deleteMany({
    where: { userId: { in: userIds }, isSystem: false },
  })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })

  // Clean up orphaned tags (not referenced by any item)
  const deleted = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  })

  console.log(`\nDone. Removed ${usersToDelete.length} user(s) and ${deleted.count} orphaned tag(s).`)
  console.log(`Kept: ${KEEP_EMAIL}`)
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
