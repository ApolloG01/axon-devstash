"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Copy, Check, Sparkles, Loader2, Crown, RefreshCw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useEditorPreferences } from "@/context/editor-preferences-context"
import { LANGUAGES } from "@/constants/languages"

type ExplainResult = { success: boolean; data?: string; error?: string }

interface CodeEditorProps {
  value: string
  language?: string
  onChange?: (value: string) => void
  onLanguageChange?: (lang: string) => void
  readOnly?: boolean
  className?: string
  isPro?: boolean
  onExplain?: () => Promise<ExplainResult>
}

export function CodeEditor({
  value,
  language,
  onChange,
  onLanguageChange,
  readOnly = false,
  className,
  isPro,
  onExplain,
}: CodeEditorProps) {
  const { copied, copy: handleCopy } = useCopyToClipboard()
  const { prefs } = useEditorPreferences()
  const [explanation, setExplanation] = useState<string | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code")

  const handleExplain = async () => {
    if (!onExplain) return
    setExplaining(true)
    const result = await onExplain()
    setExplaining(false)
    if (!result.success || !result.data) {
      const { toast } = await import("sonner")
      toast.error(result.error ?? "Failed to generate explanation")
      return
    }
    setExplanation(result.data)
    setActiveTab("explain")
  }

  const handleUpgradePrompt = async () => {
    const { toast } = await import("sonner")
    toast.info("Upgrade to Pro to use AI features", {
      action: { label: "Upgrade", onClick: () => { window.location.href = "/upgrade" } },
    })
  }

  const hasExplanation = explanation !== null

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.06]">
        {/* Left side: dots + language or tabs */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] shrink-0" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] shrink-0" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] shrink-0" />

          {hasExplanation ? (
            <div className="flex items-center gap-0.5 ml-2">
              <button
                onClick={() => setActiveTab("code")}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
                  activeTab === "code" ? "bg-white/10 text-white/90" : "text-white/40 hover:text-white/70"
                )}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab("explain")}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
                  activeTab === "explain" ? "bg-white/10 text-white/90" : "text-white/40 hover:text-white/70"
                )}
              >
                Explain
              </button>
            </div>
          ) : (
            onLanguageChange && !readOnly ? (
              <select
                value={language ?? "plaintext"}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="ml-2 text-[11px] font-mono text-white/50 bg-transparent border-none outline-none cursor-pointer hover:text-white/80 transition-colors appearance-none pr-3"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-[#2d2d2d] text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            ) : language ? (
              <span className="ml-2 text-[11px] text-white/40 font-mono capitalize">{language}</span>
            ) : null
          )}
        </div>

        {/* Right side: explain controls + copy */}
        <div className="flex items-center gap-2">
          {onExplain && (
            explaining ? (
              <span className="flex items-center gap-1 text-[11px] text-white/40">
                <Loader2 className="h-3 w-3 animate-spin" />
                Explaining…
              </span>
            ) : hasExplanation ? (
              <button
                onClick={handleExplain}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                title="Regenerate explanation"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            ) : isPro ? (
              <button
                onClick={handleExplain}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Explain
              </button>
            ) : (
              <button
                onClick={handleUpgradePrompt}
                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 transition-colors"
              >
                <Crown className="h-3 w-3" />
                Explain
              </button>
            )
          )}

          <button
            onClick={() => handleCopy(value)}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Body */}
      {activeTab === "explain" && explanation ? (
        <div className="bg-[#1e1e1e] p-4">
          <div className="markdown-preview text-[13px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <Editor
          value={value}
          language={language ?? "plaintext"}
          theme={prefs.theme}
          options={{
            readOnly,
            minimap: { enabled: prefs.minimap },
            scrollBeyondLastLine: false,
            wordWrap: prefs.wordWrap ? "on" : "off",
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            lineHeight: Math.round(prefs.fontSize * 1.6),
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              verticalSliderSize: 6,
              horizontalSliderSize: 6,
            },
            overviewRulerLanes: 0,
            renderLineHighlight: readOnly ? "none" : "line",
            contextmenu: false,
            folding: false,
            lineNumbers: readOnly ? "off" : "on",
            glyphMargin: false,
            lineDecorationsWidth: readOnly ? 0 : 8,
            lineNumbersMinChars: readOnly ? 0 : 3,
          }}
          onChange={(val) => onChange?.(val ?? "")}
          height="100%"
          className="min-h-[80px] max-h-[360px]"
          loading={
            <div className="flex items-center justify-center h-20 bg-[#1e1e1e]">
              <span className="text-xs text-white/30">Loading editor…</span>
            </div>
          }
          onMount={(editor) => {
            const updateHeight = () => {
              const contentHeight = Math.min(360, editor.getContentHeight())
              const domNode = editor.getDomNode()
              if (domNode) {
                domNode.style.height = `${contentHeight}px`
                editor.layout()
              }
            }
            editor.onDidContentSizeChange(updateHeight)
            updateHeight()
          }}
        />
      )}
    </div>
  )
}
