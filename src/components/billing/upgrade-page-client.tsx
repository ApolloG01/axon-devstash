"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PRICING_TIERS } from "@/lib/homepage-data"
import { createCheckoutSession } from "@/actions/billing"

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

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${yearly ? "bg-blue-500" : "bg-muted"}`}
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle billing period"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${yearly ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/30">
            Save 25%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRICING_TIERS.map((tier) => {
          const isPro = tier.popular
          return (
            <div
              key={tier.name}
              className={`relative rounded-xl border p-7 flex flex-col ${
                isPro
                  ? "border-blue-500/60 bg-blue-500/5"
                  : "border-border bg-card"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="text-sm font-medium text-muted-foreground mb-3">{tier.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-muted-foreground text-lg">$</span>
                  <span className="text-4xl font-bold text-foreground">
                    {yearly ? tier.yearlyPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">/month</span>
                </div>
                {isPro && (
                  <p className={`text-xs transition-opacity duration-200 ${yearly ? "text-blue-400 opacity-100" : "opacity-0"}`}>
                    Billed ${tier.yearlyTotal}/year — 2 months free
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-3">{tier.description}</p>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {tier.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {f.ai ? (
                      <span className="text-amber-400 text-xs">✦</span>
                    ) : f.included ? (
                      <span className="text-green-500 text-sm">✓</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">✕</span>
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro ? (
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
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Cancel anytime. Payments securely processed by Stripe.
      </p>
    </div>
  )
}
