"use client"

interface BillingIntervalToggleProps {
  yearly: boolean
  onChange: (yearly: boolean) => void
}

export function BillingIntervalToggle({ yearly, onChange }: BillingIntervalToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm font-medium transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
        Monthly
      </span>
      <button
        onClick={() => onChange(!yearly)}
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
  )
}
