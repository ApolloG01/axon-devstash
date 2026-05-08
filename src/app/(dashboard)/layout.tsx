import { redirect } from "next/navigation"
import Link from "next/link"
import { Sidebar, MobileSidebarTrigger } from "@/components/layout/sidebar"
import { getSystemItemTypes, getSearchableItems } from "@/lib/db/items"
import { getCollectionsByUserId, getSearchableCollections } from "@/lib/db/collections"
import { APP_NAME } from "@/constants"
import { auth } from "@/auth"
import { DashboardNewItemButton } from "@/components/shared/dashboard-new-item-button"
import { CommandPalette } from "@/components/shared/command-palette"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, itemTypes] = await Promise.all([auth(), getSystemItemTypes()])

  if (!session?.user) redirect("/sign-in")

  const userId = session.user.id!

  const [collections, searchItems, searchCollections] = await Promise.all([
    getCollectionsByUserId(userId),
    getSearchableItems(userId),
    getSearchableCollections(userId),
  ])

  const user = session.user

  const favoriteCollections = collections.filter((c) => c.isFavorite)
  const recentCollections = collections.slice(0, 3)

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <MobileSidebarTrigger
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />

        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight w-40 shrink-0 hover:opacity-75 transition-opacity"
        >
          {APP_NAME}
        </Link>

        <div className="flex-1 max-w-lg">
          <CommandPalette items={searchItems} collections={searchCollections} />
        </div>

        <div className="ml-auto">
          <DashboardNewItemButton itemTypes={itemTypes} collections={collections.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
