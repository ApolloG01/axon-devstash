import Link from "next/link"
import { Layers } from "lucide-react"

interface Collection {
  id: string
  name: string
  description?: string | null
  itemCount: number
}

interface ItemType {
  color: string
}

interface CollectionCardProps {
  collection: Collection
  defaultType?: ItemType
}

export function CollectionCard({ collection, defaultType }: CollectionCardProps) {
  const accentColor = defaultType?.color ?? "#6b7280"

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-4">
        <h3 className="text-sm font-medium truncate mb-1.5">{collection.name}</h3>
        {collection.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {collection.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="h-3 w-3" />
          <span>{collection.itemCount} items</span>
        </div>
      </div>
    </Link>
  )
}
