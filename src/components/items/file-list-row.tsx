import {
  FileText,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileType,
  Download,
} from "lucide-react"
import type { ItemWithType } from "@/lib/db/items"

const EXT_ICON_MAP: Record<string, React.ElementType> = {
  pdf: FileType,
  json: FileJson,
  csv: FileSpreadsheet,
  txt: FileText,
  md: FileText,
  xml: FileCode,
  yaml: FileCode,
  yml: FileCode,
  toml: FileCode,
  ini: FileCode,
}

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function FileExtIcon({ fileName }: { fileName: string }) {
  const ext = getExtension(fileName)
  const Icon = EXT_ICON_MAP[ext] ?? FileText
  return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

interface FileListRowProps {
  item: ItemWithType
  onClick: () => void
}

export function FileListRow({ item, onClick }: FileListRowProps) {
  const fileName = item.fileName ?? item.title

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
    >
      {/* Icon */}
      <FileExtIcon fileName={fileName} />

      {/* Name + meta */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <span className="text-sm font-medium truncate flex-1">{item.title}</span>

        {/* Size + date — stack on mobile, inline on sm+ */}
        <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
          {item.fileSize != null && (
            <span className="w-16 text-right">{formatBytes(item.fileSize)}</span>
          )}
          <span className="w-24">{formatDate(item.createdAt)}</span>
        </div>

        {/* Mobile: stacked */}
        <div className="flex sm:hidden flex-col items-end gap-0.5 shrink-0 text-xs text-muted-foreground">
          {item.fileSize != null && <span>{formatBytes(item.fileSize)}</span>}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>

      {/* Download button */}
      {item.fileUrl && (
        <a
          href={`/api/download/${item.id}`}
          download={fileName}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}
