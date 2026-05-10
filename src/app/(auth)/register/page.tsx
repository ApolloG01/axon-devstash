"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser, githubSignIn } from "@/actions/auth"

export default function RegisterPage() {
  const [error, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">Create a new account</p>

      <div className="space-y-4">
        <form action={githubSignIn}>
          <Button type="submit" variant="outline" className="w-full gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.573C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign up with GitHub
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground uppercase tracking-wider">or</span>
          </div>
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
    </div>
  )
}
