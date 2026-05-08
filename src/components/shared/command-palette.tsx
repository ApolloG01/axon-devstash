"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Layers } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { ItemDrawer } from "@/components/items/item-drawer"
import { ICON_MAP } from "@/constants/icon-map"
import type { SearchItem } from "@/lib/db/items"
import type { SearchCollection } from "@/lib/db/collections"

interface CommandPaletteProps {
  items: SearchItem[]
  collections: SearchCollection[]
}

export function CommandPalette({ items, collections }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleItemSelect = useCallback((id: string) => {
    setOpen(false)
    setSelectedItemId(id)
  }, [])

  const handleCollectionSelect = useCallback(
    (id: string) => {
      setOpen(false)
      router.push(`/collections/${id}`)
    },
    [router],
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full h-8 px-3 rounded-md bg-muted/40 border border-border text-sm text-muted-foreground hover:bg-muted/60 transition-colors cursor-text"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search items, collections...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border leading-none">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
        <CommandInput placeholder="Search items and collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {items.length > 0 && (
            <CommandGroup heading="Items">
              {items.map((item) => {
                const Icon = ICON_MAP[item.itemType.icon] ?? ICON_MAP["File"]
                return (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleItemSelect(item.id)}
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: item.itemType.color }} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{item.title}</span>
                      {item.contentPreview && (
                        <span className="text-xs text-muted-foreground truncate">{item.contentPreview}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">{item.itemType.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {items.length > 0 && collections.length > 0 && <CommandSeparator />}

          {collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((col) => (
                <CommandItem
                  key={col.id}
                  value={col.name}
                  onSelect={() => handleCollectionSelect(col.id)}
                >
                  <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{col.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{col.itemCount} items</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        </Command>
      </CommandDialog>

      <ItemDrawer itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
    </>
  )
}
