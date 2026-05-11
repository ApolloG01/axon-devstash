"use client"

import { usePathname } from "next/navigation"
import { NewItemButton } from "@/components/items/new-item-dialog"
import { NewCollectionButton } from "@/components/collections/new-collection-button"

type ItemType = {
  id: string
  name: string
  icon: string
  color: string
}

type Collection = { id: string; name: string }

export function DashboardNewItemButton({
  itemTypes,
  collections,
  isPro,
}: {
  itemTypes: ItemType[]
  collections: Collection[]
  isPro?: boolean
}) {
  const pathname = usePathname()
  if (pathname !== "/dashboard") return null
  return (
    <div className="flex items-center gap-2">
      <NewCollectionButton />
      <NewItemButton itemTypes={itemTypes} collections={collections} isPro={isPro} />
    </div>
  )
}
