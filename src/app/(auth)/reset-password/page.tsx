"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/constants"
import { resetPassword } from "@/actions/auth"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [error, formAction, isPending] = useActionState(resetPassword, null)

  const isInvalidToken = error === "INVALID_TOKEN"

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Choose a new password</p>
      </div>

      {isInvalidToken ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-destructive">
            This reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password" className="text-sm text-foreground underline-offset-4 hover:underline">
            Request a new link
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="token" value={token} />
          {error && !isInvalidToken && <p className="text-sm text-destructive">{error}</p>}
          <Input
            name="password"
            type="password"
            placeholder="New password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Resetting…" : "Reset password"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
