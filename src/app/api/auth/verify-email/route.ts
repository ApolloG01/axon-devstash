import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.identifier.startsWith("password-reset:") || record.expires < new Date()) {
    if (record) await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.redirect(new URL("/sign-in?verified=1", req.url))
}
