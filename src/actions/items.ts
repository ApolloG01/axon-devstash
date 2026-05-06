"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { updateItemById } from "@/lib/db/items"

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z.string().url("Invalid URL").nullable().optional().transform((v) => v ?? null),
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
