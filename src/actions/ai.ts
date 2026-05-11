"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { getOpenAI, AI_MODEL } from "@/lib/openai"
import { checkAiTagLimit } from "@/lib/rate-limit"

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().optional(),
  typeName: z.string().trim().min(1),
})

export async function generateAutoTags(input: z.input<typeof generateAutoTagsSchema>) {
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

  const parsed = generateAutoTagsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" }
  }

  const { title, content, typeName } = parsed.data
  const truncated = content ? content.slice(0, 2000) : ""
  const inputText = `Item type: ${typeName}\nTitle: ${title}${truncated ? `\nContent:\n${truncated}` : ""}`

  try {
    const client = getOpenAI()
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Generate concise, relevant tags for developer knowledge items. Return only a JSON object with a 'tags' array of 3-5 lowercase strings. No explanations.",
      input: `Suggest 3-5 tags for this ${typeName}:\n${inputText}`,
      text: { format: { type: "json_object" } },
    })

    const raw = JSON.parse(response.output_text)
    let tags: unknown[]
    if (Array.isArray(raw)) {
      tags = raw
    } else if (Array.isArray(raw?.tags)) {
      tags = raw.tags
    } else {
      return { success: false as const, error: "Unexpected AI response format" }
    }

    const normalized = tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 5)

    return { success: true as const, data: normalized }
  } catch {
    return { success: false as const, error: "AI service unavailable. Please try again." }
  }
}
