"use client"

import { useState } from "react"
import { ItemCard } from "@/components/dashboard/item-card"
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card"
import { FileListRow } from "@/components/items/file-list-row"
import { ItemDrawer } from "@/components/items/item-drawer"
import { EmptyState } from "@/components/shared/empty-state"
import type { ItemWithType } from "@/lib/db/items"

interface ItemGridProps {
  items: ItemWithType[]
  emptyMessage?: string
  variant?: "default" | "image" | "file"
  isPro?: boolean
}

export function ItemGrid({ items, emptyMessage = "No items yet.", variant = "default", isPro }: ItemGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (items.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <>
      {variant === "file" ? (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <FileListRow key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} onClick={() => setSelectedId(item.id)} className="cursor-pointer">
              {variant === "image" ? (
                <ImageThumbnailCard item={item} />
              ) : (
                <ItemCard item={item} />
              )}
            </div>
          ))}
        </div>
      )}
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} isPro={isPro} />
    </>
  )
}
