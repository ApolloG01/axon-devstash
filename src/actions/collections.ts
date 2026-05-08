"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { createCollectionInDb, getUserCollectionsList, updateCollectionInDb, deleteCollectionInDb, toggleCollectionFavoriteInDb } from "@/lib/db/collections"
import { checkCollectionLimit } from "@/lib/usage-limits"

export async function getCollectionsForPicker(): Promise<{ id: string; name: string }[]> {
  const session = await auth()
  if (!session?.user?.id) return []
  return getUserCollectionsList(session.user.id)
}

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
})

type CreateCollectionInput = z.input<typeof createCollectionSchema>

export async function createCollection(data: CreateCollectionInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = createCollectionSchema.safeParse(data)
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ")
    return { success: false, error: message }
  }

  const limitError = await checkCollectionLimit(session.user.id, session.user.isPro)
  if (limitError) return { success: false, error: limitError }

  try {
    const collection = await createCollectionInDb(session.user.id, parsed.data)
    return { success: true, data: collection }
  } catch {
    return { success: false, error: "Failed to create collection" }
  }
}

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
})

type UpdateCollectionInput = z.input<typeof updateCollectionSchema>

export async function updateCollection(collectionId: string, data: UpdateCollectionInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = updateCollectionSchema.safeParse(data)
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ")
    return { success: false, error: message }
  }

  try {
    const result = await updateCollectionInDb(session.user.id, collectionId, parsed.data)
    if (result.count === 0) return { success: false, error: "Collection not found" }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update collection" }
  }
}

export async function deleteCollection(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const result = await deleteCollectionInDb(session.user.id, collectionId)
    if (result.count === 0) return { success: false, error: "Collection not found" }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete collection" }
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" }

  try {
    const result = await toggleCollectionFavoriteInDb(session.user.id, collectionId)
    if (!result) return { success: false as const, error: "Collection not found" }
    return { success: true as const, data: result }
  } catch {
    return { success: false as const, error: "Failed to update" }
  }
}
