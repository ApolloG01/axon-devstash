import { Star, ImageIcon } from "lucide-react"
import type { ItemWithType } from "@/lib/db/items"

export function ImageThumbnailCard({ item }: { item: ItemWithType }) {
  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-muted relative">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center gap-1.5 min-w-0">
        <p className="text-xs font-medium truncate flex-1">{item.title}</p>
        {item.isFavorite && (
          <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
        )}
      </div>
    </div>
  )
}
