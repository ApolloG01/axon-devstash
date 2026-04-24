import { prisma } from "@/lib/prisma"

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

// Temporary until auth is implemented
export async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  })
  return user?.id ?? null
}
