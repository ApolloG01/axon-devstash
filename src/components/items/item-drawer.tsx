"use client"

import { useEffect, useState, useCallback } from "react"
import { Star, Pin, Copy, Pencil, Trash2, ExternalLink } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ICON_MAP } from "@/constants/icon-map"
import { cn } from "@/lib/utils"

type ItemFull = {
  id: string
  title: string
  description: string | null
  contentType: string
  content: string | null
  language: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  url: string | null
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: string
  createdAt: string
  updatedAt: string
  itemType: { id: string; name: string; color: string; icon: string }
  tags: Array<{ name: string }>
  collections: Array<{ collection: { id: string; name: string } }>
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DrawerSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-5 w-2/3 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-px bg-border" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-14 bg-muted rounded" />
        ))}
      </div>
      <div className="h-36 bg-muted rounded-md" />
      <div className="space-y-2">
        <div className="h-3 w-12 bg-muted rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}

function DrawerBody({ item }: { item: ItemFull }) {
  const [copied, setCopied] = useState(false)
  const IconComponent = ICON_MAP[item.itemType.icon]
  const copyText = item.contentType === "url" ? item.url : item.content

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border pr-10">
        <div className="flex items-center gap-1.5 mb-2">
          {IconComponent && (
            <IconComponent className="h-3.5 w-3.5 shrink-0" style={{ color: item.itemType.color }} />
          )}
          <span className="text-[11px] font-medium capitalize" style={{ color: item.itemType.color }}>
            {item.itemType.name}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug">{item.title}</h2>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={handleCopy}
          disabled={!copyText}
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2.5 text-xs gap-1.5", item.isFavorite && "text-amber-400 hover:text-amber-400")}
        >
          <Star className={cn("h-3.5 w-3.5", item.isFavorite && "fill-amber-400")} />
          Favorite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2.5 text-xs gap-1.5", item.isPinned && "text-sky-400 hover:text-sky-400")}
        >
          <Pin className={cn("h-3.5 w-3.5", item.isPinned && "fill-sky-400")} />
          Pin
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
        {item.contentType === "text" && item.content && (
          <div className="rounded-md border border-border overflow-hidden">
            {item.language && (
              <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                <span className="text-[11px] text-muted-foreground font-mono capitalize">
                  {item.language}
                </span>
              </div>
            )}
            <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed text-foreground/80">
              {item.content}
            </pre>
          </div>
        )}

        {item.contentType === "url" && item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-primary hover:underline break-all"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {item.url}
          </a>
        )}

        {item.contentType === "file" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{item.fileName ?? "Untitled file"}</span>
            {item.fileSize != null && (
              <span className="text-xs text-muted-foreground">({formatFileSize(item.fileSize)})</span>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {item.collections.length > 0 && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
              Collections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map(({ collection }) => (
                <span
                  key={collection.id}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                >
                  {collection.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last updated */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
            Last Updated
          </p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(item.updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}

interface ItemDrawerProps {
  itemId: string | null
  onClose: () => void
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemFull | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!itemId) {
      setItem(null)
      return
    }
    setLoading(true)
    setItem(null)
    fetch(`/api/items/${itemId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((data: ItemFull) => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [itemId])

  return (
    <Sheet
      open={!!itemId}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" showCloseButton className="w-full sm:max-w-md p-0 gap-0 overflow-hidden">
        {loading && <DrawerSkeleton />}
        {!loading && item && <DrawerBody item={item} />}
      </SheetContent>
    </Sheet>
  )
}
