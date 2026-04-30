"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"
import { signOutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  collapsed?: boolean
}

export function UserMenu({ user, collapsed = false }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2.5 w-full rounded-md p-1.5 hover:bg-accent transition-colors min-w-0",
          collapsed && "justify-center",
        )}
      >
        <UserAvatar user={user} size="sm" />
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium leading-none truncate">{user.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-48 rounded-md border border-border bg-popover shadow-md py-1 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </Link>
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent transition-colors w-full"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
