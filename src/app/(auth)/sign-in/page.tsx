import { SignInForm } from "./sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; registered?: string; signedOut?: string }>
}) {
  const params = await searchParams
  const raw = params.callbackUrl
  const callbackUrl = (Array.isArray(raw) ? raw[0] : raw) || "/dashboard"
  const registered = params.registered === "1"
  const signedOut = params.signedOut === "1"
  return <SignInForm callbackUrl={callbackUrl} registered={registered} signedOut={signedOut} />
}
