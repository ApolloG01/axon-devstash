"use server"

import { z } from "zod"
import { updateItemById, deleteItemById, createItemInDb, getItemFileUrl, toggleFavoriteById, togglePinById } from "@/lib/db/items"
import { deleteFromR2 } from "@/lib/r2"
import { checkItemLimit } from "@/lib/usage-limits"
import { requireSession, zodError } from "@/lib/action-guards"

const tagsField = z.array(z.string().trim().min(1)).default([])
const collectionIdsField = z.array(z.string()).default([])

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z.string().url("Invalid URL").or(z.literal(null)).optional().transform((v) => v ?? null),
  language: z.string().trim().nullable().optional().transform((v) => v ?? null),
  tags: tagsField,
  collectionIds: collectionIdsField,
})

type UpdateItemInput = z.input<typeof updateItemSchema>

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  const parsed = updateItemSchema.safeParse(data)
  if (!parsed.success) return zodError(parsed.error)

  try {
    const updated = await updateItemById(guard.userId, itemId, parsed.data)
    if (!updated) return { success: false, error: "Item not found" }
    return { success: true, data: updated }
  } catch {
    return { success: false, error: "Failed to save changes" }
  }
}

const createItemSchema = z.object({
  itemTypeId: z.string().min(1, "Type is required"),
  contentType: z.enum(["text", "url", "file"]),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z.string().url("Invalid URL").or(z.literal(null)).optional().transform((v) => v ?? null),
  language: z.string().trim().nullable().optional().transform((v) => v ?? null),
  fileUrl: z.string().nullable().optional().transform((v) => v ?? null),
  fileName: z.string().nullable().optional().transform((v) => v ?? null),
  fileSize: z.number().nullable().optional().transform((v) => v ?? null),
  tags: tagsField,
  collectionIds: collectionIdsField,
})

type CreateItemInput = z.input<typeof createItemSchema>

export async function createItem(data: CreateItemInput) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  const parsed = createItemSchema.safeParse(data)
  if (!parsed.success) return zodError(parsed.error)

  const limitError = await checkItemLimit(guard.userId, guard.isPro)
  if (limitError) return { success: false, error: limitError }

  try {
    const item = await createItemInDb(guard.userId, parsed.data)
    return { success: true, data: item }
  } catch {
    return { success: false, error: "Failed to create item" }
  }
}

export async function toggleFavorite(itemId: string) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }
  try {
    const item = await toggleFavoriteById(guard.userId, itemId)
    if (!item) return { success: false, error: "Item not found" }
    return { success: true, data: item }
  } catch {
    return { success: false, error: "Failed to update" }
  }
}

export async function togglePin(itemId: string) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }
  try {
    const item = await togglePinById(guard.userId, itemId)
    if (!item) return { success: false, error: "Item not found" }
    return { success: true, data: item }
  } catch {
    return { success: false, error: "Failed to update" }
  }
}

export async function deleteItem(itemId: string) {
  const guard = await requireSession()
  if (!guard) return { success: false, error: "Unauthorized" }

  try {
    // Fetch fileUrl before deletion so we can clean up R2
    const fileUrl = await getItemFileUrl(guard.userId, itemId)

    const deleted = await deleteItemById(guard.userId, itemId)
    if (!deleted) return { success: false, error: "Item not found" }

    // Best-effort R2 cleanup — don't fail the delete if this errors
    if (fileUrl) {
      deleteFromR2(fileUrl).catch(() => null)
    }

    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete item" }
  }
}
