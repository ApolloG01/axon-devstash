"use server"

import { z } from "zod"
import { getOpenAI, AI_MODEL } from "@/lib/openai"
import { requireProAiSession } from "@/lib/action-guards"

const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1),
  typeName: z.string().trim().min(1),
  content: z.string().optional(),
  url: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
})

export async function generateDescription(input: z.input<typeof generateDescriptionSchema>) {
  const guard = await requireProAiSession()
  if ("success" in guard) return guard

  const parsed = generateDescriptionSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Invalid input" }

  const { title, typeName, content, url, fileName, fileSize } = parsed.data

  let context = `Item type: ${typeName}\nTitle: ${title}`
  if (content) context += `\nContent:\n${content.slice(0, 2000)}`
  if (url) context += `\nURL: ${url}`
  if (fileName) context += `\nFile name: ${fileName}`
  if (fileSize != null) context += `\nFile size: ${fileSize} bytes`

  try {
    const client = getOpenAI()
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a developer knowledge base assistant. Write a concise 1-2 sentence description for the given item that helps the user understand what it is and why it's useful. Be specific and practical. Return plain text only — no markdown, no bullet points, no quotes.",
        },
        {
          role: "user",
          content: `Write a short description for this ${typeName}:\n${context}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) {
      return { success: false as const, error: "AI returned an empty response. Please try again." }
    }

    return { success: true as const, data: text }
  } catch (err) {
    console.error("[generateDescription]", err)
    return { success: false as const, error: "AI service unavailable. Please try again." }
  }
}

const explainCodeSchema = z.object({
  content: z.string().trim().min(1),
  language: z.string().optional(),
  typeName: z.string().trim().min(1),
})

export async function explainCode(input: z.input<typeof explainCodeSchema>) {
  const guard = await requireProAiSession()
  if ("success" in guard) return guard

  const parsed = explainCodeSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Invalid input" }

  const { content, language, typeName } = parsed.data
  const truncated = content.slice(0, 3000)
  const langLabel = language && language !== "plaintext" ? ` (${language})` : ""

  try {
    const client = getOpenAI()
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a developer assistant. Explain the given code or command clearly and concisely in 200-300 words. Cover what it does, how it works, and any key concepts or patterns used. Use markdown formatting with short paragraphs. Do not repeat the code itself.",
        },
        {
          role: "user",
          content: `Explain this ${typeName}${langLabel}:\n\`\`\`\n${truncated}\n\`\`\``,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) {
      return { success: false as const, error: "AI returned an empty response. Please try again." }
    }

    return { success: true as const, data: text }
  } catch (err) {
    console.error("[explainCode]", err)
    return { success: false as const, error: "AI service unavailable. Please try again." }
  }
}

const optimizePromptSchema = z.object({
  content: z.string().trim().min(1),
})

export async function optimizePrompt(input: z.input<typeof optimizePromptSchema>) {
  const guard = await requireProAiSession()
  if ("success" in guard) return guard

  const parsed = optimizePromptSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Invalid input" }

  const { content } = parsed.data
  const truncated = content.slice(0, 3000)

  try {
    const client = getOpenAI()
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert prompt engineer. Improve the given prompt to make it clearer, more specific, and more effective while preserving the original intent. Return only the improved prompt text — no explanations, no preamble, no quotes.",
        },
        {
          role: "user",
          content: `Optimize this prompt:\n\n${truncated}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) {
      return { success: false as const, error: "AI returned an empty response. Please try again." }
    }

    return { success: true as const, data: text }
  } catch (err) {
    console.error("[optimizePrompt]", err)
    return { success: false as const, error: "AI service unavailable. Please try again." }
  }
}

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().optional(),
  typeName: z.string().trim().min(1),
})

export async function generateAutoTags(input: z.input<typeof generateAutoTagsSchema>) {
  const guard = await requireProAiSession()
  if ("success" in guard) return guard

  const parsed = generateAutoTagsSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Invalid input" }

  const { title, content, typeName } = parsed.data
  const truncated = content ? content.slice(0, 2000) : ""
  const inputText = `Item type: ${typeName}\nTitle: ${title}${truncated ? `\nContent:\n${truncated}` : ""}`

  try {
    const client = getOpenAI()
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a developer knowledge tagging assistant. Generate specific, searchable tags that help developers find this item later.\n\nGood tags: programming languages (javascript, python, rust), frameworks (react, nextjs, django), libraries (lodash, axios), concepts (closures, caching, jwt), tools (docker, webpack), patterns (singleton, debounce).\n\nAvoid generic terms like: code, snippet, developer, programming, function, item, tool, example, tutorial, script.\n\nReturn ONLY a valid JSON object with a "tags" key containing an array of 3-6 lowercase strings. Example: {"tags": ["javascript", "closures", "scope", "es2015"]}',
        },
        {
          role: "user",
          content: `Generate specific tags for this ${typeName}:\n${inputText}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      return { success: false as const, error: "AI returned an empty response. Please try again." }
    }

    const raw = JSON.parse(text)
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
      .slice(0, 6)

    return { success: true as const, data: normalized }
  } catch (err) {
    console.error("[generateAutoTags]", err)
    return { success: false as const, error: "AI service unavailable. Please try again." }
  }
}
