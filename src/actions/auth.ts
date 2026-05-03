"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/resend"
import {
  checkSignInLimit,
  checkRegisterLimit,
  checkForgotPasswordLimit,
  getActionIp,
} from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function credentialsSignIn(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = (formData.get("email") as string)?.trim()

  const ip = await getActionIp()
  const rl = await checkSignInLimit(ip, email)
  if (rl.limited) {
    const mins = Math.ceil((rl.retryAfterSeconds ?? 60) / 60)
    return `Too many sign-in attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.`
  }

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

  const ip = await getActionIp()
  const rl = await checkRegisterLimit(ip)
  if (rl.limited) {
    const mins = Math.ceil((rl.retryAfterSeconds ?? 60) / 60)
    return `Too many registration attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.`
  }
  if (password.length < 8) return "Password must be at least 8 characters."
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

const RESET_PREFIX = "password-reset:"

export async function requestPasswordReset(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = (formData.get("email") as string)?.trim()
  if (!email) return "Email is required."

  const ip = await getActionIp()
  const rl = await checkForgotPasswordLimit(ip)
  if (rl.limited) {
    const mins = Math.ceil((rl.retryAfterSeconds ?? 60) / 60)
    return `Too many attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.`
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } })

  // Always show the same message to avoid revealing whether an email exists
  if (!user?.password) {
    return null // silently skip OAuth accounts or non-existent emails
  }

  // Delete any existing reset token for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: `${RESET_PREFIX}${email}` } })

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: `${RESET_PREFIX}${email}`, token, expires },
  })

  try {
    await sendPasswordResetEmail(email, token)
  } catch (err) {
    console.error("[requestPasswordReset] Failed to send reset email:", err)
  }

  return null
}

export async function resetPassword(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const token = (formData.get("token") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !password) return "Invalid request."
  if (password !== confirmPassword) return "Passwords do not match."
  if (password.length < 8) return "Password must be at least 8 characters."

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || !record.identifier.startsWith(RESET_PREFIX) || record.expires < new Date()) {
    if (record) await prisma.verificationToken.delete({ where: { token } })
    return "INVALID_TOKEN"
  }

  const email = record.identifier.slice(RESET_PREFIX.length)

  await prisma.user.update({
    where: { email },
    data: { password: await bcrypt.hash(password, 12) },
  })

  await prisma.verificationToken.delete({ where: { token } })

  redirect("/sign-in?passwordReset=1")
}
