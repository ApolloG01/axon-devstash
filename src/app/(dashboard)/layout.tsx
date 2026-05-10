import { redirect } from "next/navigation"
import Link from "next/link"
import { Star } from "lucide-react"
import { Sidebar, MobileSidebarTrigger } from "@/components/layout/sidebar"
import { getSystemItemTypes, getSearchableItems } from "@/lib/db/items"
import { getCollectionsByUserId, getSearchableCollections } from "@/lib/db/collections"
import { APP_NAME } from "@/constants"
import { auth } from "@/auth"
import { DashboardNewItemButton } from "@/components/shared/dashboard-new-item-button"
import { CommandPalette } from "@/components/shared/command-palette"
import { EditorPreferencesProvider } from "@/context/editor-preferences-context"
import { getEditorPreferences } from "@/actions/editor-preferences"
import { LogoMark } from "@/components/shared/logo-mark"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, itemTypes] = await Promise.all([auth(), getSystemItemTypes()])

  if (!session?.user) redirect("/sign-in")

  const userId = session.user.id!

  const [collections, searchItems, searchCollections, editorPreferences] =
    await Promise.all([
      getCollectionsByUserId(userId),
      getSearchableItems(userId),
      getSearchableCollections(userId),
      getEditorPreferences(),
    ])

  const user = session.user

  const visibleItemTypes = session.user.isPro
    ? itemTypes
    : itemTypes.filter((t) => t.name !== "file" && t.name !== "image")

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
          className="flex items-center gap-2 font-semibold tracking-tight shrink-0 hover:opacity-75 transition-opacity"
        >
          <LogoMark className="w-5 h-5 shrink-0" />
          <span className="text-sm hidden sm:block">{APP_NAME}</span>
        </Link>

        <div className="flex-1 max-w-lg">
          <CommandPalette items={searchItems} collections={searchCollections} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/favorites"
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Favorites"
          >
            <Star className="h-4 w-4" />
          </Link>
          <DashboardNewItemButton itemTypes={visibleItemTypes} collections={collections.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
        <main className="flex-1 overflow-auto">
          <EditorPreferencesProvider initial={editorPreferences}>
            {children}
          </EditorPreferencesProvider>
        </main>
      </div>
    </div>
  )
}
