"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from "@/actions/profile"

export function ChangePasswordForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, formAction, isPending] = useActionState(changePassword, null)

  useEffect(() => {
    if (error === "PASSWORD_CHANGED") {
      setOpen(false)
      router.push("/profile?passwordChanged=1")
    }
  }, [error, router])

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Change Password
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Change Password</p>
      {error && error !== "PASSWORD_CHANGED" && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
