import 'server-only'

import { headers } from 'next/headers'

import { errorLog, warnLog } from '@/lib/server-log'
import { createAdminClient } from '@/lib/supabase/server'

type RateLimitConfig = {
    limit: number
    windowMs: number
}

type ConsumeRateLimitRow = {
    allowed: boolean
    remaining: number
    reset_at: string
    limit_count: number
}

type InMemoryRateLimitEntry = {
    count: number
    resetAt: number
}

export const RATE_LIMITS = {
    submitIdea: { limit: 10, windowMs: 60 * 60 * 1000 },
    submitIdeaGuest: { limit: 5, windowMs: 60 * 60 * 1000 },
    submitIdeaAttachment: { limit: 4, windowMs: 60 * 60 * 1000 },
    createInvitation: { limit: 5, windowMs: 60 * 60 * 1000 },
    findOrganization: { limit: 20, windowMs: 60 * 1000 },
    joinWorkshop: { limit: 10, windowMs: 15 * 60 * 1000 },
    signupWithInvite: { limit: 3, windowMs: 60 * 60 * 1000 },
    adminOperation: { limit: 30, windowMs: 60 * 1000 },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitAction = keyof typeof RATE_LIMITS

export type RateLimitResult = {
    success: boolean
    limit: number
    remaining: number
    resetAt: number
}

const RATE_LIMIT_UNAVAILABLE_MESSAGE = 'Unable to verify request rate right now. Please try again in a moment.'
const inMemoryFallbackStore = new Map<string, InMemoryRateLimitEntry>()

function normalizeIdentifier(identifier: string) {
    return identifier.trim().toLowerCase()
}

function extractClientIp(value: string | null) {
    if (!value) {
        return null
    }

    const firstValue = value.split(',')[0]?.trim()
    if (!firstValue) {
        return null
    }

    return firstValue.startsWith('::ffff:')
        ? firstValue.slice('::ffff:'.length)
        : firstValue
}

function getConsumeRow(payload: unknown): ConsumeRateLimitRow | null {
    if (Array.isArray(payload)) {
        const [firstRow] = payload
        return firstRow as ConsumeRateLimitRow | null
    }

    return payload as ConsumeRateLimitRow | null
}

function consumeRateLimitInMemory(
    action: RateLimitAction,
    identifier: string
): RateLimitResult {
    const config = RATE_LIMITS[action]
    const normalizedIdentifier = normalizeIdentifier(identifier)
    const key = `${action}:${normalizedIdentifier}`
    const now = Date.now()

    let entry = inMemoryFallbackStore.get(key)

    if (!entry || entry.resetAt <= now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs,
        }
    }

    entry.count += 1
    inMemoryFallbackStore.set(key, entry)

    return {
        success: entry.count <= config.limit,
        limit: config.limit,
        remaining: Math.max(0, config.limit - entry.count),
        resetAt: entry.resetAt,
    }
}

async function consumeRateLimit(
    action: RateLimitAction,
    identifier: string
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[action]
    const supabaseAdmin = await createAdminClient()
    const { data, error } = await (supabaseAdmin.rpc as any)('consume_rate_limit', {
        p_action: action,
        p_identifier: normalizeIdentifier(identifier),
        p_limit: config.limit,
        p_window_seconds: Math.max(1, Math.ceil(config.windowMs / 1000)),
    })

    if (error) {
        throw error
    }

    const row = getConsumeRow(data)
    if (!row) {
        throw new Error(`Rate limit function returned no data for action "${action}".`)
    }

    return {
        success: row.allowed,
        limit: row.limit_count,
        remaining: row.remaining,
        resetAt: new Date(row.reset_at).getTime(),
    }
}

export async function checkRateLimit(
    action: RateLimitAction,
    identifier: string
): Promise<RateLimitResult> {
    try {
        return await consumeRateLimit(action, identifier)
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            warnLog('rate_limit.fallback_in_memory', {
                action,
                identifier,
                reason: error instanceof Error ? error.message : 'Unknown durable limiter failure',
            })

            return consumeRateLimitInMemory(action, identifier)
        }

        throw error
    }
}

export async function rateLimitAction(
    action: RateLimitAction,
    identifier: string | null | undefined
): Promise<{ error: string; status: number } | null> {
    if (!identifier) {
        return null
    }

    try {
        const result = await checkRateLimit(action, identifier)

        if (!result.success) {
            const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
            return {
                error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                status: 429,
            }
        }

        return null
    } catch (error) {
        errorLog('rate_limit.consume_failed', error, {
            action,
            identifier,
        })

        return {
            error: RATE_LIMIT_UNAVAILABLE_MESSAGE,
            status: 503,
        }
    }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
    }
}

export function buildScopedRateLimitIdentifier(
    scope: string,
    identifier: string | null | undefined
): string | null {
    if (!identifier) {
        return null
    }

    const normalizedScope = normalizeIdentifier(scope)
    const normalizedIdentifier = normalizeIdentifier(identifier)

    if (!normalizedScope || !normalizedIdentifier) {
        return null
    }

    return `${normalizedScope}:${normalizedIdentifier}`
}

export async function getClientIpRateLimitIdentifier(): Promise<string> {
    const headerStore = await headers()
    const forwardedIp = extractClientIp(headerStore.get('x-forwarded-for'))
    const realIp = extractClientIp(headerStore.get('x-real-ip'))
    const clientIp = forwardedIp || realIp || 'unknown'

    return normalizeIdentifier(clientIp)
}
