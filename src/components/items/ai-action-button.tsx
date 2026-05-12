"use client"

import type { LucideIcon } from "lucide-react"
import { Crown, Loader2, RefreshCw } from "lucide-react"
import { showUpgradeToast } from "@/lib/show-upgrade-toast"

interface AIActionButtonProps {
  loading: boolean
  hasResult: boolean
  isPro?: boolean
  loadingLabel: string
  actionLabel: string
  icon: LucideIcon
  onAction: () => void
  regenerateTitle?: string
}

export function AIActionButton({
  loading,
  hasResult,
  isPro,
  loadingLabel,
  actionLabel,
  icon: Icon,
  onAction,
  regenerateTitle,
}: AIActionButtonProps) {
  if (loading) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-white/40">
        <Loader2 className="h-3 w-3 animate-spin" />
        {loadingLabel}
      </span>
    )
  }

  if (hasResult) {
    return (
      <button
        onClick={onAction}
        className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
        title={regenerateTitle}
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    )
  }

  if (isPro) {
    return (
      <button
        onClick={onAction}
        className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
      >
        <Icon className="h-3 w-3" />
        {actionLabel}
      </button>
    )
  }

  return (
    <button
      onClick={showUpgradeToast}
      className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 transition-colors"
    >
      <Crown className="h-3 w-3" />
      {actionLabel}
    </button>
  )
}
