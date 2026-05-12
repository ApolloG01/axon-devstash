"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FavoriteStarButtonProps {
  isFavorite: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  size?: "sm" | "icon"
  showLabel?: boolean
}

export function FavoriteStarButton({
  isFavorite,
  disabled,
  onClick,
  className,
  size = "icon",
  showLabel = false,
}: FavoriteStarButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onClick}
      disabled={disabled}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        size === "sm" ? "h-7 px-2.5 text-xs gap-1.5" : "h-8 w-8",
        isFavorite ? "text-amber-400 hover:text-amber-400" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Star
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          isFavorite && "fill-amber-400",
        )}
      />
      {showLabel && "Favorite"}
    </Button>
  )
}
