"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences"

export async function updateEditorPreferences(
  prefs: Partial<EditorPreferences>,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { editorPreferences: true },
  })

  const current =
    (user?.editorPreferences as EditorPreferences | null) ??
    DEFAULT_EDITOR_PREFERENCES

  const updated: EditorPreferences = { ...current, ...prefs }

  await prisma.user.update({
    where: { id: session.user.id },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: { editorPreferences: JSON.parse(JSON.stringify(updated)) },
  })

  return { success: true }
}

export async function getEditorPreferences(): Promise<EditorPreferences> {
  const session = await auth()
  if (!session?.user?.id) return DEFAULT_EDITOR_PREFERENCES

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { editorPreferences: true },
  })

  return (
    (user?.editorPreferences as EditorPreferences | null) ??
    DEFAULT_EDITOR_PREFERENCES
  )
}
