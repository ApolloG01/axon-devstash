import { auth } from "@/auth"
import { checkAiTagLimit } from "@/lib/rate-limit"
import type { ZodError } from "zod"

export async function requireSession() {
  const session = await auth()
  if (!session?.user?.id) return null
  return { userId: session.user.id, isPro: session.user.isPro ?? false }
}

type AiGuardResult = { userId: string } | { success: false; error: string }

export async function requireProAiSession(): Promise<AiGuardResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" }
  if (!session.user.isPro) return { success: false as const, error: "Pro plan required for AI features" }

  const rl = await checkAiTagLimit(session.user.id)
  if (rl.limited) {
    return {
      success: false as const,
      error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.`,
    }
  }

  return { userId: session.user.id }
}

export function zodError(err: ZodError): { success: false; error: string } {
  return { success: false, error: err.issues.map((e) => e.message).join(", ") }
}
