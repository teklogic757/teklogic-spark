/**
 * In-Memory Rate Limiter
 * Simple rate limiting for server actions. Resets on server restart.
 * For production scale, consider Upstash Redis (@upstash/ratelimit).
 */

type RateLimitConfig = {
  limit: number       // Max requests allowed
  windowMs: number    // Time window in milliseconds
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

// In-memory store: Map<identifier, RateLimitEntry>
const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically (every 5 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

// Preset configurations for different actions
export const RATE_LIMITS = {
  submitIdea: { limit: 10, windowMs: 60 * 60 * 1000 },        // 10 per hour
  createInvitation: { limit: 5, windowMs: 60 * 60 * 1000 },   // 5 per hour
  findOrganization: { limit: 20, windowMs: 60 * 1000 },       // 20 per minute
  signupWithInvite: { limit: 3, windowMs: 60 * 60 * 1000 },   // 3 per hour
  adminOperation: { limit: 30, windowMs: 60 * 1000 },         // 30 per minute
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if an action is rate limited for a given identifier (usually user ID or IP)
 */
export function checkRateLimit(
  action: RateLimitAction,
  identifier: string
): RateLimitResult {
  const config = RATE_LIMITS[action]
  const key = `${action}:${identifier}`
  const now = Date.now()

  let entry = store.get(key)

  // Create new entry if doesn't exist or window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    }
  }

  // Increment count
  entry.count++
  store.set(key, entry)

  const remaining = Math.max(0, config.limit - entry.count)
  const success = entry.count <= config.limit

  return {
    success,
    limit: config.limit,
    remaining,
    resetAt: entry.resetAt
  }
}

/**
 * Rate limit wrapper for server actions
 * Returns error response if rate limited, otherwise returns null
 */
export function rateLimitAction(
  action: RateLimitAction,
  identifier: string | null | undefined
): { error: string; status: number } | null {
  if (!identifier) {
    // If no identifier, allow the request (authentication should handle this)
    return null
  }

  const result = checkRateLimit(action, identifier)

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
    return {
      error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      status: 429
    }
  }

  return null
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  }
}
