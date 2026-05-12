"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Layers, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { ICON_MAP } from "@/constants/icon-map"
import type { CollectionWithTypes } from "@/lib/db/collections"
import { cn } from "@/lib/utils"
import { updateCollection, deleteCollection, toggleCollectionFavorite } from "@/actions/collections"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog"
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog"

export function CollectionCard({ collection }: { collection: CollectionWithTypes }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description ?? "")
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite)

  function handleToggleFavorite() {
    startTransition(async () => {
      const result = await toggleCollectionFavorite(collection.id)
      if (result.success) {
        setIsFavorite(result.data.isFavorite)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateCollection(collection.id, { name, description: description || null })
      if (result.success) {
        toast.success("Collection updated")
        setEditOpen(false)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCollection(collection.id)
      if (result.success) {
        toast.success("Collection deleted")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to delete")
      }
    })
  }

  return (
    <>
      <div
        onClick={() => router.push(`/collections/${collection.id}`)}
        className="group relative rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      >
        <div className="h-1 w-full" style={{ backgroundColor: collection.accentColor }} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-medium truncate">{collection.name}</h3>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite() }}
                disabled={isPending}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className={cn(
                  "h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-opacity",
                  isFavorite
                    ? "text-amber-400 opacity-100"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                )}
              >
                <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-amber-400")} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                  aria-label="Collection options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onSelect={() => { setName(collection.name); setDescription(collection.description ?? ""); setEditOpen(true) }}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleToggleFavorite()}>
                    <Star className={cn("h-3.5 w-3.5 mr-2", isFavorite && "fill-amber-400 text-amber-400")} />
                    {isFavorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {collection.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {collection.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span>{collection.itemCount} items</span>
            </div>
            {collection.typeIcons.length > 0 && (
              <div className="flex items-center gap-1">
                {collection.typeIcons.map((type) => {
                  const Icon = ICON_MAP[type.icon]
                  return Icon ? (
                    <Icon key={type.name} className="h-3 w-3" style={{ color: type.color }} />
                  ) : null
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        name={name}
        onNameChange={setName}
        description={description}
        onDescriptionChange={setDescription}
        onSave={handleSave}
        isPending={isPending}
      />

      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionName={collection.name}
        onDelete={handleDelete}
        isPending={isPending}
      />
    </>
  )
}
