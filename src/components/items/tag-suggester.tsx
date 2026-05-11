"use client"

import { useState } from "react"
import { Sparkles, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { generateAutoTags } from "@/actions/ai"

interface TagSuggesterProps {
  title: string
  content?: string
  typeName: string
  isPro: boolean
  onAccept: (tag: string) => void
}

export function TagSuggester({ title, content, typeName, isPro, onAccept }: TagSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  if (!isPro) return null

  async function handleSuggest() {
    if (!title.trim()) {
      toast.error("Enter a title first")
      return
    }
    setLoading(true)
    setSuggestions([])
    const result = await generateAutoTags({ title, content, typeName })
    setLoading(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to generate tags")
      return
    }
    setSuggestions(result.data)
  }

  function handleAccept(tag: string) {
    onAccept(tag)
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  function handleReject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground w-fit"
        onClick={handleSuggest}
        disabled={loading}
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Suggesting…" : "Suggest Tags"}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] bg-muted/60 border border-border rounded-full px-2 py-0.5"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleAccept(tag)}
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
                title="Accept"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleReject(tag)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Reject"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
