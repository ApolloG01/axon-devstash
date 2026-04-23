import { Package, FolderOpen, Star, BookMarked } from "lucide-react"

interface Stats {
  items: number
  collections: number
  favoriteItems: number
  favoriteCollections: number
}

const CARDS = [
  { key: "items", label: "Total Items", icon: Package },
  { key: "collections", label: "Collections", icon: FolderOpen },
  { key: "favoriteItems", label: "Favorite Items", icon: Star },
  { key: "favoriteCollections", label: "Fav Collections", icon: BookMarked },
] as const

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
        >
          <div className="rounded-md bg-muted p-2 shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none">{stats[key]}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
