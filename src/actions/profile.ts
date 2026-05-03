"use server"

import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/auth"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function changePassword(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword) return "All fields are required."
  if (newPassword !== confirmPassword) return "New passwords do not match."
  if (newPassword.length < 8) return "Password must be at least 8 characters."

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) return "This account uses GitHub sign-in."

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return "Current password is incorrect."

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  })

  return "PASSWORD_CHANGED"
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  await prisma.user.delete({ where: { id: session.user.id } })

  await signOut({ redirectTo: "/sign-in?deleted=1" })
}
