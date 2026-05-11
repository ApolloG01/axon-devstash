"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, Check, X } from "lucide-react"
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isPro || title.trim().length < 3) {
      setSuggestions([])
      setLoading(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    setSuggestions([])
    setLoading(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const result = await generateAutoTags({ title, content, typeName })
      setLoading(false)
      if (result.success) {
        setSuggestions(result.data)
      }
    }, 800)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [title, content, typeName, isPro])

  function handleAccept(tag: string) {
    onAccept(tag)
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  function handleReject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  if (!isPro || title.trim().length < 3) return null

  return (
    <div className="flex flex-col gap-1.5 min-h-6">
      {loading && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Suggesting tags…
        </div>
      )}
      {!loading && suggestions.length > 0 && (
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
                title="Add tag"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleReject(tag)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Dismiss"
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
