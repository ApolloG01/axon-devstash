import authConfig from "@/auth.config"
import NextAuth from "next-auth"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  if (!req.auth && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/items") || req.nextUrl.pathname.startsWith("/collections") || req.nextUrl.pathname === "/profile")) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/collections/:path*", "/profile"],
}
