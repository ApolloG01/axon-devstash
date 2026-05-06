import { prisma } from "@/lib/prisma"
export { getDemoUserId } from "@/lib/db/demo"

export type ItemWithType = {
  id: string
  title: string
  description: string | null
  content: string | null
  language: string | null
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: Date
  itemType: { name: string; color: string; icon: string }
  tags: Array<{ name: string }>
}

export type ItemFull = {
  id: string
  title: string
  description: string | null
  contentType: string
  content: string | null
  language: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  url: string | null
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: Date
  createdAt: Date
  updatedAt: Date
  itemType: { id: string; name: string; color: string; icon: string }
  tags: Array<{ name: string }>
  collections: Array<{ collection: { id: string; name: string } }>
}

const itemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  language: true,
  isFavorite: true,
  isPinned: true,
  lastUsedAt: true,
  itemType: { select: { name: true, color: true, icon: true } },
  tags: { select: { name: true } },
} as const

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    select: itemSelect,
    orderBy: { lastUsedAt: "desc" },
  })
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId },
    select: itemSelect,
    orderBy: { lastUsedAt: "desc" },
    take: limit,
  })
}

export async function getItemStats(userId: string) {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ])
  return { total, favorites }
}

export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, itemType: { name: typeName } },
    select: itemSelect,
    orderBy: { lastUsedAt: "desc" },
  })
}

export async function getItemById(userId: string, id: string): Promise<ItemFull | null> {
  return prisma.item.findUnique({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      content: true,
      language: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      url: true,
      isFavorite: true,
      isPinned: true,
      lastUsedAt: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { id: true, name: true, color: true, icon: true } },
      tags: { select: { name: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  })
}

export type UpdateItemData = {
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  tags: string[]
}

export async function updateItemById(userId: string, id: string, data: UpdateItemData): Promise<ItemFull | null> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { id: true } })
  if (!item) return null

  return prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      updatedAt: new Date(),
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      content: true,
      language: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      url: true,
      isFavorite: true,
      isPinned: true,
      lastUsedAt: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { id: true, name: true, color: true, icon: true } },
      tags: { select: { name: true } },
      collections: { select: { collection: { select: { id: true, name: true } } } },
    },
  })
}

export async function deleteItemById(userId: string, id: string): Promise<boolean> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { id: true } })
  if (!item) return false
  await prisma.item.delete({ where: { id } })
  return true
}

export async function getSystemItemTypes() {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
    orderBy: { createdAt: "asc" },
  })
}
