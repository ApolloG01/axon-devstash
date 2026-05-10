"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface UpgradePollProps {
  initialIsPro: boolean
}

export function UpgradePoller({ initialIsPro }: UpgradePollProps) {
  const router = useRouter()

  useEffect(() => {
    if (initialIsPro) return

    let attempts = 0
    const MAX = 10

    const id = setInterval(async () => {
      attempts++
      try {
        const res = await fetch("/api/billing/status")
        const { isPro } = await res.json()
        if (isPro) {
          clearInterval(id)
          router.refresh()
        }
      } catch {}
      if (attempts >= MAX) clearInterval(id)
    }, 1500)

    return () => clearInterval(id)
  }, [initialIsPro, router])

  return null
}
