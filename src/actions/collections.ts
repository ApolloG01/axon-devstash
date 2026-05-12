"use server"

import { z } from "zod"
import { createCollectionInDb, getUserCollectionsList, updateCollectionInDb, deleteCollectionInDb, toggleCollectionFavoriteInDb } from "@/lib/db/collections"
import { checkCollectionLimit } from "@/lib/usage-limits"
import { requireSession, zodError } from "@/lib/action-guards"

export async function getCollectionsForPicker(): Promise<{ id: string; name: string }[]> {
  const guard = await requireSession()
  if (!guard) return []
  return getUserCollectionsList(guard.userId)
}

const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
})

type CollectionInput = z.input<typeof collectionSchema>

export async function createCollection(data: CollectionInput) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  const parsed = collectionSchema.safeParse(data)
  if (!parsed.success) return zodError(parsed.error)

  const limitError = await checkCollectionLimit(guard.userId, guard.isPro)
  if (limitError) return { success: false, error: limitError }

  try {
    const collection = await createCollectionInDb(guard.userId, parsed.data)
    return { success: true, data: collection }
  } catch {
    return { success: false, error: "Failed to create collection" }
  }
}

export async function updateCollection(collectionId: string, data: CollectionInput) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  const parsed = collectionSchema.safeParse(data)
  if (!parsed.success) return zodError(parsed.error)

  try {
    const result = await updateCollectionInDb(guard.userId, collectionId, parsed.data)
    if (result.count === 0) return { success: false, error: "Collection not found" }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update collection" }
  }
}

export async function deleteCollection(collectionId: string) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  try {
    const result = await deleteCollectionInDb(guard.userId, collectionId)
    if (result.count === 0) return { success: false, error: "Collection not found" }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete collection" }
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  const guard = await requireSession()
  if (!guard) return { success: false as const, error: "Unauthorized" }

  try {
    const result = await toggleCollectionFavoriteInDb(guard.userId, collectionId)
    if (!result) return { success: false as const, error: "Collection not found" }
    return { success: true as const, data: result }
  } catch {
    return { success: false as const, error: "Failed to update" }
  }
}
