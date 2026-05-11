import { redirect } from "next/navigation"
import { Star } from "lucide-react"
import { auth } from "@/auth"
import { getFavoriteItems } from "@/lib/db/items"
import { getFavoriteCollections } from "@/lib/db/collections"
import { FavoritesList } from "@/components/favorites/favorites-list"

export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const userId = session.user.id

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-4 w-4 text-amber-400" />
        <h1 className="text-sm font-semibold font-mono tracking-wide">Favorites</h1>
        <span className="text-xs font-mono text-muted-foreground">
          — {items.length + collections.length} total
        </span>
      </div>

      <FavoritesList items={items} collections={collections} isPro={session.user.isPro} />
    </div>
  )
}
