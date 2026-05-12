"use client"

import { CollectionPicker, type CollectionOption } from "@/components/items/collection-picker"
import { TagSuggester } from "@/components/items/tag-suggester"
import { appendTag } from "@/lib/tags"
import type { SerializedItemFull } from "@/lib/db/items"

function DrawerSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
      {children}
    </p>
  )
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface DrawerMetadataProps {
  item: SerializedItemFull
  editing: boolean
  tags: string
  content: string
  url: string
  selectedCollectionIds: string[]
  availableCollections: CollectionOption[]
  isPro?: boolean
  onTagsChange: (v: string) => void
  onCollectionsChange: (ids: string[]) => void
}

export function DrawerMetadata({
  item,
  editing,
  tags,
  content,
  url,
  selectedCollectionIds,
  availableCollections,
  isPro,
  onTagsChange,
  onCollectionsChange,
}: DrawerMetadataProps) {
  const typeName = item.itemType.name

  return (
    <>
      {/* Tags */}
      {editing ? (
        <div>
          <DrawerSectionLabel>Tags</DrawerSectionLabel>
          <input
            className="w-full text-xs bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="react, typescript, hooks"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Comma-separated</p>
          <div className="mt-1.5">
            <TagSuggester
              title={item.title}
              content={content || url || undefined}
              typeName={typeName}
              isPro={!!isPro}
              onAccept={(tag) => onTagsChange(appendTag(tags, tag))}
            />
          </div>
        </div>
      ) : (
        item.tags.length > 0 && (
          <div>
            <DrawerSectionLabel>Tags</DrawerSectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag.name} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )
      )}

      {/* Collections */}
      {editing ? (
        availableCollections.length > 0 && (
          <div>
            <DrawerSectionLabel>Collections</DrawerSectionLabel>
            <CollectionPicker
              collections={availableCollections}
              selectedIds={selectedCollectionIds}
              onChange={onCollectionsChange}
            />
          </div>
        )
      ) : (
        item.collections.length > 0 && (
          <div>
            <DrawerSectionLabel>Collections</DrawerSectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map(({ collection }) => (
                <span key={collection.id} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {collection.name}
                </span>
              ))}
            </div>
          </div>
        )
      )}

      {/* Last Updated */}
      <div>
        <DrawerSectionLabel>Last Updated</DrawerSectionLabel>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(item.updatedAt)}</p>
      </div>
    </>
  )
}
