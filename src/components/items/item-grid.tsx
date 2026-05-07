"use client"

import { useState } from "react"
import { ItemCard } from "@/components/dashboard/item-card"
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card"
import { ItemDrawer } from "@/components/items/item-drawer"
import type { ItemWithType } from "@/lib/db/items"

interface ItemGridProps {
  items: ItemWithType[]
  emptyMessage?: string
  variant?: "default" | "image"
}

export function ItemGrid({ items, emptyMessage = "No items yet.", variant = "default" }: ItemGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
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
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}
