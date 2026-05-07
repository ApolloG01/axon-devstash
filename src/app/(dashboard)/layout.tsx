import { redirect } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Sidebar, MobileSidebarTrigger } from "@/components/layout/sidebar"
import { getSystemItemTypes } from "@/lib/db/items"
import { getCollectionsByUserId } from "@/lib/db/collections"
import { APP_NAME } from "@/constants"
import { auth } from "@/auth"
import { Search } from "lucide-react"
import { DashboardNewItemButton } from "@/components/shared/dashboard-new-item-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, itemTypes] = await Promise.all([auth(), getSystemItemTypes()])

  if (!session?.user) redirect("/sign-in")

  const collections = await getCollectionsByUserId(session.user.id!)

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
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, collections, tags..."
              className="pl-8 h-8 bg-muted/40 border-border text-sm"
            />
          </div>
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
