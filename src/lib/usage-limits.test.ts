import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}))

import { prisma } from "@/lib/prisma"
import { checkItemLimit, checkCollectionLimit } from "@/lib/usage-limits"

const mockItemCount = vi.mocked(prisma.item.count)
const mockCollectionCount = vi.mocked(prisma.collection.count)

describe("checkItemLimit", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when Free user is under the limit", async () => {
    mockItemCount.mockResolvedValue(49)
    const result = await checkItemLimit("user-1", false)
    expect(result).toBeNull()
  })

  it("returns an error string when Free user is at the limit", async () => {
    mockItemCount.mockResolvedValue(50)
    const result = await checkItemLimit("user-1", false)
    expect(result).toMatch(/50 items/)
    expect(result).toMatch(/Upgrade to Pro/)
  })

  it("returns null for Pro user even when over the free limit", async () => {
    const result = await checkItemLimit("user-1", true)
    expect(result).toBeNull()
    expect(mockItemCount).not.toHaveBeenCalled()
  })
})

describe("checkCollectionLimit", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when Free user is under the limit", async () => {
    mockCollectionCount.mockResolvedValue(2)
    const result = await checkCollectionLimit("user-1", false)
    expect(result).toBeNull()
  })

  it("returns an error string when Free user is at the limit", async () => {
    mockCollectionCount.mockResolvedValue(3)
    const result = await checkCollectionLimit("user-1", false)
    expect(result).toMatch(/3 collections/)
    expect(result).toMatch(/Upgrade to Pro/)
  })

  it("returns null for Pro user even when over the free limit", async () => {
    const result = await checkCollectionLimit("user-1", true)
    expect(result).toBeNull()
    expect(mockCollectionCount).not.toHaveBeenCalled()
  })
})
