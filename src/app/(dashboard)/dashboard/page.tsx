export const dynamic = "force-dynamic"

import { getDemoUserCollections } from "@/lib/db/collections"
import { getPinnedItems, getRecentItems, getItemStats, getDemoUserId } from "@/lib/db/items"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CollectionCard } from "@/components/dashboard/collection-card"
import { ItemCard } from "@/components/dashboard/item-card"

export default async function DashboardPage() {
  const userId = await getDemoUserId()

  const [collections, pinnedItems, recentItems, itemStats] = await Promise.all([
    getDemoUserCollections(),
    userId ? getPinnedItems(userId) : [],
    userId ? getRecentItems(userId, 10) : [],
    userId ? getItemStats(userId) : { total: 0, favorites: 0 },
  ])

  const stats = {
    items: itemStats.total,
    collections: collections.length,
    favoriteItems: itemStats.favorites,
    favoriteCollections: collections.filter((c) => c.isFavorite).length,
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Recent Items</h2>
          <span className="text-xs text-muted-foreground">See all</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
