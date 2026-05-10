"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing"

interface BillingSectionProps {
  isPro: boolean
  hasStripeCustomer: boolean
}

export function BillingSection({ isPro, hasStripeCustomer }: BillingSectionProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const result = await createCheckoutSession(interval)
    if (result && !result.success) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  async function handleManage() {
    setLoading(true)
    const result = await createBillingPortalSession()
    if (result && !result.success) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  if (isPro) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-400">Pro</span>
          <span className="text-xs text-muted-foreground">— active subscription</span>
        </div>
        {hasStripeCustomer && (
          <Button variant="outline" size="sm" onClick={handleManage} disabled={loading}>
            {loading ? "Loading…" : "Manage Billing"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upgrade to Pro for unlimited items, collections, file uploads, and AI features.
      </p>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={interval === "monthly" ? "default" : "outline"}
          onClick={() => setInterval("monthly")}
        >
          Monthly — $8/mo
        </Button>
        <Button
          size="sm"
          variant={interval === "yearly" ? "default" : "outline"}
          onClick={() => setInterval("yearly")}
        >
          Yearly — $72/yr
        </Button>
      </div>

      <Button onClick={handleUpgrade} disabled={loading}>
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </Button>
    </div>
  )
}
