"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/constants"
import { requestPasswordReset } from "@/actions/auth"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, formAction, isPending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData)
      if (result === null) setSubmitted(true)
      return result
    },
    null,
  )

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Reset your password</p>
      </div>

      {submitted ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, you'll receive a password reset link shortly.
          </p>
          <Link href="/sign-in" className="text-sm text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending…" : "Send reset link"}
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
