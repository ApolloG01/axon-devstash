import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set")
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[DEV] Verification URL for ${email}:\n${verifyUrl}\n`)
  }

  await resend.emails.send({
    from: "Axon DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email — Axon DevStash",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#09090b;color:#fafafa;border-radius:8px;">
        <h1 style="font-size:20px;font-weight:600;margin:0 0 8px;">Verify your email</h1>
        <p style="color:#a1a1aa;margin:0 0 24px;font-size:14px;">Click the button below to verify your email and activate your account. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#fafafa;color:#09090b;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a>
        <p style="color:#52525b;font-size:12px;margin:24px 0 0;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[DEV] Password reset URL for ${email}:\n${resetUrl}\n`)
  }

  await resend.emails.send({
    from: "Axon DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password — Axon DevStash",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#09090b;color:#fafafa;border-radius:8px;">
        <h1 style="font-size:20px;font-weight:600;margin:0 0 8px;">Reset your password</h1>
        <p style="color:#a1a1aa;margin:0 0 24px;font-size:14px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#fafafa;color:#09090b;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
        <p style="color:#52525b;font-size:12px;margin:24px 0 0;">If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  })
}
