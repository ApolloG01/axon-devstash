"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FolderOpen, Star } from "lucide-react"
import { ItemDrawer } from "@/components/items/item-drawer"
import { EmptyState } from "@/components/shared/empty-state"
import { ICON_MAP } from "@/constants/icon-map"
import type { FavoriteItem } from "@/lib/db/items"
import type { FavoriteCollection } from "@/lib/db/collections"

type ItemSortKey = "name" | "date" | "type"
type CollectionSortKey = "name" | "date"

interface FavoritesListProps {
  items: FavoriteItem[]
  collections: FavoriteCollection[]
  isPro?: boolean
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function SortSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="text-[10px] font-mono bg-transparent text-muted-foreground border border-border/50 rounded px-1.5 py-0.5 cursor-pointer hover:border-border focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function FavoritesList({ items, collections, isPro }: FavoritesListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemSort, setItemSort] = useState<ItemSortKey>("date")
  const [collectionSort, setCollectionSort] = useState<CollectionSortKey>("date")
  const router = useRouter()

  const sortedItems = useMemo(() => {
    const copy = [...items]
    if (itemSort === "name") return copy.sort((a, b) => a.title.localeCompare(b.title))
    if (itemSort === "type") return copy.sort((a, b) => a.itemType.name.localeCompare(b.itemType.name))
    return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [items, itemSort])

  const sortedCollections = useMemo(() => {
    const copy = [...collections]
    if (collectionSort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name))
    return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [collections, collectionSort])

  const hasAny = items.length > 0 || collections.length > 0

  if (!hasAny) {
    return (
      <EmptyState
        icon={Star}
        title="No favorites yet."
        description="Star items and collections to see them here."
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-1 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Items ({items.length})
              </h2>
              <SortSelect
                value={itemSort}
                onChange={setItemSort}
                options={[
                  { value: "date", label: "Date" },
                  { value: "name", label: "Name" },
                  { value: "type", label: "Type" },
                ]}
              />
            </div>
            <div className="divide-y divide-border/50">
              {sortedItems.map((item) => {
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
                    <span className="hidden sm:block shrink-0 text-[11px] font-mono text-muted-foreground w-24 text-right">
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
            <div className="flex items-center justify-between mb-1 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Collections ({collections.length})
              </h2>
              <SortSelect
                value={collectionSort}
                onChange={setCollectionSort}
                options={[
                  { value: "date", label: "Date" },
                  { value: "name", label: "Name" },
                ]}
              />
            </div>
            <div className="divide-y divide-border/50">
              {sortedCollections.map((col) => (
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
                  <span className="hidden sm:block shrink-0 text-[11px] font-mono text-muted-foreground w-24 text-right">
                    {formatDate(col.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ItemDrawer itemId={selectedItemId} onClose={() => setSelectedItemId(null)} isPro={isPro} />
    </>
  )
}
