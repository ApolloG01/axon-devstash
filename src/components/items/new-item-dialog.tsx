"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ICON_MAP } from "@/constants/icon-map"
import { cn } from "@/lib/utils"
import { createItem } from "@/actions/items"

type ItemType = {
  id: string
  name: string
  icon: string
  color: string
}

const TEXT_CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"])
const LANGUAGE_TYPES = new Set(["snippet", "command"])
const EXCLUDED_TYPES = new Set(["file", "image"])

function getContentType(typeName: string) {
  return typeName === "link" ? "url" : "text"
}

interface NewItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemType[]
}

function NewItemDialog({ open, onOpenChange, itemTypes }: NewItemDialogProps) {
  const router = useRouter()
  const selectableTypes = itemTypes.filter((t) => !EXCLUDED_TYPES.has(t.name))

  const [selectedTypeId, setSelectedTypeId] = useState<string>(selectableTypes[0]?.id ?? "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)

  const selectedType = selectableTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name ?? ""
  const isTextContent = TEXT_CONTENT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isUrlType = typeName === "link"

  const canSubmit = title.trim().length > 0 && (!isUrlType || url.trim().length > 0)

  function resetForm() {
    setSelectedTypeId(selectableTypes[0]?.id ?? "")
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  async function handleSubmit() {
    if (!selectedType) return
    setSaving(true)

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await createItem({
      itemTypeId: selectedType.id,
      contentType: getContentType(typeName),
      title: title.trim(),
      description: description.trim() || null,
      content: isTextContent ? content || null : null,
      url: isUrlType ? url.trim() || null : null,
      language: isLanguageType ? language.trim() || null : null,
      tags: tagArray,
    })

    setSaving(false)

    if (!result.success) {
      toast.error(result.error ?? "Failed to create item")
      return
    }

    toast.success("Item created")
    handleOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5">
          {selectableTypes.map((type) => {
            const Icon = ICON_MAP[type.icon]
            const isSelected = type.id === selectedTypeId
            return (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(type.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-muted border-border text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: type.color }} />}
                <span className="capitalize">{type.name}</span>
              </button>
            )
          })}
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </label>
            <input
              className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* Language (snippet / command) */}
          {isLanguageType && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Language
              </label>
              <input
                className="w-full text-sm font-mono bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. typescript"
              />
            </div>
          )}

          {/* Content (text types) */}
          {isTextContent && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </label>
              <textarea
                className="w-full text-sm font-mono bg-muted/30 border border-border rounded px-2.5 py-2 focus:outline-none focus:border-primary resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or type your content here"
                rows={6}
              />
            </div>
          )}

          {/* URL (link type) */}
          {isUrlType && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tags
            </label>
            <input
              className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, hooks"
            />
            <p className="text-[10px] text-muted-foreground">Comma-separated</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            size="sm"
          >
            {saving ? "Creating…" : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NewItemButtonProps {
  itemTypes: ItemType[]
}

export function NewItemButton({ itemTypes }: NewItemButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Item
      </Button>
      <NewItemDialog open={open} onOpenChange={setOpen} itemTypes={itemTypes} />
    </>
  )
}
