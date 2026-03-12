import type { CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ONE_YEAR_IN_SECONDS = 31536000

export const PUBLIC_SECURITY_HEADER_POLICY = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-dns-prefetch-control': 'off',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
} as const

export type SecurityHeaderOptions = {
  isHttps?: boolean
  isProduction?: boolean
}

export function isRequestHttps(request?: Pick<NextRequest, 'headers' | 'nextUrl'> | Request | URL | null) {
  if (!request) {
    return process.env.NODE_ENV === 'production'
  }

  if ('headers' in request) {
    const forwardedProto = request.headers.get('x-forwarded-proto')
    if (forwardedProto) {
      return forwardedProto.split(',')[0]?.trim() === 'https'
    }
  }

  if ('nextUrl' in (request as Pick<NextRequest, 'nextUrl'>)) {
    return (request as Pick<NextRequest, 'nextUrl'>).nextUrl.protocol === 'https:'
  }

  if ('url' in (request as Request)) {
    return new URL((request as Request).url).protocol === 'https:'
  }

  return (request as URL).protocol === 'https:'
}

export function getPublicSecurityHeaders(options: SecurityHeaderOptions = {}) {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production'
  const isHttps = options.isHttps ?? isRequestHttps()
  const headers = new Headers(PUBLIC_SECURITY_HEADER_POLICY)

  if (isProduction && isHttps) {
    headers.set(
      'strict-transport-security',
      `max-age=${ONE_YEAR_IN_SECONDS}; includeSubDomains`
    )
  }

  return headers
}

export function applyPublicSecurityHeaders(
  response: NextResponse,
  options: SecurityHeaderOptions = {}
) {
  const headers = getPublicSecurityHeaders(options)

  headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  return response
}

export function getPublicAuthCookieOptions(
  options: SecurityHeaderOptions = {}
): CookieOptions {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production'
  const isHttps = options.isHttps ?? isRequestHttps()

  return {
    path: '/',
    sameSite: 'lax',
    secure: isProduction || isHttps,
    httpOnly: false,
  }
}
