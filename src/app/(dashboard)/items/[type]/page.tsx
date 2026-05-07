import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items"
import { ItemGrid } from "@/components/items/item-grid"
import { NewItemButton } from "@/components/items/new-item-dialog"

const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  links: "link",
  files: "file",
  images: "image",
}

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type: slug } = await params
  const typeName = TYPE_SLUG_MAP[slug]
  if (!typeName) notFound()

  const session = await auth()
  if (!session?.user?.id) notFound()

  const [items, itemTypes] = await Promise.all([
    getItemsByType(session.user.id, typeName),
    getSystemItemTypes(),
  ])

  const currentType = itemTypes.find((t) => t.name === typeName)

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold capitalize">{slug}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? typeName : `${typeName}s`}
          </p>
        </div>
        {currentType && !["file", "image"].includes(typeName) && (
          <NewItemButton
            itemTypes={itemTypes}
            defaultTypeId={currentType.id}
            label={`New ${typeName}`}
          />
        )}
      </div>

      <ItemGrid items={items} emptyMessage={`No ${typeName}s yet.`} />
    </div>
  )
}
