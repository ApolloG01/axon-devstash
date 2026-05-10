"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/actions/billing"

interface ProGateProps {
  featureName: string
  description: string
}

export function ProGate({ featureName, description }: ProGateProps) {
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

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 max-w-md mx-auto gap-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted border border-border">
        <Lock className="w-6 h-6 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
          Pro Feature
        </div>
        <h2 className="text-xl font-semibold">{featureName}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
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
            Yearly — $6/mo
          </Button>
        </div>
        <Button className="w-full max-w-xs" onClick={handleUpgrade} disabled={loading}>
          {loading ? "Redirecting…" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  )
}
