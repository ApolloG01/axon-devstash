"use client"

import { ICON_MAP } from "@/constants/icon-map"
import { DescriptionGenerator } from "@/components/items/description-generator"
import type { SerializedItemFull } from "@/lib/db/items"

interface DrawerHeaderProps {
  item: SerializedItemFull
  editing: boolean
  title: string
  description: string
  content: string
  url: string
  isPro?: boolean
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}

export function DrawerHeader({
  item,
  editing,
  title,
  description,
  content,
  url,
  isPro,
  onTitleChange,
  onDescriptionChange,
}: DrawerHeaderProps) {
  const IconComponent = ICON_MAP[item.itemType.icon]
  const typeName = item.itemType.name

  return (
    <div className="px-4 pt-4 pb-3 border-b border-border pr-10">
      <div className="flex items-center gap-1.5 mb-2">
        {IconComponent && (
          <IconComponent className="h-3.5 w-3.5 shrink-0" style={{ color: item.itemType.color }} />
        )}
        <span className="text-[11px] font-medium capitalize" style={{ color: item.itemType.color }}>
          {typeName}
        </span>
      </div>
      {editing ? (
        <input
          className="w-full text-base font-semibold leading-snug bg-transparent border-b border-border focus:outline-none focus:border-primary pb-0.5"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
          autoFocus
        />
      ) : (
        <h2 className="text-base font-semibold leading-snug">{item.title}</h2>
      )}
      {editing ? (
        <div className="relative mt-1.5">
          <textarea
            className="w-full text-xs text-muted-foreground bg-transparent border border-border rounded px-2 py-1.5 pr-7 focus:outline-none focus:border-primary resize-none"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <DescriptionGenerator
            title={title}
            typeName={typeName}
            content={content || undefined}
            url={url || undefined}
            fileName={item.fileName || undefined}
            fileSize={item.fileSize ?? undefined}
            isPro={!!isPro}
            onGenerate={onDescriptionChange}
            className="absolute right-2 top-2"
          />
        </div>
      ) : (
        item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
        )
      )}
    </div>
  )
}
