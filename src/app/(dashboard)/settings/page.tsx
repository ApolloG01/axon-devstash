export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"
import { PageToast } from "@/components/shared/page-toast"
import { EditorPreferencesForm } from "@/components/settings/editor-preferences-form"
import { ThemeToggle } from "@/components/settings/theme-toggle"
import { BillingSection } from "@/components/settings/billing-section"
import { UpgradePoller } from "@/components/settings/upgrade-poller"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string; upgraded?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const { passwordChanged, upgraded } = await searchParams

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, isPro: true, stripeCustomerId: true },
  })

  if (!user) redirect("/sign-in")

  const hasPassword = !!user.password

  return (
    <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
      {passwordChanged === "1" && <PageToast message="Password changed successfully!" />}
      {upgraded === "1" && <PageToast message="Welcome to Pro! Your account has been upgraded." />}
      {upgraded === "1" && <UpgradePoller initialIsPro={user.isPro} />}

      <h1 className="text-lg font-semibold">Settings</h1>

      {/* Appearance */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Appearance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your preferred color theme.
          </p>
        </div>
        <ThemeToggle />
      </section>

      <Separator />

      {/* Editor Preferences */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Editor</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize the code editor appearance and behavior.
          </p>
        </div>
        <EditorPreferencesForm />
      </section>

      <Separator />

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

      {/* Billing */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Billing</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your Pro subscription.
          </p>
        </div>
        <BillingSection isPro={user.isPro} hasStripeCustomer={!!user.stripeCustomerId} />
      </section>

      <Separator />

      {/* Danger Zone */}
      <section className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div>
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Irreversible actions. Proceed with caution.
          </p>
        </div>
        <DeleteAccountDialog />
      </section>
    </div>
  )
}
