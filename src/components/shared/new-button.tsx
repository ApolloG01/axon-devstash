"use client"

import { useState } from "react"
import { Plus, FolderPlus, Layers } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { NewItemDialog } from "@/components/items/new-item-dialog"
import { NewCollectionDialog } from "@/components/collections/new-collection-button"

type ItemType = {
  id: string
  name: string
  icon: string
  color: string
}

interface NewButtonProps {
  itemTypes: ItemType[]
}

export function NewButton({ itemTypes }: NewButtonProps) {
  const [itemOpen, setItemOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" className="gap-1.5" />}>
          <Plus className="h-4 w-4" />
          New
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setItemOpen(true)}>
            <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
            New Item
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCollectionOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2 text-muted-foreground" />
            New Collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewItemDialog open={itemOpen} onOpenChange={setItemOpen} itemTypes={itemTypes} />
      <NewCollectionDialog open={collectionOpen} onOpenChange={setCollectionOpen} />
    </>
  )
}
