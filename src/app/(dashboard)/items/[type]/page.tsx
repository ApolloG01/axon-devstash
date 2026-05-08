export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items"
import { getUserCollectionsList } from "@/lib/db/collections"
import { ItemGrid } from "@/components/items/item-grid"
import { NewItemButton } from "@/components/items/new-item-dialog"
import { Pagination } from "@/components/shared/pagination"
import { ITEMS_PER_PAGE } from "@/constants"

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
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ type: slug }, { page: pageParam }] = await Promise.all([params, searchParams])
  const typeName = TYPE_SLUG_MAP[slug]
  if (!typeName) notFound()

  const session = await auth()
  if (!session?.user?.id) notFound()

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [{ items, total }, itemTypes, collections] = await Promise.all([
    getItemsByType(session.user.id, typeName, page, ITEMS_PER_PAGE),
    getSystemItemTypes(),
    getUserCollectionsList(session.user.id),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const currentType = itemTypes.find((t) => t.name === typeName)

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold capitalize">{slug}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? typeName : `${typeName}s`}
          </p>
        </div>
        {currentType && (
          <NewItemButton
            itemTypes={itemTypes}
            collections={collections}
            defaultTypeId={currentType.id}
            label={`New ${typeName}`}
          />
        )}
      </div>

      <ItemGrid
        items={items}
        emptyMessage={`No ${typeName}s yet.`}
        variant={typeName === "image" ? "image" : typeName === "file" ? "file" : "default"}
      />

      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
