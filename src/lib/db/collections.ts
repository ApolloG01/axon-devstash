import { prisma } from "@/lib/prisma";
import type { ItemWithType } from "@/lib/db/items";

const itemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  language: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isFavorite: true,
  isPinned: true,
  lastUsedAt: true,
  createdAt: true,
  itemType: { select: { name: true, color: true, icon: true } },
  tags: { select: { name: true } },
} as const

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
};

export async function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  const col = await prisma.collection.findUnique({
    where: { id: collectionId, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      _count: { select: { items: true } },
    },
  });
  if (!col) return null;
  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    itemCount: col._count.items,
  };
}

export async function getItemsByCollectionId(
  userId: string,
  collectionId: string,
): Promise<ItemWithType[]> {
  const rows = await prisma.itemCollection.findMany({
    where: { collectionId, item: { userId } },
    select: { item: { select: itemSelect } },
    orderBy: { addedAt: "desc" },
  });
  return rows.map((r) => r.item);
}

export async function getUserCollectionsList(userId: string): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type SearchCollection = {
  id: string
  name: string
  itemCount: number
}

export async function getSearchableCollections(userId: string): Promise<SearchCollection[]> {
  const rows = await prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true, _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    itemCount: row._count.items,
  }));
}

export async function createCollectionInDb(
  userId: string,
  data: { name: string; description?: string | null },
) {
  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
  });
}

export async function updateCollectionInDb(
  userId: string,
  collectionId: string,
  data: { name: string; description?: string | null },
) {
  return prisma.collection.updateMany({
    where: { id: collectionId, userId },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });
}

export async function deleteCollectionInDb(
  userId: string,
  collectionId: string,
) {
  return prisma.collection.deleteMany({
    where: { id: collectionId, userId },
  });
}

export type CollectionWithTypes = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  accentColor: string;
  typeIcons: Array<{ name: string; color: string; icon: string }>;
};

export async function getCollectionsByUserId(
  userId: string,
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      _count: { select: { items: true } },
      items: {
        include: {
          item: {
            select: {
              itemType: { select: { name: true, color: true, icon: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return collections.map((col) => {
    const typeCounts = new Map<
      string,
      { name: string; color: string; icon: string; count: number }
    >();
    for (const ic of col.items) {
      const type = ic.item.itemType;
      const existing = typeCounts.get(type.name);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(type.name, { ...type, count: 1 });
      }
    }

    const sortedTypes = [...typeCounts.values()].sort(
      (a, b) => b.count - a.count,
    );
    const accentColor = sortedTypes[0]?.color ?? "#6b7280";
    const typeIcons = sortedTypes.map(({ name, color, icon }) => ({
      name,
      color,
      icon,
    }));

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      accentColor,
      typeIcons,
    };
  });
}

