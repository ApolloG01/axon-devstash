"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { updateCollection, deleteCollection, toggleCollectionFavorite } from "@/actions/collections"
import { Button } from "@/components/ui/button"
import { FavoriteStarButton } from "@/components/shared/favorite-star-button"
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog"
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog"

type Props = {
  collectionId: string
  initialName: string
  initialDescription: string | null
  initialIsFavorite: boolean
}

export function CollectionDetailActions({ collectionId, initialName, initialDescription, initialIsFavorite }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription ?? "")
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  function handleToggleFavorite() {
    startTransition(async () => {
      const result = await toggleCollectionFavorite(collectionId)
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
      const result = await updateCollection(collectionId, { name, description: description || null })
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
      const result = await deleteCollection(collectionId)
      if (result.success) {
        toast.success("Collection deleted")
        router.push("/collections")
      } else {
        toast.error(result.error ?? "Failed to delete")
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <FavoriteStarButton
          isFavorite={isFavorite}
          disabled={isPending}
          onClick={handleToggleFavorite}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Edit collection"
          onClick={() => { setName(initialName); setDescription(initialDescription ?? ""); setEditOpen(true) }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete collection"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
        collectionName={initialName}
        onDelete={handleDelete}
        isPending={isPending}
      />
    </>
  )
}
