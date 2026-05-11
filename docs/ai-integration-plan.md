# AI Integration Plan

_Research date: 2026-05-11_

---

## Model Selection

The project spec references `gpt-4o-mini` (cost-effective for tagging, summaries, explanations). The research prompt mentions `gpt-5-nano` — **no such model exists in the OpenAI API at time of writing**. Use `gpt-4o-mini` as specified in the project overview. Revisit when OpenAI releases a nano-tier model.

---

## 1. SDK Setup

### Install

```bash
npm install openai
```

### Singleton (`src/lib/openai.ts`)

Follow the same lazy-init pattern already used in `src/lib/resend.ts`:

```ts
import OpenAI from "openai"

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set")
  }
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,       // SDK default — handles transient errors automatically
      timeout: 20_000,     // 20s; AI features should fail fast
    })
  }
  return _openai
}
```

Add `OPENAI_API_KEY` to `.env` and `.env.production`.

---

## 2. Feature Breakdown

### Feature A — Auto-tagging

**Pattern**: Non-streaming, structured JSON output.  
**When called**: After item creation (opt-in button or automatic for Pro users).  
**Model**: `gpt-4o-mini`

```ts
// src/actions/ai.ts  (excerpt)
"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { getOpenAI } from "@/lib/openai"
import { checkAiGate } from "@/lib/usage-limits"

const TagsSchema = z.object({
  tags: z.array(z.string().max(30)).max(8),
})

export async function suggestTags(itemId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  if (!session.user.isPro) return { success: false, error: "Pro feature" }

  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 100,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Return a JSON object with a "tags" array of 3-8 short, lowercase, hyphenated tags that describe the content. Example: {"tags":["react","hooks","useEffect"]}',
      },
      { role: "user", content: content.slice(0, 2000) }, // cap input
    ],
  })

  const raw = response.choices[0]?.message?.content ?? "{}"
  const parsed = TagsSchema.safeParse(JSON.parse(raw))
  if (!parsed.success) return { success: false, error: "Failed to parse tags" }

  return { success: true, data: parsed.data.tags }
}
```

**UI**: Show suggested tags as clickable chips with "Accept / Dismiss" above the tag input in the item drawer edit mode.

---

### Feature B — AI Summary

**Pattern**: Non-streaming, plain text output.  
**When called**: On-demand button in item drawer (view mode).  
**Model**: `gpt-4o-mini`

```ts
export async function summarizeItem(content: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  if (!session.user.isPro) return { success: false, error: "Pro feature" }

  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 150,
    messages: [
      {
        role: "system",
        content: "Summarize the following developer content in 1-2 sentences. Be concise and technical.",
      },
      { role: "user", content: content.slice(0, 4000) },
    ],
  })

  const summary = response.choices[0]?.message?.content?.trim()
  if (!summary) return { success: false, error: "No summary generated" }

  return { success: true, data: summary }
}
```

**UI**: Inline collapsible panel below the item description. "Summarize" button → loading skeleton → rendered text with copy button.

---

### Feature C — Code Explanation

**Pattern**: **Streaming** — best UX for longer explanations.  
**Delivery**: Via a `POST /api/ai/explain` API route (streaming requires an API route, not a Server Action).  
**Model**: `gpt-4o-mini`

```ts
// src/app/api/ai/explain/route.ts
import { auth } from "@/auth"
import { getOpenAI } from "@/lib/openai"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isPro) {
    return new Response("Pro feature", { status: 403 })
  }

  const { code, language } = await req.json()
  if (!code || typeof code !== "string") {
    return new Response("Missing code", { status: 400 })
  }

  const openai = getOpenAI()

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are an expert ${language ?? "code"} explainer. Explain what the following code does in plain English, step by step. Be concise.`,
      },
      { role: "user", content: code.slice(0, 6000) },
    ],
  })

  // Return a ReadableStream for the client to consume
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ""
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
```

**Client consumption**:

```ts
async function explainCode(code: string, language: string) {
  const res = await fetch("/api/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let result = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value)
    setExplanation(result) // streaming state update
  }
}
```

**UI**: "Explain" button in CodeEditor toolbar → panel slides down below editor → text streams in character-by-character.

---

### Feature D — Prompt Optimizer

**Pattern**: **Streaming** (same rationale as code explanation).  
**Delivery**: `POST /api/ai/optimize` API route.  
**Model**: `gpt-4o-mini`

```ts
// src/app/api/ai/optimize/route.ts
// Same structure as /explain — swap system prompt:
{
  role: "system",
  content:
    "You are an expert prompt engineer. Rewrite the following AI prompt to be clearer, more specific, and more effective. Output only the improved prompt — no explanation.",
}
```

**UI**: "Optimize" button in MarkdownEditor toolbar (prompt type only) → streaming preview panel alongside the original → "Accept" replaces content, "Dismiss" discards.

---

## 3. Streaming vs Non-Streaming Decision Matrix

| Feature          | Approach        | Reason |
|------------------|----------------|--------|
| Auto-tagging     | Non-streaming  | Short output (< 100 tokens), structured JSON |
| AI Summary       | Non-streaming  | Short output (< 150 tokens), plain text |
| Code Explanation | **Streaming**  | 200-500 tokens, UX benefits from progressive reveal |
| Prompt Optimizer | **Streaming**  | 100-400 tokens, user compares old vs new as it generates |

**Constraint**: Server Actions cannot stream. Use API routes (`/api/ai/*`) for streaming features.

---

## 4. Pro User Gating

### Add `checkAiGate` to `src/lib/usage-limits.ts`

```ts
export function checkAiGate(isPro: boolean): string | null {
  if (isPro) return null
  return "AI features are available on the Pro plan."
}
```

### Apply in every action / route

```ts
// Server Action (non-streaming)
if (!session.user.isPro) return { success: false, error: "Pro feature" }

// API Route (streaming)
if (!session?.user?.isPro) return new Response("Pro feature", { status: 403 })
```

### UI Gate

In the drawer / editor, show a disabled button with tooltip:

```tsx
<Button disabled={!isPro} title={!isPro ? "Upgrade to Pro to use AI features" : undefined}>
  <Sparkles className="h-3.5 w-3.5" />
  {isPro ? "Explain" : "Explain (Pro)"}
</Button>
```

Clicking a locked button should navigate to `/upgrade`.

---

## 5. Rate Limiting

Extend the existing `src/lib/rate-limit.ts` pattern:

```ts
// 20 AI calls per hour per user (Pro only, so abuse surface is limited)
export async function checkAiLimit(userId: string): Promise<RateLimitResult> {
  return check("ai", 20, "1 h", userId)
}
```

Apply in every AI action before calling OpenAI:

```ts
const limit = await checkAiLimit(session.user.id)
if (limit.limited) return { success: false, error: "Too many AI requests. Try again shortly." }
```

For API routes, return `429` with `Retry-After` header:

```ts
if (limit.limited) {
  return new Response("Rate limit exceeded", {
    status: 429,
    headers: { "Retry-After": String(limit.retryAfterSeconds) },
  })
}
```

---

## 6. Error Handling

### SDK error types

```ts
import OpenAI from "openai"

try {
  const response = await openai.chat.completions.create(...)
} catch (err) {
  if (err instanceof OpenAI.RateLimitError) {
    return { success: false, error: "OpenAI rate limit hit. Try again in a moment." }
  }
  if (err instanceof OpenAI.APIError) {
    // err.status, err.name available
    return { success: false, error: "AI service temporarily unavailable." }
  }
  return { success: false, error: "Unexpected error." }
}
```

The SDK automatically retries on transient errors (configurable via `maxRetries`). Set `maxRetries: 2` on the singleton.

---

## 7. Cost Optimization

| Strategy | Detail |
|----------|--------|
| **Right-sized model** | `gpt-4o-mini` costs ~30× less than `gpt-4o` for comparable quality on these tasks |
| **Cap input tokens** | Slice `content` before sending: 2000 chars for tags/summary, 6000 for explanation/optimization |
| **Cap output tokens** | Always set `max_tokens`: 100 for tags, 150 for summary, 500 for explanation, 400 for optimizer |
| **Low temperature for structured output** | `temperature: 0` for tagging (deterministic JSON), `0.3` for summaries |
| **No caching needed for MVP** | These are on-demand actions; add Redis caching only if cost becomes a concern |
| **Estimated cost** | At 200 calls/day: ~$0.05/day ($1.50/month) — negligible at current scale |

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| **API key exposure** | Key only lives in `process.env` on the server; never exposed to client |
| **Prompt injection** | Treat user content as data, never instruction. Wrap in a fixed system prompt. Slice to reasonable lengths. |
| **Input sanitization** | Strip null bytes and control characters before sending to OpenAI: `content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")` |
| **Output trust** | Never execute or `eval()` AI output. Render summaries/explanations as plain text only. Tags are validated by Zod before use. |
| **Auth on every action** | Auth guard (`session?.user?.id`) is the first check in every action and route handler — before any OpenAI call |

---

## 9. UI Patterns Summary

| Feature | Entry point | Loading state | Result | Actions |
|---------|------------|--------------|--------|---------|
| Auto-tagging | "Suggest Tags" button in drawer edit mode | Shimmer on tag area | Chip row above tag input | Accept all / Accept individual / Dismiss |
| Summary | "Summarize" button in drawer view mode | Skeleton 2 lines | Collapsible text panel | Copy / Dismiss |
| Code Explanation | "Explain" button in CodeEditor toolbar | Streaming text renders in real time | Panel below editor | Copy / Dismiss |
| Prompt Optimizer | "Optimize" button in MarkdownEditor toolbar (prompt type only) | Streaming into preview pane | Side-by-side old/new | Accept (replaces content) / Dismiss |

---

## 10. File Structure

```
src/
├── lib/
│   └── openai.ts                   # Singleton OpenAI client
├── actions/
│   └── ai.ts                       # suggestTags, summarizeItem (non-streaming)
├── app/
│   └── api/
│       └── ai/
│           ├── explain/route.ts    # Streaming code explanation
│           └── optimize/route.ts   # Streaming prompt optimizer
└── components/
    └── items/
        ├── ai-tag-suggestions.tsx  # Accept/dismiss tag chips
        ├── ai-summary-panel.tsx    # Collapsible summary display
        └── ai-stream-panel.tsx     # Reusable streaming text panel (explain + optimize)
```

---

## 11. .env additions

```bash
# .env and .env.production
OPENAI_API_KEY='sk-...'
```

---

## Implementation Order (suggested)

1. `src/lib/openai.ts` singleton + `checkAiGate` in usage-limits
2. `suggestTags` server action + `AiTagSuggestions` UI component
3. `summarizeItem` server action + `AiSummaryPanel` UI component
4. `/api/ai/explain` route + `AiStreamPanel` component + CodeEditor integration
5. `/api/ai/optimize` route + MarkdownEditor integration (reuses `AiStreamPanel`)
6. Rate limiting on all five entry points
