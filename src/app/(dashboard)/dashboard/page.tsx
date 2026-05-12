export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCollectionsByUserId } from "@/lib/db/collections"
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items"
import { auth } from "@/auth"
import { DASHBOARD_COLLECTIONS_LIMIT, DASHBOARD_RECENT_ITEMS_LIMIT } from "@/constants"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CollectionCard } from "@/components/dashboard/collection-card"
import { ItemGrid } from "@/components/items/item-grid"
import { PageToast } from "@/components/shared/page-toast"
import { NewCollectionInlineButton } from "@/components/collections/new-collection-button"
import { FolderOpen, Layers } from "lucide-react"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const { welcome } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")
  const userId = session.user.id
  const userName = session.user.name?.split(" ")[0] ?? "there"

  const [collections, pinnedItems, recentItems, itemStats] = await Promise.all([
    getCollectionsByUserId(userId),
    getPinnedItems(userId),
    getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
    getItemStats(userId),
  ])

  const stats = {
    items: itemStats.total,
    collections: collections.length,
    favoriteItems: itemStats.favorites,
    favoriteCollections: collections.filter((c) => c.isFavorite).length,
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      {welcome === "1" && <PageToast message="Welcome back!" />}

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {itemStats.total === 0
            ? "Create your first item to get started."
            : `You have ${itemStats.total} item${itemStats.total !== 1 ? "s" : ""} across ${collections.length} collection${collections.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Collections */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold">Collections</h2>
          {collections.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {collections.length}
            </span>
          )}
        </div>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-lg text-center gap-2">
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No collections yet.</p>
            <NewCollectionInlineButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {collections.slice(0, DASHBOARD_COLLECTIONS_LIMIT).map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-4">Pinned</h2>
          <ItemGrid items={pinnedItems} isPro={session.user.isPro} />
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Recent Items</h2>
            {recentItems.length > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {recentItems.length}
              </span>
            )}
          </div>
        </div>

        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-lg text-center gap-2">
            <Layers className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No items yet.</p>
            <p className="text-xs text-muted-foreground">
              Use the <span className="font-medium text-foreground">New</span> button to create your first item.
            </p>
          </div>
        ) : (
          <ItemGrid items={recentItems} isPro={session.user.isPro} />
        )}
      </section>
    </div>
  )
}
