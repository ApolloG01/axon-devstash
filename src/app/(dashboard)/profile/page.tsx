export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"
import { PageToast } from "@/components/shared/page-toast"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const { passwordChanged } = await searchParams

  const [user, typeGroups] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        createdAt: true,
        _count: { select: { items: true, collections: true } },
      },
    }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId: session.user.id },
      _count: { _all: true },
    }),
  ])

  if (!user) redirect("/sign-in")

  const typeIds = typeGroups.map((g) => g.itemTypeId)
  const itemTypes = typeIds.length
    ? await prisma.itemType.findMany({ where: { id: { in: typeIds } }, select: { id: true, name: true } })
    : []

  const typeCounts = Object.fromEntries(
    typeGroups.map((g) => {
      const name = itemTypes.find((t) => t.id === g.itemTypeId)?.name ?? g.itemTypeId
      return [name, g._count._all]
    })
  )

  const hasPassword = !!user.password

  return (
    <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
      {passwordChanged === "1" && <PageToast message="Password changed successfully!" />}

      {/* User Info */}
      <section className="space-y-4">
        <h1 className="text-lg font-semibold">Profile</h1>
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="space-y-0.5">
            <p className="font-medium">{user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Usage Stats */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Usage</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-2xl font-semibold">{user._count.items}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-2xl font-semibold">{user._count.collections}</p>
            <p className="text-xs text-muted-foreground">Collections</p>
          </div>
        </div>

        {user._count.items > 0 && (
          <div className="rounded-lg border border-border divide-y divide-border">
            {["snippet", "prompt", "note", "command", "link", "file", "image"].map((type) => {
              const count = typeCounts[type] ?? 0
              if (count === 0) return null
              return (
                <div key={type} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm capitalize">{type}s</span>
                  <span className="text-sm font-medium tabular-nums">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Separator />

      {/* Account Actions */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Account</h2>
        {hasPassword && <ChangePasswordForm />}
        <DeleteAccountDialog />
      </section>
    </div>
  )
}
