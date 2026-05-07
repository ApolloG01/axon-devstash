"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, FileIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg"
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini"

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
])

const FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
])

const IMAGE_MAX = 5 * 1024 * 1024
const FILE_MAX = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type UploadedFile = {
  url: string
  fileName: string
  fileSize: number
}

interface FileUploadProps {
  kind: "file" | "image"
  onUpload: (result: UploadedFile) => void
  onClear: () => void
  uploaded: UploadedFile | null
}

export function FileUpload({ kind, onUpload, onClear, uploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const accept = kind === "image" ? IMAGE_ACCEPT : FILE_ACCEPT
  const allowedTypes = kind === "image" ? IMAGE_TYPES : FILE_TYPES
  const maxBytes = kind === "image" ? IMAGE_MAX : FILE_MAX
  const maxLabel = kind === "image" ? "5 MB" : "10 MB"

  const upload = useCallback(
    async (file: File) => {
      setError(null)

      if (!allowedTypes.has(file.type)) {
        setError("Unsupported file type")
        return
      }
      if (file.size > maxBytes) {
        setError(`File exceeds ${maxLabel} limit`)
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("kind", kind)

      setProgress(0)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload")

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        setProgress(null)
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as UploadedFile
          onUpload(data)
        } else {
          const body = JSON.parse(xhr.responseText) as { error?: string }
          setError(body.error ?? "Upload failed")
        }
      }

      xhr.onerror = () => {
        setProgress(null)
        setError("Upload failed")
      }

      xhr.send(formData)
    },
    [allowedTypes, kind, maxBytes, maxLabel, onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) upload(file)
    },
    [upload]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ""
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/20 text-sm">
        {kind === "image" ? (
          <ImageIcon className="h-4 w-4 text-pink-400 shrink-0" />
        ) : (
          <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 truncate font-medium">{uploaded.fileName}</span>
        <span className="text-xs text-muted-foreground shrink-0">{formatBytes(uploaded.fileSize)}</span>
        <button
          onClick={onClear}
          className="ml-1 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={progress !== null}
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 py-6 rounded-md border-2 border-dashed transition-colors text-sm",
          dragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
          progress !== null && "opacity-60 cursor-not-allowed"
        )}
      >
        <Upload className="h-5 w-5" />
        {progress !== null ? (
          <span>Uploading… {progress}%</span>
        ) : (
          <>
            <span>Drop {kind === "image" ? "an image" : "a file"} or click to browse</span>
            <span className="text-xs opacity-70">
              {kind === "image"
                ? `PNG, JPG, GIF, WebP, SVG — max ${maxLabel}`
                : `PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max ${maxLabel}`}
            </span>
          </>
        )}
      </button>

      {progress !== null && (
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
