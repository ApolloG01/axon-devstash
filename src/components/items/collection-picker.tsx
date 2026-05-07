"use client"

import { useState } from "react"
import { ChevronsUpDown, FolderOpen } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export type CollectionOption = { id: string; name: string }

interface CollectionPickerProps {
  collections: CollectionOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CollectionPicker({ collections, selectedIds, onChange }: CollectionPickerProps) {
  const [open, setOpen] = useState(false)

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectedNames = collections
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="truncate text-left">
          {selectedNames.length === 0 ? (
            <span className="text-muted-foreground">Select collections…</span>
          ) : (
            selectedNames.join(", ")
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search collections…" />
          <CommandList>
            <CommandEmpty>No collections found.</CommandEmpty>
            <CommandGroup>
              {collections.map((col) => {
                const selected = selectedIds.includes(col.id)
                return (
                  <CommandItem
                    key={col.id}
                    value={col.name}
                    onSelect={() => toggle(col.id)}
                    data-checked={selected ? "true" : undefined}
                  >
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {col.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
