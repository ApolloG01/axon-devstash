"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FolderOpen, Star } from "lucide-react"
import { ItemDrawer } from "@/components/items/item-drawer"
import { ICON_MAP } from "@/constants/icon-map"
import type { FavoriteItem } from "@/lib/db/items"
import type { FavoriteCollection } from "@/lib/db/collections"

interface FavoritesListProps {
  items: FavoriteItem[]
  collections: FavoriteCollection[]
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const router = useRouter()

  const hasAny = items.length > 0 || collections.length > 0

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Star className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground font-mono">No favorites yet.</p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          Star items and collections to see them here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {items.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 font-mono px-1">
              Items ({items.length})
            </h2>
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const Icon = ICON_MAP[item.itemType.icon]
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 transition-colors rounded-sm group"
                  >
                    {Icon && (
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.itemType.color }} />
                    )}
                    <span className="flex-1 text-sm font-mono truncate text-foreground/90 group-hover:text-foreground">
                      {item.title}
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border"
                      style={{ color: item.itemType.color, borderColor: `${item.itemType.color}40` }}
                    >
                      {item.itemType.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground w-24 text-right">
                      {formatDate(item.updatedAt)}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {collections.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 font-mono px-1">
              Collections ({collections.length})
            </h2>
            <div className="divide-y divide-border/50">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => router.push(`/collections/${col.id}`)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 transition-colors rounded-sm group"
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-mono truncate text-foreground/90 group-hover:text-foreground">
                    {col.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="shrink-0 text-[11px] font-mono text-muted-foreground w-24 text-right">
                    {formatDate(col.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ItemDrawer itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
    </>
  )
}
