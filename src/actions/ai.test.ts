import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/rate-limit", () => ({
  checkAiTagLimit: vi.fn(),
}))

vi.mock("@/lib/openai", () => ({
  AI_MODEL: "gpt-4o-mini",
  getOpenAI: vi.fn(),
}))

import { auth } from "@/auth"
import { checkAiTagLimit } from "@/lib/rate-limit"
import { getOpenAI } from "@/lib/openai"
import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from "@/actions/ai"

const mockAuth = vi.mocked(auth)
const mockCheckAiTagLimit = vi.mocked(checkAiTagLimit)
const mockGetOpenAI = vi.mocked(getOpenAI)

const proSession = { user: { id: "user-1", isPro: true } }
const freeSession = { user: { id: "user-1", isPro: false } }

function mockOpenAI(content: string) {
  mockGetOpenAI.mockReturnValue({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  } as never)
}

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAiTagLimit.mockResolvedValue({ limited: false })
  })

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await generateAutoTags({ title: "Test", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never)
    const result = await generateAutoTags({ title: "Test", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Pro plan required for AI features" })
  })

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockCheckAiTagLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 60 })
    const result = await generateAutoTags({ title: "Test", typeName: "snippet" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Rate limit exceeded")
  })

  it("returns tags from AI response with tags object format", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI(JSON.stringify({ tags: ["react", "hooks", "typescript"] }))

    const result = await generateAutoTags({ title: "Custom hook", typeName: "snippet" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(["react", "hooks", "typescript"])
    }
  })

  it("handles bare array response format", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI(JSON.stringify(["react", "hooks", "typescript"]))

    const result = await generateAutoTags({ title: "Custom hook", typeName: "snippet" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(["react", "hooks", "typescript"])
    }
  })

  it("normalizes tags to lowercase", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI(JSON.stringify({ tags: ["React", "TypeScript", "HOOKS"] }))

    const result = await generateAutoTags({ title: "Custom hook", typeName: "snippet" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(["react", "typescript", "hooks"])
    }
  })

  it("returns error when AI service throws", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error("Service unavailable")),
        },
      },
    } as never)

    const result = await generateAutoTags({ title: "Test", typeName: "snippet" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("AI service unavailable")
  })
})

describe("explainCode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAiTagLimit.mockResolvedValue({ limited: false })
  })

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await explainCode({ content: "console.log('hi')", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never)
    const result = await explainCode({ content: "console.log('hi')", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Pro plan required for AI features" })
  })

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockCheckAiTagLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 45 })
    const result = await explainCode({ content: "ls -la", typeName: "command" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Rate limit exceeded")
  })

  it("returns explanation from AI", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI("This snippet logs 'hi' to the console.")
    const result = await explainCode({ content: "console.log('hi')", language: "javascript", typeName: "snippet" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("This snippet logs 'hi' to the console.")
    }
  })

  it("returns error when AI returns empty content", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI("")
    const result = await explainCode({ content: "echo hello", typeName: "command" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("empty response")
  })

  it("returns error when AI service throws", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error("Timeout")),
        },
      },
    } as never)
    const result = await explainCode({ content: "select * from users", typeName: "snippet" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("AI service unavailable")
  })
})

describe("generateDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAiTagLimit.mockResolvedValue({ limited: false })
  })

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await generateDescription({ title: "Test", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never)
    const result = await generateDescription({ title: "Test", typeName: "snippet" })
    expect(result).toEqual({ success: false, error: "Pro plan required for AI features" })
  })

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockCheckAiTagLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 30 })
    const result = await generateDescription({ title: "Test", typeName: "snippet" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Rate limit exceeded")
  })

  it("returns generated description from AI", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "A reusable React hook for debouncing values." } }],
          }),
        },
      },
    } as never)

    const result = await generateDescription({ title: "useDebounce", typeName: "snippet", content: "function useDebounce..." })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("A reusable React hook for debouncing values.")
    }
  })

  it("returns error when AI returns empty content", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "" } }],
          }),
        },
      },
    } as never)

    const result = await generateDescription({ title: "Test", typeName: "link", url: "https://example.com" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("empty response")
  })

  it("returns error when AI service throws", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error("Network error")),
        },
      },
    } as never)

    const result = await generateDescription({ title: "My file", typeName: "file", fileName: "report.pdf" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("AI service unavailable")
  })
})

describe("optimizePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAiTagLimit.mockResolvedValue({ limited: false })
  })

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await optimizePrompt({ content: "Write me a poem" })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never)
    const result = await optimizePrompt({ content: "Write me a poem" })
    expect(result).toEqual({ success: false, error: "Pro plan required for AI features" })
  })

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockCheckAiTagLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 30 })
    const result = await optimizePrompt({ content: "Write me a poem" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Rate limit exceeded")
  })

  it("returns optimized prompt from AI", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI("Write a haiku about the ocean with vivid imagery and a sense of calm.")
    const result = await optimizePrompt({ content: "Write me a poem about the sea" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("Write a haiku about the ocean with vivid imagery and a sense of calm.")
    }
  })

  it("returns error when AI returns empty content", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockOpenAI("")
    const result = await optimizePrompt({ content: "Summarize this" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("empty response")
  })

  it("returns error when AI service throws", async () => {
    mockAuth.mockResolvedValue(proSession as never)
    mockGetOpenAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error("Timeout")),
        },
      },
    } as never)
    const result = await optimizePrompt({ content: "Tell me about React hooks" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("AI service unavailable")
  })
})
