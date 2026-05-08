"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME } from "@/constants"
import { registerUser } from "@/actions/auth"

export default function RegisterPage() {
  const [error, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Create a new account</p>
      </div>

      <form action={formAction} className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <Label htmlFor="reg-name" className="sr-only">Name</Label>
          <Input id="reg-name" name="name" type="text" placeholder="Name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="reg-email" className="sr-only">Email</Label>
          <Input id="reg-email" name="email" type="email" placeholder="Email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="reg-password" className="sr-only">Password</Label>
          <Input
            id="reg-password"
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label htmlFor="reg-confirm-password" className="sr-only">Confirm password</Label>
          <Input
            id="reg-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
