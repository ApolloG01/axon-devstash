import type { ReactNode } from "react"
import type { PricingTier } from "@/lib/homepage-data"

interface PricingCardProps {
  tier: PricingTier
  yearly: boolean
  cta: ReactNode
}

export function PricingCard({ tier, yearly, cta }: PricingCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-7 flex flex-col ${
        tier.popular ? "border-blue-500/60 bg-blue-500/5" : "border-border bg-card"
      }`}
    >
      {tier.popular && (
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
        {tier.popular && (
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
            <span className={f.included ? "text-foreground" : "text-muted-foreground"}>{f.label}</span>
          </li>
        ))}
      </ul>

      {cta}
    </div>
  )
}
