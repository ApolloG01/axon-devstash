"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Star, Pin, Copy, Pencil, Trash2, ExternalLink, Save, X, Download } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ICON_MAP } from "@/constants/icon-map"
import { cn } from "@/lib/utils"
import { updateItem, deleteItem, toggleFavorite, togglePin } from "@/actions/items"
import { getCollectionsForPicker } from "@/actions/collections"
import { CodeEditor } from "@/components/items/code-editor"
import { MarkdownEditor } from "@/components/items/markdown-editor"
import { CollectionPicker, type CollectionOption } from "@/components/items/collection-picker"
import type { SerializedItemFull } from "@/lib/db/items"

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

const TEXT_TYPES = new Set(["snippet", "prompt", "command", "note"])
const LANGUAGE_TYPES = new Set(["snippet", "command"])
const MARKDOWN_TYPES = new Set(["note", "prompt"])

// ─── Action bar ────────────────────────────────────────────────────────────

interface DrawerActionBarProps {
  editing: boolean
  saving: boolean
  toggling: boolean
  copied: boolean
  isFavorite: boolean
  isPinned: boolean
  hasCopyText: boolean
  titleIsEmpty: boolean
  onCopy: () => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onToggleFavorite: () => void
  onTogglePin: () => void
  onDeleteClick: () => void
}

function DrawerActionBar({
  editing, saving, toggling, copied,
  isFavorite, isPinned, hasCopyText, titleIsEmpty,
  onCopy, onEdit, onSave, onCancel, onToggleFavorite, onTogglePin, onDeleteClick,
}: DrawerActionBarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border">
      {editing ? (
        <>
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={onSave}
            disabled={titleIsEmpty || saving}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={onCopy}
            disabled={!hasCopyText}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 px-2.5 text-xs gap-1.5", isFavorite && "text-amber-400 hover:text-amber-400")}
            onClick={onToggleFavorite}
            disabled={toggling}
          >
            <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-amber-400")} />
            Favorite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 px-2.5 text-xs gap-1.5", isPinned && "text-sky-400 hover:text-sky-400")}
            onClick={onTogglePin}
            disabled={toggling}
          >
            <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-sky-400")} />
            Pin
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDeleteClick}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </>
      )}
    </div>
  )
}

// ─── Content section ────────────────────────────────────────────────────────

interface ItemContentSectionProps {
  item: SerializedItemFull
  editing: boolean
  content: string
  language: string
  url: string
  setContent: (v: string) => void
  setLanguage: (v: string) => void
  setUrl: (v: string) => void
}

function ItemContentSection({ item, editing, content, language, url, setContent, setLanguage, setUrl }: ItemContentSectionProps) {
  const typeName = item.itemType.name
  const isTextType = TEXT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isMarkdownType = MARKDOWN_TYPES.has(typeName)
  const isUrlType = typeName === "link"

  return (
    <>
      {isTextType && (
        editing ? (
          <div className="space-y-2">
            {isLanguageType ? (
              <>
                <input
                  className="w-full text-xs bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary font-mono"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="Language (e.g. typescript)"
                />
                <CodeEditor value={content} language={language || undefined} onChange={setContent} readOnly={false} />
              </>
            ) : isMarkdownType ? (
              <MarkdownEditor value={content} onChange={setContent} />
            ) : (
              <textarea
                className="w-full text-xs font-mono bg-muted/30 border border-border rounded px-3 py-2 focus:outline-none focus:border-primary resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={10}
              />
            )}
          </div>
        ) : (
          item.content && (
            isLanguageType ? (
              <CodeEditor value={item.content} language={item.language ?? undefined} readOnly />
            ) : isMarkdownType ? (
              <MarkdownEditor value={item.content} readOnly />
            ) : (
              <pre className="p-3 text-xs font-mono bg-muted/30 border border-border rounded overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed text-foreground/80">
                {item.content}
              </pre>
            )
          )
        )
      )}

      {isUrlType && (
        editing ? (
          <input
            className="w-full text-xs bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        ) : (
          item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm text-primary hover:underline break-all"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {item.url}
            </a>
          )
        )
      )}

      {item.contentType === "file" && (
        <div className="space-y-3">
          {typeName === "image" && item.fileUrl && (
            <div className="rounded-md overflow-hidden border border-border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.fileUrl} alt={item.fileName ?? "Image"} className="w-full max-h-72 object-contain" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate flex-1">{item.fileName ?? "Untitled file"}</span>
            {item.fileSize != null && (
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(item.fileSize)}</span>
            )}
            {item.fileUrl && (
              <a
                href={`/api/download/${item.id}`}
                download={item.fileName ?? undefined}
                className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Drawer body ─────────────────────────────────────────────────────────────

interface DrawerBodyProps {
  item: SerializedItemFull
  onItemUpdate: (updated: SerializedItemFull) => void
  onClose: () => void
}

function DrawerBody({ item, onItemUpdate, onClose }: DrawerBodyProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? "")
  const [content, setContent] = useState(item.content ?? "")
  const [language, setLanguage] = useState(item.language ?? "")
  const [url, setUrl] = useState(item.url ?? "")
  const [tags, setTags] = useState(item.tags.map((t) => t.name).join(", "))
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    item.collections.map((c) => c.collection.id)
  )
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([])

  const typeName = item.itemType.name
  const isTextType = TEXT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isUrlType = typeName === "link"
  const copyText = item.contentType === "url" ? item.url : item.content
  const IconComponent = ICON_MAP[item.itemType.icon]

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  const handleEdit = async () => {
    setTitle(item.title)
    setDescription(item.description ?? "")
    setContent(item.content ?? "")
    setLanguage(item.language ?? "")
    setUrl(item.url ?? "")
    setTags(item.tags.map((t) => t.name).join(", "))
    setSelectedCollectionIds(item.collections.map((c) => c.collection.id))
    setEditing(true)
    if (availableCollections.length === 0) {
      const cols = await getCollectionsForPicker()
      setAvailableCollections(cols)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean)
    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: isTextType ? content || null : null,
      url: isUrlType ? url || null : null,
      language: isLanguageType ? language || null : null,
      tags: tagArray,
      collectionIds: selectedCollectionIds,
    })
    setSaving(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to save changes")
      return
    }
    toast.success("Changes saved")
    onItemUpdate(result.data as unknown as SerializedItemFull)
    setEditing(false)
    router.refresh()
  }

  const handleToggleFavorite = async () => {
    setToggling(true)
    const result = await toggleFavorite(item.id)
    setToggling(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to update")
      return
    }
    onItemUpdate(result.data as unknown as SerializedItemFull)
    router.refresh()
  }

  const handleTogglePin = async () => {
    setToggling(true)
    const result = await togglePin(item.id)
    setToggling(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to update")
      return
    }
    onItemUpdate(result.data as unknown as SerializedItemFull)
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteItem(item.id)
    setDeleting(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete item")
      return
    }
    toast.success("Item deleted")
    onClose()
    router.refresh()
  }

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
        {editing ? (
          <input
            className="w-full text-base font-semibold leading-snug bg-transparent border-b border-border focus:outline-none focus:border-primary pb-0.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
          />
        ) : (
          <h2 className="text-base font-semibold leading-snug">{item.title}</h2>
        )}
        {editing ? (
          <textarea
            className="w-full mt-1.5 text-xs text-muted-foreground bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
        ) : (
          item.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
          )
        )}
      </div>

      <DrawerActionBar
        editing={editing}
        saving={saving}
        toggling={toggling}
        copied={copied}
        isFavorite={item.isFavorite}
        isPinned={item.isPinned}
        hasCopyText={!!copyText}
        titleIsEmpty={!title.trim()}
        onCopy={handleCopy}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={handleTogglePin}
        onDeleteClick={() => setConfirmDeleteOpen(true)}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.title}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
        <ItemContentSection
          item={item}
          editing={editing}
          content={content}
          language={language}
          url={url}
          setContent={setContent}
          setLanguage={setLanguage}
          setUrl={setUrl}
        />

        {/* Tags */}
        {editing ? (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Tags</p>
            <input
              className="w-full text-xs bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, hooks"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Comma-separated</p>
          </div>
        ) : (
          item.tags.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag.name} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        {/* Collections */}
        {editing ? (
          availableCollections.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Collections</p>
              <CollectionPicker
                collections={availableCollections}
                selectedIds={selectedCollectionIds}
                onChange={setSelectedCollectionIds}
              />
            </div>
          )
        ) : (
          item.collections.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Collections</p>
              <div className="flex flex-wrap gap-1.5">
                {item.collections.map(({ collection }) => (
                  <span key={collection.id} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {collection.name}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        {/* Last updated */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Last Updated</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(item.updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

interface ItemDrawerProps {
  itemId: string | null
  onClose: () => void
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<SerializedItemFull | null>(null)
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
      .then((data: SerializedItemFull) => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [itemId])

  return (
    <Sheet open={!!itemId} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <SheetContent side="right" showCloseButton className="w-full sm:max-w-md p-0 gap-0 overflow-hidden">
        {loading && <DrawerSkeleton />}
        {!loading && item && <DrawerBody item={item} onItemUpdate={setItem} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}
