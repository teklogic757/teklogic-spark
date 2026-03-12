import { describe, expect, it } from 'vitest'
import { NextResponse } from 'next/server'

import {
  PUBLIC_SECURITY_HEADER_POLICY,
  applyPublicSecurityHeaders,
  getPublicAuthCookieOptions,
  getPublicSecurityHeaders,
  isRequestHttps,
} from './security-headers'

describe('security header policy', () => {
  it('returns the baseline public browser protections', () => {
    const headers = getPublicSecurityHeaders({
      isProduction: false,
      isHttps: false,
    })

    for (const [key, value] of Object.entries(PUBLIC_SECURITY_HEADER_POLICY)) {
      expect(headers.get(key)).toBe(value)
    }

    expect(headers.has('strict-transport-security')).toBe(false)
  })

  it('adds HSTS only for production HTTPS responses', () => {
    const productionHttpsHeaders = getPublicSecurityHeaders({
      isProduction: true,
      isHttps: true,
    })
    const productionHttpHeaders = getPublicSecurityHeaders({
      isProduction: true,
      isHttps: false,
    })
    const developmentHttpsHeaders = getPublicSecurityHeaders({
      isProduction: false,
      isHttps: true,
    })

    expect(productionHttpsHeaders.get('strict-transport-security')).toBe(
      'max-age=31536000; includeSubDomains'
    )
    expect(productionHttpHeaders.has('strict-transport-security')).toBe(false)
    expect(developmentHttpsHeaders.has('strict-transport-security')).toBe(false)
  })

  it('applies the shared header contract to next responses', () => {
    const response = applyPublicSecurityHeaders(NextResponse.next(), {
      isProduction: true,
      isHttps: true,
    })

    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(response.headers.get('cross-origin-resource-policy')).toBe('same-origin')
    expect(response.headers.get('strict-transport-security')).toBe(
      'max-age=31536000; includeSubDomains'
    )
  })
})

describe('request protocol detection', () => {
  it('prefers x-forwarded-proto when present', () => {
    const request = new Request('http://internal.test/dashboard', {
      headers: {
        'x-forwarded-proto': 'https',
      },
    })

    expect(isRequestHttps(request)).toBe(true)
  })

  it('falls back to the request URL when proxy headers are absent', () => {
    expect(isRequestHttps(new Request('https://teklogic.test/login'))).toBe(true)
    expect(isRequestHttps(new Request('http://teklogic.test/login'))).toBe(false)
  })
})

describe('auth cookie posture', () => {
  it('keeps the session cookie contract explicit for local HTTP development', () => {
    expect(
      getPublicAuthCookieOptions({
        isProduction: false,
        isHttps: false,
      })
    ).toEqual({
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: false,
    })
  })

  it('marks auth cookies secure for production and HTTPS traffic', () => {
    expect(
      getPublicAuthCookieOptions({
        isProduction: true,
        isHttps: false,
      }).secure
    ).toBe(true)
    expect(
      getPublicAuthCookieOptions({
        isProduction: false,
        isHttps: true,
      }).secure
    ).toBe(true)
  })
})
