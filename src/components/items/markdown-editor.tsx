"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  className?: string
}

export function MarkdownEditor({ value, onChange, readOnly = false, className }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write")
  const { copied, copy: handleCopy } = useCopyToClipboard()

  const showPreview = readOnly || tab === "preview"

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-white/[0.06]">
        <div className="flex items-center gap-0.5">
          {readOnly ? (
            <span className="text-[11px] text-white/40 font-medium">Markdown</span>
          ) : (
            <>
              <button
                onClick={() => setTab("write")}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                  tab === "write" ? "bg-white/10 text-white/80" : "text-white/40 hover:text-white/60"
                )}
              >
                Write
              </button>
              <button
                onClick={() => setTab("preview")}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                  tab === "preview" ? "bg-white/10 text-white/80" : "text-white/40 hover:text-white/60"
                )}
              >
                Preview
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => handleCopy(value)}
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Write tab */}
      {!readOnly && tab === "write" && (
        <textarea
          className="w-full bg-[#1e1e1e] text-[13px] text-white/80 font-mono px-4 py-3 focus:outline-none resize-none leading-relaxed min-h-[120px] max-h-[360px] overflow-y-auto"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown here..."
          style={{ scrollbarWidth: "thin", scrollbarColor: "#4a4a4a transparent" }}
        />
      )}

      {/* Preview */}
      {showPreview && (
        <div
          className="markdown-preview bg-[#1e1e1e] px-4 py-3 min-h-[80px] max-h-[360px] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#4a4a4a transparent" }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <span className="text-white/20 text-xs italic">Nothing to preview</span>
          )}
        </div>
      )}
    </div>
  )
}
