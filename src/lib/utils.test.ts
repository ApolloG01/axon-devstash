import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8")
  })

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b")
  })

  it("handles conditional objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })
})
