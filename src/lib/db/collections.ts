import { prisma } from "@/lib/prisma";

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
    orderBy: { createdAt: "asc" },
  });

  return collections.map((col) => {
    // Count items per type to find the dominant one
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

// Temporary until auth is implemented — fetches for the demo user
export async function getDemoUserCollections(): Promise<CollectionWithTypes[]> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  if (!user) return [];
  return getCollectionsByUserId(user.id);
}
