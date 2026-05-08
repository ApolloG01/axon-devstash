import { prisma } from "@/lib/prisma"

export type ItemWithType = {
  id: string
  title: string
  description: string | null
  content: string | null
  language: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: Date
  createdAt: Date
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

export type SerializedItemFull = Omit<ItemFull, "lastUsedAt" | "createdAt" | "updatedAt"> & {
  lastUsedAt: string
  createdAt: string
  updatedAt: string
}

const itemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  language: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isFavorite: true,
  isPinned: true,
  lastUsedAt: true,
  createdAt: true,
  itemType: { select: { name: true, color: true, icon: true } },
  tags: { select: { name: true } },
} as const

const itemFullSelect = {
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

export async function getItemsByType(
  userId: string,
  typeName: string,
  page: number,
  pageSize: number,
): Promise<{ items: ItemWithType[]; total: number }> {
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where: { userId, itemType: { name: typeName } },
      select: itemSelect,
      orderBy: { lastUsedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.item.count({ where: { userId, itemType: { name: typeName } } }),
  ])
  return { items, total }
}

export async function getItemById(userId: string, id: string): Promise<ItemFull | null> {
  return prisma.item.findUnique({
    where: { id, userId },
    select: itemFullSelect,
  })
}

export type UpdateItemData = {
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  tags: string[]
  collectionIds: string[]
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
          where: { userId_name: { userId, name } },
          create: { name, userId },
        })),
      },
      collections: {
        deleteMany: {},
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    select: itemFullSelect,
  })
}

export type CreateItemData = {
  itemTypeId: string
  contentType: string
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  tags: string[]
  collectionIds: string[]
}

export async function createItemInDb(userId: string, data: CreateItemData): Promise<ItemFull> {
  return prisma.item.create({
    data: {
      userId,
      itemTypeId: data.itemTypeId,
      contentType: data.contentType,
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { userId_name: { userId, name } },
          create: { name, userId },
        })),
      },
      collections: {
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    select: itemFullSelect,
  })
}

export async function getItemFileUrl(userId: string, id: string): Promise<string | null> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { fileUrl: true } })
  return item?.fileUrl ?? null
}

export async function deleteItemById(userId: string, id: string): Promise<boolean> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { id: true } })
  if (!item) return false
  await prisma.item.delete({ where: { id } })
  return true
}

export async function toggleFavoriteById(userId: string, id: string): Promise<ItemFull | null> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { id: true, isFavorite: true } })
  if (!item) return null
  return prisma.item.update({
    where: { id },
    data: { isFavorite: !item.isFavorite, updatedAt: new Date() },
    select: itemFullSelect,
  })
}

export async function togglePinById(userId: string, id: string): Promise<ItemFull | null> {
  const item = await prisma.item.findUnique({ where: { id, userId }, select: { id: true, isPinned: true } })
  if (!item) return null
  return prisma.item.update({
    where: { id },
    data: { isPinned: !item.isPinned, updatedAt: new Date() },
    select: itemFullSelect,
  })
}

export async function getSystemItemTypes() {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
    orderBy: { createdAt: "asc" },
  })
}

export type SearchItem = {
  id: string
  title: string
  contentPreview: string | null
  itemType: { name: string; color: string; icon: string }
}

export async function getSearchableItems(userId: string): Promise<SearchItem[]> {
  const rows = await prisma.item.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      content: true,
      itemType: { select: { name: true, color: true, icon: true } },
    },
    orderBy: { lastUsedAt: "desc" },
  })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    contentPreview: row.content ? row.content.slice(0, 80) : null,
    itemType: row.itemType,
  }))
}
