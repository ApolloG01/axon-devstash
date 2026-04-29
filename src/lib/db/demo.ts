import { cache } from "react"
import { prisma } from "@/lib/prisma"

// Temporary until auth is implemented
export const getDemoUserId = cache(async (): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  })
  return user?.id ?? null
})
