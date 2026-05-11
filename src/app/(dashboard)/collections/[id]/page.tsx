export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { getCollectionById, getItemsByCollectionId, getUserCollectionsList } from "@/lib/db/collections"
import { getSystemItemTypes } from "@/lib/db/items"
import { ItemGrid } from "@/components/items/item-grid"
import { NewItemButton } from "@/components/items/new-item-dialog"
import { CollectionDetailActions } from "@/components/collections/collection-detail-actions"
import { NewCollectionButton } from "@/components/collections/new-collection-button"
import { Pagination } from "@/components/shared/pagination"
import { COLLECTIONS_PER_PAGE } from "@/constants"
import { ChevronRight, Layers } from "lucide-react"

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams])
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [collection, { items, total }, itemTypes, collections] = await Promise.all([
    getCollectionById(session.user.id, id),
    getItemsByCollectionId(session.user.id, id, page, COLLECTIONS_PER_PAGE),
    getSystemItemTypes(),
    getUserCollectionsList(session.user.id),
  ])

  if (!collection) notFound()

  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE)

  const visibleItemTypes = session.user.isPro
    ? itemTypes
    : itemTypes.filter((t) => t.name !== "file" && t.name !== "image")

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/collections" className="hover:text-foreground transition-colors">
          Collections
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{collection.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <span>{collection.itemCount} item{collection.itemCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CollectionDetailActions
            collectionId={collection.id}
            initialName={collection.name}
            initialDescription={collection.description}
            initialIsFavorite={collection.isFavorite}
          />
          <NewCollectionButton />
          <NewItemButton
            itemTypes={visibleItemTypes}
            collections={collections}
            label="New Item"
            isPro={session.user.isPro}
          />
        </div>
      </div>

      <ItemGrid
        items={items}
        emptyMessage="No items in this collection yet."
        isPro={session.user.isPro}
      />

      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
