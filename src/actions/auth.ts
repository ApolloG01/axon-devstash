"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/resend"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function credentialsSignIn(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = (formData.get("email") as string)?.trim()

  const user = await prisma.user.findUnique({ where: { email }, select: { emailVerified: true, password: true } })
  if (user?.password && !user.emailVerified) {
    return "Please verify your email before signing in. Check your inbox."
  }

  try {
    await signIn("credentials", {
      email,
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

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  try {
    await sendVerificationEmail(email, token)
  } catch (err) {
    console.error("[registerUser] Failed to send verification email:", err)
  }

  redirect("/sign-in?registered=1")
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in?signedOut=1" })
}
