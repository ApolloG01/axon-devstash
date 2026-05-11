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
import { MarkdownEditor } from "@/components/items/markdown-editor"
import { CodeEditor } from "@/components/items/code-editor"
import { FileUpload, type UploadedFile } from "@/components/items/file-upload"
import { CollectionPicker, type CollectionOption } from "@/components/items/collection-picker"
import { TagSuggester } from "@/components/items/tag-suggester"
import { DescriptionGenerator } from "@/components/items/description-generator"

type ItemType = {
  id: string
  name: string
  icon: string
  color: string
}

const TEXT_CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"])
const LANGUAGE_TYPES = new Set(["snippet", "command"])
const MARKDOWN_TYPES = new Set(["note", "prompt"])
const FILE_TYPES = new Set(["file", "image"])

function getContentType(typeName: string) {
  if (typeName === "link") return "url"
  if (FILE_TYPES.has(typeName)) return "file"
  return "text"
}

interface NewItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemType[]
  collections: CollectionOption[]
  defaultTypeId?: string
  isPro?: boolean
}

interface NewItemFormFieldsProps {
  typeName: string
  title: string; setTitle: (v: string) => void
  description: string; setDescription: (v: string) => void
  content: string; setContent: (v: string) => void
  language: string; setLanguage: (v: string) => void
  url: string; setUrl: (v: string) => void
  tags: string; setTags: (v: string) => void
  uploadedFile: UploadedFile | null
  setUploadedFile: (f: UploadedFile | null) => void
  collections: CollectionOption[]
  selectedCollectionIds: string[]
  setSelectedCollectionIds: (ids: string[]) => void
  isPro?: boolean
}

function NewItemFormFields({
  typeName,
  title, setTitle,
  description, setDescription,
  content, setContent,
  language, setLanguage,
  url, setUrl,
  tags, setTags,
  uploadedFile, setUploadedFile,
  collections, selectedCollectionIds, setSelectedCollectionIds,
  isPro,
}: NewItemFormFieldsProps) {
  const isTextContent = TEXT_CONTENT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isMarkdownType = MARKDOWN_TYPES.has(typeName)
  const isUrlType = typeName === "link"
  const isFileType = FILE_TYPES.has(typeName)
  const fileKind = typeName === "image" ? "image" : "file"

  return (
    <div className="flex flex-col gap-3">
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

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </label>
        <div className="relative">
          <input
            className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 pr-8 focus:outline-none focus:border-primary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <DescriptionGenerator
            title={title}
            typeName={typeName}
            content={content || undefined}
            url={url || undefined}
            fileName={uploadedFile?.fileName || undefined}
            fileSize={uploadedFile?.fileSize ?? undefined}
            isPro={!!isPro}
            onGenerate={setDescription}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {isTextContent && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Content
          </label>
          {isMarkdownType ? (
            <MarkdownEditor value={content} onChange={setContent} />
          ) : isLanguageType ? (
            <CodeEditor
              value={content}
              language={language || "plaintext"}
              onChange={setContent}
              onLanguageChange={setLanguage}
            />
          ) : (
            <textarea
              className="w-full text-sm font-mono bg-muted/30 border border-border rounded px-2.5 py-2 focus:outline-none focus:border-primary resize-none leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your content here"
              rows={6}
            />
          )}
        </div>
      )}

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

      {isFileType && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {typeName === "image" ? "Image" : "File"} <span className="text-destructive">*</span>
          </label>
          <FileUpload
            kind={fileKind}
            uploaded={uploadedFile}
            onUpload={setUploadedFile}
            onClear={() => setUploadedFile(null)}
          />
        </div>
      )}

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
        <TagSuggester
          title={title}
          content={content || url || undefined}
          typeName={typeName}
          isPro={!!isPro}
          onAccept={(tag) => {
            const existing = tags.split(",").map((t) => t.trim()).filter(Boolean)
            if (!existing.includes(tag)) {
              setTags(existing.length > 0 ? `${tags.trim()}, ${tag}` : tag)
            }
          }}
        />
      </div>

      {collections.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Collections
          </label>
          <CollectionPicker
            collections={collections}
            selectedIds={selectedCollectionIds}
            onChange={setSelectedCollectionIds}
          />
        </div>
      )}
    </div>
  )
}

export function NewItemDialog({ open, onOpenChange, itemTypes, collections, defaultTypeId, isPro }: NewItemDialogProps) {
  const router = useRouter()

  const initialTypeId = defaultTypeId ?? itemTypes[0]?.id ?? ""
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialTypeId)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedType = itemTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name ?? ""
  const isTextContent = TEXT_CONTENT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isUrlType = typeName === "link"
  const isFileType = FILE_TYPES.has(typeName)

  const canSubmit =
    title.trim().length > 0 &&
    (!isUrlType || url.trim().length > 0) &&
    (!isFileType || uploadedFile !== null)

  function resetForm() {
    setSelectedTypeId(initialTypeId)
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
    setSelectedCollectionIds([])
    setUploadedFile(null)
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
      fileUrl: isFileType ? uploadedFile?.url ?? null : null,
      fileName: isFileType ? uploadedFile?.fileName ?? null : null,
      fileSize: isFileType ? uploadedFile?.fileSize ?? null : null,
      tags: tagArray,
      collectionIds: selectedCollectionIds,
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
          {itemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon]
            const isSelected = type.id === selectedTypeId
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedTypeId(type.id)
                  setUploadedFile(null)
                }}
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

        <NewItemFormFields
          typeName={typeName}
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          content={content} setContent={setContent}
          language={language} setLanguage={setLanguage}
          url={url} setUrl={setUrl}
          tags={tags} setTags={setTags}
          uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
          collections={collections}
          selectedCollectionIds={selectedCollectionIds}
          setSelectedCollectionIds={setSelectedCollectionIds}
          isPro={isPro}
        />

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
  collections: CollectionOption[]
  defaultTypeId?: string
  label?: string
  isPro?: boolean
}

export function NewItemButton({ itemTypes, collections, defaultTypeId, label = "New Item", isPro }: NewItemButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <NewItemDialog open={open} onOpenChange={setOpen} itemTypes={itemTypes} collections={collections} defaultTypeId={defaultTypeId} isPro={isPro} />
    </>
  )
}
