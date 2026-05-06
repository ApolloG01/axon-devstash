import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getItemsByType } from "@/lib/db/items"
import { ItemGrid } from "@/components/items/item-grid"

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

      <ItemGrid items={items} emptyMessage={`No ${typeName}s yet.`} />
    </div>
  )
}
