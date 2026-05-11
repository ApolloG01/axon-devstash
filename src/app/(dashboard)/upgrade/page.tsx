import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { UpgradePageClient } from "@/components/billing/upgrade-page-client"

export default async function UpgradePage() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")
  if (session.user.isPro) redirect("/settings")

  return <UpgradePageClient />
}
