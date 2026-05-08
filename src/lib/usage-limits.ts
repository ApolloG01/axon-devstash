import { prisma } from "@/lib/prisma"

const FREE_ITEM_LIMIT = 50
const FREE_COLLECTION_LIMIT = 3

export async function checkItemLimit(userId: string, isPro: boolean): Promise<string | null> {
  if (isPro) return null
  const count = await prisma.item.count({ where: { userId } })
  if (count >= FREE_ITEM_LIMIT) {
    return `Free plan limit reached (${FREE_ITEM_LIMIT} items). Upgrade to Pro for unlimited items.`
  }
  return null
}

export async function checkCollectionLimit(userId: string, isPro: boolean): Promise<string | null> {
  if (isPro) return null
  const count = await prisma.collection.count({ where: { userId } })
  if (count >= FREE_COLLECTION_LIMIT) {
    return `Free plan limit reached (${FREE_COLLECTION_LIMIT} collections). Upgrade to Pro for unlimited collections.`
  }
  return null
}
