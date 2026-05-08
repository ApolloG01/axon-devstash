"use server"

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { stripe, STRIPE_PRICES } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function createCheckoutSession(interval: "monthly" | "yearly") {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, isPro: true },
  })
  if (!user) return { success: false, error: "User not found" }
  if (user.isPro) return { success: false, error: "Already Pro" }

  const priceId = STRIPE_PRICES[interval]

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.stripeCustomerId ? undefined : (user.email ?? undefined),
    customer: user.stripeCustomerId ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  if (!checkoutSession.url) return { success: false, error: "Could not create checkout session" }

  redirect(checkoutSession.url)
}

export async function createBillingPortalSession() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })
  if (!user?.stripeCustomerId) return { success: false, error: "No billing account found" }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  redirect(portalSession.url)
}
