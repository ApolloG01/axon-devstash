"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check, Wand2, Loader2, Crown, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

type OptimizeResult = { success: boolean; data?: string; error?: string }

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  className?: string
  isPro?: boolean
  onOptimize?: () => Promise<OptimizeResult>
  onUseOptimized?: (optimized: string) => void
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
  isPro,
  onOptimize,
  onUseOptimized,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write")
  const [optimized, setOptimized] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<"original" | "optimized">("original")
  const { copied, copy: handleCopy } = useCopyToClipboard()

  const showPreview = readOnly || tab === "preview"
  const hasOptimized = optimized !== null
  const showOptimized = readOnly && hasOptimized && activeTab === "optimized"

  const handleOptimize = async () => {
    if (!onOptimize) return
    setOptimizing(true)
    const result = await onOptimize()
    setOptimizing(false)
    if (!result.success || !result.data) {
      const { toast } = await import("sonner")
      toast.error(result.error ?? "Failed to optimize prompt")
      return
    }
    setOptimized(result.data)
    setActiveTab("optimized")
  }

  const handleUpgradePrompt = async () => {
    const { toast } = await import("sonner")
    toast.info("Upgrade to Pro to use AI features", {
      action: { label: "Upgrade", onClick: () => { window.location.href = "/upgrade" } },
    })
  }

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-white/[0.06]">
        <div className="flex items-center gap-0.5">
          {readOnly ? (
            hasOptimized ? (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setActiveTab("original")}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
                    activeTab === "original" ? "bg-white/10 text-white/90" : "text-white/40 hover:text-white/70"
                  )}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveTab("optimized")}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
                    activeTab === "optimized" ? "bg-white/10 text-white/90" : "text-white/40 hover:text-white/70"
                  )}
                >
                  Optimized
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-white/40 font-medium">Markdown</span>
            )
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

        <div className="flex items-center gap-2">
          {onOptimize && (
            optimizing ? (
              <span className="flex items-center gap-1 text-[11px] text-white/40">
                <Loader2 className="h-3 w-3 animate-spin" />
                Optimizing…
              </span>
            ) : hasOptimized ? (
              <button
                onClick={handleOptimize}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                title="Re-optimize"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            ) : isPro ? (
              <button
                onClick={handleOptimize}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                <Wand2 className="h-3 w-3" />
                Optimize
              </button>
            ) : (
              <button
                onClick={handleUpgradePrompt}
                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 transition-colors"
              >
                <Crown className="h-3 w-3" />
                Optimize
              </button>
            )
          )}

          <button
            onClick={() => handleCopy(showOptimized ? optimized! : value)}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
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
        <div>
          <div
            className="markdown-preview bg-[#1e1e1e] px-4 py-3 min-h-[80px] max-h-[360px] overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#4a4a4a transparent" }}
          >
            {showOptimized ? (
              optimized ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimized}</ReactMarkdown>
              ) : (
                <span className="text-white/20 text-xs italic">Nothing to preview</span>
              )
            ) : value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <span className="text-white/20 text-xs italic">Nothing to preview</span>
            )}
          </div>

          {showOptimized && onUseOptimized && (
            <div className="bg-[#1e1e1e] px-4 pb-3 border-t border-white/[0.04]">
              <button
                onClick={() => onUseOptimized(optimized!)}
                className="mt-2 px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Use This
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
