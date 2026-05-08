export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getCollectionsByUserId } from "@/lib/db/collections"
import { CollectionCard } from "@/components/dashboard/collection-card"
import { NewCollectionButton, NewCollectionInlineButton } from "@/components/collections/new-collection-button"
import { FolderOpen } from "lucide-react"

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const collections = await getCollectionsByUserId(session.user.id)

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewCollectionButton />
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg text-center gap-2">
          <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No collections yet.</p>
          <NewCollectionInlineButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  )
}
