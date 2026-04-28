import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRO_TYPES = new Set(["file", "image"]);

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  accentColor: string;
}

interface SidebarContentProps {
  collapsed?: boolean;
  itemTypes: SidebarItemType[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
}

export function SidebarContent({
  collapsed = false,
  itemTypes,
  favoriteCollections,
  recentCollections,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Types */}
        <div className="px-2">
          {!collapsed && (
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Types
            </p>
          )}
          <nav className="space-y-0.5">
            {itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon];
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name}s`}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                    collapsed && "justify-center",
                  )}
                >
                  {Icon && (
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: type.color }}
                    />
                  )}
                  {!collapsed && (
                    <>
                      <span className="capitalize flex-1">{type.name}s</span>
                      {PRO_TYPES.has(type.name) && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1 text-[10px] font-semibold tracking-wider text-muted-foreground border-muted-foreground/30"
                        >
                          PRO
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collections */}
        {!collapsed && (
          <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Collections
          </p>
        )}

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
                    collapsed ? "justify-center" : "truncate",
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
        {recentCollections.length > 0 && (
          <div className="px-2">
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
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
                    collapsed ? "justify-center" : "truncate",
                  )}
                >
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.accentColor }}
                  />
                  {!collapsed && <span className="truncate">{col.name}</span>}
                </Link>
              ))}
            </div>
            {!collapsed && (
              <Link
                href="/collections"
                className="flex items-center px-2 py-1.5 mt-1 text-[18px] text-muted-foreground hover:text-foreground transition-colors"
              >
                View all collections →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* User area */}
      <div
        className={cn(
          "border-t border-border p-3 shrink-0",
          collapsed && "flex justify-center",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5 min-w-0",
            collapsed && "flex-col",
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>DU</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                Demo User
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                demo@devstash.io
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
