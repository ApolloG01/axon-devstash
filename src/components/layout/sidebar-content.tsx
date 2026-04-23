import Link from "next/link"
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
  Star,
  Clock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUser, mockItemTypes, mockCollections } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
}

interface SidebarContentProps {
  collapsed?: boolean
}

export function SidebarContent({ collapsed = false }: SidebarContentProps) {
  const favoriteCollections = mockCollections.filter((c) => c.isFavorite)
  const recentCollections = mockCollections.slice(0, 3)

  const initials = mockUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Item Types */}
        <nav className="px-2 space-y-0.5">
          {mockItemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon]
            return (
              <Link
                key={type.id}
                href={`/items/${type.name}s`}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                  collapsed && "justify-center"
                )}
              >
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                )}
                {!collapsed && <span className="capitalize">{type.name}s</span>}
              </Link>
            )
          })}
        </nav>

        {/* Favorites */}
        {favoriteCollections.length > 0 && (
          <div className="px-2">
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <Star className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Favorites
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {favoriteCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                    collapsed ? "justify-center" : "truncate"
                  )}
                >
                  <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  {!collapsed && <span className="truncate">{col.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        <div className="px-2">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 mb-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </span>
            </div>
          )}
          <div className="space-y-0.5">
            {recentCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                  collapsed ? "justify-center" : "truncate"
                )}
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="truncate">{col.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User area */}
      <div className={cn("border-t border-border p-3 shrink-0", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-2.5 min-w-0", collapsed && "flex-col")}>
          <Avatar size="sm">
            <AvatarImage src={mockUser.image ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{mockUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
