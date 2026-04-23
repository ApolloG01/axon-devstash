import { mockItems, mockCollections, mockItemTypes } from "@/lib/mock-data"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CollectionCard } from "@/components/dashboard/collection-card"
import { ItemCard } from "@/components/dashboard/item-card"

export default function DashboardPage() {
  const getItemType = (itemTypeId: string) =>
    mockItemTypes.find((t) => t.id === itemTypeId)

  const pinnedItems = mockItems.filter((i) => i.isPinned)

  const recentItems = [...mockItems]
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
    .slice(0, 10)

  const stats = {
    items: mockItems.length,
    collections: mockCollections.length,
    favoriteItems: mockItems.filter((i) => i.isFavorite).length,
    favoriteCollections: mockCollections.filter((c) => c.isFavorite).length,
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
          {mockCollections.map((col) => {
            const defaultType = col.defaultTypeId ? getItemType(col.defaultTypeId) : undefined
            return (
              <CollectionCard key={col.id} collection={col} defaultType={defaultType} />
            )
          })}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-4">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} type={getItemType(item.itemTypeId)} />
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
            <ItemCard key={item.id} item={item} type={getItemType(item.itemTypeId)} />
          ))}
        </div>
      </section>
    </div>
  )
}
