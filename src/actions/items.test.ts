import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

import { auth } from "@/auth"
import { updateItem } from "@/actions/items"

const mockAuth = vi.mocked(auth)

describe("updateItem", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateItem("item-1", { title: "Test", tags: [] })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const result = await updateItem("item-1", { title: "", tags: [] })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Title is required")
  })

  it("returns validation error for invalid URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const result = await updateItem("item-1", { title: "Test", url: "not-a-url", tags: [] })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Invalid URL")
  })

  it("returns error when item not found or not owned", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.item.findUnique).mockResolvedValue(null)
    const result = await updateItem("item-1", { title: "Test", tags: [] })
    expect(result).toEqual({ success: false, error: "Item not found" })
  })
})
