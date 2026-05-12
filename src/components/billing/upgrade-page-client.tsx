"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PRICING_TIERS } from "@/lib/homepage-data"
import { createCheckoutSession } from "@/actions/billing"
import { BillingIntervalToggle } from "@/components/shared/billing-interval-toggle"
import { PricingCard } from "@/components/shared/pricing-card"

export function UpgradePageClient() {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const result = await createCheckoutSession(yearly ? "yearly" : "monthly")
    if (result && !result.success) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-3">Upgrade to Pro</h1>
        <p className="text-muted-foreground text-sm">
          Unlock unlimited items, file uploads, and AI features.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10">
        <BillingIntervalToggle yearly={yearly} onChange={setYearly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRICING_TIERS.map((tier) => {
          const isPro = tier.popular
          return (
            <PricingCard
              key={tier.name}
              tier={tier}
              yearly={yearly}
              cta={
                isPro ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Redirecting…" : yearly ? "Upgrade — $72/year" : "Upgrade — $8/month"}
                  </button>
                ) : (
                  <div className="block text-center py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground cursor-default select-none">
                    Current Plan
                  </div>
                )
              }
            />
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Cancel anytime. Payments securely processed by Stripe.
      </p>
    </div>
  )
}
