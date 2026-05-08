import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

import { auth } from "@/auth"
import { updateItem, deleteItem, createItem } from "@/actions/items"

const mockAuth = vi.mocked(auth)

describe("updateItem", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
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

describe("deleteItem", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await deleteItem("item-1")
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error when item not found or not owned", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.item.findUnique).mockResolvedValue(null)
    const result = await deleteItem("item-1")
    expect(result).toEqual({ success: false, error: "Item not found" })
  })

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.item.findUnique).mockResolvedValue({ id: "item-1" } as never)
    vi.mocked(prisma.item.delete).mockResolvedValue({} as never)
    const result = await deleteItem("item-1")
    expect(result).toEqual({ success: true })
  })
})

const validCreateInput = {
  itemTypeId: "type-1",
  contentType: "text" as const,
  title: "My Snippet",
  tags: [],
}

describe("createItem", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await createItem(validCreateInput)
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const result = await createItem({ ...validCreateInput, title: "" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Title is required")
  })

  it("returns validation error when itemTypeId is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const result = await createItem({ ...validCreateInput, itemTypeId: "" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Type is required")
  })

  it("returns validation error for invalid URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    const result = await createItem({ ...validCreateInput, contentType: "url", url: "not-a-url" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("Invalid URL")
  })

  it("returns success with created item", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as never)
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.item.count).mockResolvedValue(0)
    const mockItem = { id: "item-1", title: "My Snippet" }
    vi.mocked(prisma.item.create).mockResolvedValue(mockItem as never)
    const result = await createItem(validCreateInput)
    expect(result).toEqual({ success: true, data: mockItem })
  })
})
