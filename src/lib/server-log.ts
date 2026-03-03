import 'server-only'

type LogValue = boolean | number | string | null
type LogDetails = Record<string, unknown>
type LogLevel = 'debug' | 'warn' | 'error'

const SENSITIVE_KEY_PATTERN = /authorization|cookie|password|secret|session|token/i
const MAX_STRING_LENGTH = 160
const MAX_ARRAY_ITEMS = 5

function truncate(value: string) {
    return value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH)}...`
        : value
}

function toLogValue(value: unknown): LogValue | LogValue[] | Record<string, LogValue | LogValue[]> {
    if (value == null) {
        return null
    }

    if (typeof value === 'string') {
        return truncate(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value
    }

    if (value instanceof Error) {
        return {
            name: value.name,
            message: truncate(value.message),
        }
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => {
            const normalized = toLogValue(entry)
            return typeof normalized === 'object' && !Array.isArray(normalized)
                ? '[object]'
                : (normalized as LogValue)
        })
    }

    if (typeof value === 'object') {
        const sanitized: Record<string, LogValue | LogValue[]> = {}

        for (const [key, entry] of Object.entries(value)) {
            if (SENSITIVE_KEY_PATTERN.test(key)) {
                sanitized[key] = '[redacted]'
                continue
            }

            const normalized = toLogValue(entry)
            sanitized[key] = typeof normalized === 'object' && !Array.isArray(normalized)
                ? '[object]'
                : (normalized as LogValue | LogValue[])
        }

        return sanitized
    }

    return String(value)
}

function write(level: LogLevel, event: string, details?: LogDetails) {
    if (level === 'debug' && process.env.NODE_ENV === 'production') {
        return
    }

    const payload = details ? toLogValue(details) : undefined

    if (level === 'debug') {
        console.debug(`[${event}]`, payload)
        return
    }

    if (level === 'warn') {
        console.warn(`[${event}]`, payload)
        return
    }

    console.error(`[${event}]`, payload)
}

export function debugLog(event: string, details?: LogDetails) {
    write('debug', event, details)
}

export function warnLog(event: string, details?: LogDetails) {
    write('warn', event, details)
}

export function errorLog(event: string, error: unknown, details?: LogDetails) {
    write('error', event, {
        ...details,
        error,
    })
}
