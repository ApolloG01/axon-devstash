export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCollectionsByUserId } from "@/lib/db/collections"
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items"
import { auth } from "@/auth"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CollectionCard } from "@/components/dashboard/collection-card"
import { ItemGrid } from "@/components/items/item-grid"
import { PageToast } from "@/components/shared/page-toast"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const { welcome } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id

  const [collections, pinnedItems, recentItems, itemStats] = await Promise.all([
    getCollectionsByUserId(userId),
    getPinnedItems(userId),
    getRecentItems(userId, 10),
    getItemStats(userId),
  ])

  const stats = {
    items: itemStats.total,
    collections: collections.length,
    favoriteItems: itemStats.favorites,
    favoriteCollections: collections.filter((c) => c.isFavorite).length,
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      {welcome === "1" && <PageToast message="Welcome back!" />}
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Collections</h2>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            New Collection
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-4">Pinned</h2>
          <ItemGrid items={pinnedItems} />
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Recent Items</h2>
          <span className="text-xs text-muted-foreground">See all</span>
        </div>
        <ItemGrid items={recentItems} emptyMessage="No items yet. Create your first one." />
      </section>
    </div>
  )
}
