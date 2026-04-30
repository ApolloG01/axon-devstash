"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function credentialsSignIn(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard?welcome=1",
    })
    return null
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password."
    }
    throw error // re-throw NEXT_REDIRECT so Next.js handles it
  }
}

export async function githubSignIn(_formData: FormData) {
  await signIn("github", { redirectTo: "/dashboard?welcome=1" })
}

export async function registerUser(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!name || !email || !password) return "All fields are required."
  if (password !== confirmPassword) return "Passwords do not match."

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return "An account with this email already exists."

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12) },
  })

  redirect("/sign-in?registered=1")
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in?signedOut=1" })
}
