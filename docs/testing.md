# Testing

Vitest is configured for unit testing **server actions and utility functions only**. Components are not tested — verify UI behaviour in the browser.

## Running Tests

```bash
npm test          # run once (CI / pre-commit)
npm run test:watch  # watch mode during development
```

## Scope

| What to test | What not to test |
| ------------ | ---------------- |
| Server actions (`src/actions/`) | React components |
| `src/lib/utils.ts` helpers | Next.js routing |
| Pure business logic functions | Database queries (test against real DB, not unit tests) |

## File Convention

Co-locate test files next to the source file:

```
src/lib/utils.ts
src/lib/utils.test.ts

src/actions/items.ts
src/actions/items.test.ts
```

## Mocking Pattern for Server Actions

Server actions depend on `prisma`, `auth`, and other external modules. Mock them at the module level with `vi.mock`.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock before importing the module under test
vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { deleteItem } from "@/actions/items"

const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma)

describe("deleteItem", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)

    const result = await deleteItem("item-123")
    expect(result).toEqual({ success: false, error: "Not authenticated." })
  })

  it("returns error when item does not belong to user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockPrisma.item.findUnique.mockResolvedValue({ userId: "other-user" } as never)

    const result = await deleteItem("item-123")
    expect(result).toEqual({ success: false, error: "Not found." })
  })

  it("deletes item when ownership is confirmed", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockPrisma.item.findUnique.mockResolvedValue({ userId: "user-1" } as never)
    mockPrisma.item.delete.mockResolvedValue({} as never)

    const result = await deleteItem("item-123")
    expect(result).toEqual({ success: true })
  })
})
```

## What to Focus On

- **Auth enforcement** — unauthenticated requests always rejected
- **Ownership checks** — user can only mutate their own records
- **Input validation** — required fields, format checks, enum values
- **Business rules** — rate limits, Pro gates, duplicate prevention

Skip testing the happy path database round-trip — that belongs in integration/e2e tests.
