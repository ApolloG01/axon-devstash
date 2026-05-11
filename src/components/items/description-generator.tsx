"use client"

import { useState } from "react"
import { Wand2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { generateDescription } from "@/actions/ai"

interface DescriptionGeneratorProps {
  title: string
  typeName: string
  content?: string
  url?: string
  fileName?: string
  fileSize?: number
  isPro: boolean
  className?: string
  onGenerate: (description: string) => void
}

export function DescriptionGenerator({
  title, typeName, content, url, fileName, fileSize, isPro, className, onGenerate,
}: DescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false)

  if (!isPro) return null

  async function handleClick() {
    setLoading(true)
    const result = await generateDescription({ title, typeName, content, url, fileName, fileSize })
    setLoading(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    onGenerate(result.data)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !title.trim()}
      title="Generate description with AI"
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        className,
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
    </button>
  )
}
