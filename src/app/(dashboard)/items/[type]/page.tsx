import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getItemsByType } from "@/lib/db/items"
import { ItemCard } from "@/components/dashboard/item-card"

const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  links: "link",
  files: "file",
  images: "image",
}

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type: slug } = await params
  const typeName = TYPE_SLUG_MAP[slug]
  if (!typeName) notFound()

  const session = await auth()
  if (!session?.user?.id) notFound()

  const items = await getItemsByType(session.user.id, typeName)

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-lg font-semibold capitalize">{slug}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {items.length} {items.length === 1 ? typeName : `${typeName}s`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">No {typeName}s yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
