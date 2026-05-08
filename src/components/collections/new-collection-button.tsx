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
import { createCollection } from "@/actions/collections"

export function NewCollectionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("")
      setDescription("")
    }
    onOpenChange(next)
  }

  async function handleSubmit() {
    setSaving(true)
    const result = await createCollection({
      name: name.trim(),
      description: description.trim() || null,
    })
    setSaving(false)

    if (!result.success) {
      toast.error(result.error ?? "Failed to create collection")
      return
    }

    toast.success("Collection created")
    handleOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full text-sm bg-transparent border border-border rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Patterns"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) handleSubmit()
              }}
            />
          </div>

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
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            size="sm"
          >
            {saving ? "Creating…" : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewCollectionIconButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="New Collection"
      >
        <Plus className="h-3 w-3" />
      </button>
      <NewCollectionDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export function NewCollectionInlineButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        New Collection
      </button>
      <NewCollectionDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export function NewCollectionButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Collection
      </Button>
      <NewCollectionDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
