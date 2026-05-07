"use client"

import Editor from "@monaco-editor/react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

interface CodeEditorProps {
  value: string
  language?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  className?: string
}

export function CodeEditor({ value, language, onChange, readOnly = false, className }: CodeEditorProps) {
  const { copied, copy: handleCopy } = useCopyToClipboard()

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          {language && (
            <span className="ml-2 text-[11px] text-white/40 font-mono capitalize">{language}</span>
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

      {/* Monaco Editor */}
      <Editor
        value={value}
        language={language ?? "plaintext"}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fontSize: 12,
          lineHeight: 20,
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
          // Fit height to content up to max
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
    </div>
  )
}
