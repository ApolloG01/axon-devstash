import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const systemItemTypes = [
  { id: "type_snippet", name: "snippet", icon: "Code",      color: "#3b82f6", isSystem: true },
  { id: "type_prompt",  name: "prompt",  icon: "Sparkles",  color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "command", icon: "Terminal",   color: "#f97316", isSystem: true },
  { id: "type_note",    name: "note",    icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type_link",    name: "link",    icon: "Link",       color: "#10b981", isSystem: true },
  { id: "type_file",    name: "file",    icon: "File",       color: "#6b7280", isSystem: true },
  { id: "type_image",   name: "image",   icon: "Image",      color: "#ec4899", isSystem: true },
]

async function main() {
  console.log("Seeding system item types...")

  for (const type of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: {},
      create: { ...type, userId: null },
    })
    console.log(`  ✓ ${type.name}`)
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
