"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { createCollectionInDb, getUserCollectionsList } from "@/lib/db/collections"

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

  try {
    const collection = await createCollectionInDb(session.user.id, parsed.data)
    return { success: true, data: collection }
  } catch {
    return { success: false, error: "Failed to create collection" }
  }
}
