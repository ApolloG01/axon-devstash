export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"
import { PageToast } from "@/components/shared/page-toast"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const { passwordChanged } = await searchParams

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) redirect("/sign-in")

  const hasPassword = !!user.password

  return (
    <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
      {passwordChanged === "1" && <PageToast message="Password changed successfully!" />}

      <h1 className="text-lg font-semibold">Settings</h1>

      {/* Change Password */}
      {hasPassword && (
        <>
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Password</h2>
            <ChangePasswordForm />
          </section>
          <Separator />
        </>
      )}

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Danger Zone</h2>
        <DeleteAccountDialog />
      </section>
    </div>
  )
}
