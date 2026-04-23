import { Star } from "lucide-react"

interface Item {
  id: string
  title: string
  description?: string | null
  content?: string | null
  language?: string | null
  isFavorite: boolean
  tags: string[]
}

interface ItemType {
  name: string
  color: string
}

interface ItemCardProps {
  item: Item
  type?: ItemType
}

export function ItemCard({ item, type }: ItemCardProps) {
  const accentColor = type?.color ?? "#6b7280"

  return (
    <div className="group rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium truncate">{item.title}</h3>
            {item.isFavorite && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {item.description}
            </p>
          )}

          {item.content && (
            <p className="text-xs text-muted-foreground/60 font-mono line-clamp-2 mb-3">
              {item.content}
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {type && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm capitalize"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {type.name}
              </span>
            )}
            {item.language && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                {item.language}
              </span>
            )}
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
