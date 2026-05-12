import { Package, FolderOpen, Star, BookMarked } from "lucide-react"

interface Stats {
  items: number
  collections: number
  favoriteItems: number
  favoriteCollections: number
}

const CARDS = [
  { key: "items", label: "Total Items", icon: Package, iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
  { key: "collections", label: "Collections", icon: FolderOpen, iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { key: "favoriteItems", label: "Favorite Items", icon: Star, iconColor: "text-amber-400", bgColor: "bg-amber-400/10" },
  { key: "favoriteCollections", label: "Fav Collections", icon: BookMarked, iconColor: "text-amber-400", bgColor: "bg-amber-400/10" },
] as const

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map(({ key, label, icon: Icon, iconColor, bgColor }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
        >
          <div className={`rounded-md p-2 shrink-0 ${bgColor}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
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
