"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { updateItemById, deleteItemById, createItemInDb, getItemFileUrl } from "@/lib/db/items"
import { deleteFromR2 } from "@/lib/r2"

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z.string().url("Invalid URL").or(z.literal(null)).optional().transform((v) => v ?? null),
  language: z.string().trim().nullable().optional().transform((v) => v ?? null),
  tags: z.array(z.string().trim().min(1)).default([]),
})

type UpdateItemInput = z.input<typeof updateItemSchema>

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = updateItemSchema.safeParse(data)
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ")
    return { success: false, error: message }
  }

  try {
    const updated = await updateItemById(session.user.id, itemId, parsed.data)
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
  tags: z.array(z.string().trim().min(1)).default([]),
})

type CreateItemInput = z.input<typeof createItemSchema>

export async function createItem(data: CreateItemInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = createItemSchema.safeParse(data)
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ")
    return { success: false, error: message }
  }

  try {
    const item = await createItemInDb(session.user.id, parsed.data)
    return { success: true, data: item }
  } catch {
    return { success: false, error: "Failed to create item" }
  }
}

export async function deleteItem(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    // Fetch fileUrl before deletion so we can clean up R2
    const fileUrl = await getItemFileUrl(session.user.id, itemId)

    const deleted = await deleteItemById(session.user.id, itemId)
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
