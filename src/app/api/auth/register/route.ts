import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body.name as string)?.trim()
    const email = (body.email as string)?.trim()
    const password = body.password as string
    const confirmPassword = body.confirmPassword as string

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
