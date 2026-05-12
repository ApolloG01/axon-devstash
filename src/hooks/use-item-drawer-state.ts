"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateItem, deleteItem, toggleFavorite, togglePin } from "@/actions/items"
import { getCollectionsForPicker } from "@/actions/collections"
import type { SerializedItemFull } from "@/lib/db/items"
import type { CollectionOption } from "@/components/items/collection-picker"

export function useItemDrawerState(
  item: SerializedItemFull,
  onItemUpdate: (updated: SerializedItemFull) => void,
  onClose: () => void,
) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? "")
  const [content, setContent] = useState(item.content ?? "")
  const [language, setLanguage] = useState(item.language ?? "")
  const [url, setUrl] = useState(item.url ?? "")
  const [tags, setTags] = useState(item.tags.map((t) => t.name).join(", "))
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    item.collections.map((c) => c.collection.id),
  )
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([])

  const typeName = item.itemType.name
  const TEXT_TYPES = new Set(["snippet", "prompt", "command", "note"])
  const LANGUAGE_TYPES = new Set(["snippet", "command"])
  const isTextType = TEXT_TYPES.has(typeName)
  const isLanguageType = LANGUAGE_TYPES.has(typeName)
  const isUrlType = typeName === "link"
  const copyText = item.contentType === "url" ? item.url : item.content

  const resetFormToItem = useCallback(
    async (overrideContent?: string) => {
      setTitle(item.title)
      setDescription(item.description ?? "")
      setContent(overrideContent ?? item.content ?? "")
      setLanguage(item.language ?? "")
      setUrl(item.url ?? "")
      setTags(item.tags.map((t) => t.name).join(", "))
      setSelectedCollectionIds(item.collections.map((c) => c.collection.id))
      setEditing(true)
      if (availableCollections.length === 0) {
        const cols = await getCollectionsForPicker()
        setAvailableCollections(cols)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item, availableCollections.length],
  )

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  const handleEdit = () => resetFormToItem()
  const handleUseOptimized = (optimized: string) => resetFormToItem(optimized)

  const handleSave = async () => {
    setSaving(true)
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean)
    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: isTextType ? content || null : null,
      url: isUrlType ? url || null : null,
      language: isLanguageType ? language || null : null,
      tags: tagArray,
      collectionIds: selectedCollectionIds,
    })
    setSaving(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to save changes")
      return
    }
    toast.success("Changes saved")
    onItemUpdate(result.data as unknown as SerializedItemFull)
    setEditing(false)
    router.refresh()
  }

  const handleToggleFavorite = async () => {
    setToggling(true)
    const result = await toggleFavorite(item.id)
    setToggling(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to update")
      return
    }
    onItemUpdate(result.data as unknown as SerializedItemFull)
    router.refresh()
  }

  const handleTogglePin = async () => {
    setToggling(true)
    const result = await togglePin(item.id)
    setToggling(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to update")
      return
    }
    const pinned = (result.data as unknown as SerializedItemFull).isPinned
    toast.success(pinned ? "Item pinned" : "Item unpinned")
    onItemUpdate(result.data as unknown as SerializedItemFull)
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteItem(item.id)
    setDeleting(false)
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete item")
      return
    }
    toast.success("Item deleted")
    onClose()
    router.refresh()
  }

  const handleCancel = () => setEditing(false)

  return {
    copied,
    editing,
    saving,
    toggling,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    deleting,
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    language,
    setLanguage,
    url,
    setUrl,
    tags,
    setTags,
    selectedCollectionIds,
    setSelectedCollectionIds,
    availableCollections,
    copyText,
    handleCopy,
    handleEdit,
    handleCancel,
    handleUseOptimized,
    handleSave,
    handleToggleFavorite,
    handleTogglePin,
    handleDelete,
  }
}
