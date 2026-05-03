import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

let redis: Redis | null = null
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

const limiters: Record<string, Ratelimit> = {}

function getLimiter(key: string, requests: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]): Ratelimit | null {
  const r = getRedis()
  if (!r) return null
  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `rl:${key}`,
    })
  }
  return limiters[key]
}

export function getIpFromHeaders(headerMap: Headers): string {
  const forwarded = headerMap.get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1"
}

export interface RateLimitResult {
  limited: boolean
  retryAfterSeconds?: number
}

async function check(
  limiterKey: string,
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  identifier: string,
): Promise<RateLimitResult> {
  try {
    const limiter = getLimiter(limiterKey, requests, window)
    if (!limiter) return { limited: false } // fail open — Upstash not configured

    const result = await limiter.limit(identifier)
    if (result.success) return { limited: false }

    const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000)
    return { limited: true, retryAfterSeconds: Math.max(retryAfterSeconds, 1) }
  } catch {
    return { limited: false } // fail open — Upstash unavailable
  }
}

// 3 attempts per hour, keyed by IP
export async function checkRegisterLimit(ip: string): Promise<RateLimitResult> {
  return check("register", 3, "1 h", ip)
}

// 3 attempts per hour, keyed by IP
export async function checkForgotPasswordLimit(ip: string): Promise<RateLimitResult> {
  return check("forgot-password", 3, "1 h", ip)
}

// 5 attempts per 15 min, keyed by IP:email
export async function checkSignInLimit(ip: string, email: string): Promise<RateLimitResult> {
  return check("sign-in", 5, "15 m", `${ip}:${email}`)
}

// Reads IP from next/headers — use inside Server Actions
export async function getActionIp(): Promise<string> {
  const h = await headers()
  return getIpFromHeaders(h)
}
