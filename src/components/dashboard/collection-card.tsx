import Link from "next/link"
import {
  Code, Sparkles, Terminal, StickyNote,
  Link as LinkIcon, File, Image, Layers,
  type LucideProps,
} from "lucide-react"
import type { CollectionWithTypes } from "@/lib/db/collections"

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
}

export function CollectionCard({ collection }: { collection: CollectionWithTypes }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="h-1 w-full" style={{ backgroundColor: collection.accentColor }} />
      <div className="p-4">
        <h3 className="text-sm font-medium truncate mb-1.5">{collection.name}</h3>
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
                  <Icon
                    key={type.name}
                    className="h-3 w-3"
                    style={{ color: type.color }}
                  />
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
