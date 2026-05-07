"use client"

import { usePathname } from "next/navigation"
import { NewItemButton } from "@/components/items/new-item-dialog"

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
}: {
  itemTypes: ItemType[]
  collections: Collection[]
}) {
  const pathname = usePathname()
  if (pathname !== "/dashboard") return null
  return <NewItemButton itemTypes={itemTypes} collections={collections} />
}
