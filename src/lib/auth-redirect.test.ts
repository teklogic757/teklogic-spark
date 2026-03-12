import { afterEach, describe, expect, it } from 'vitest'

import { buildAuthCallbackUrl, resolveAuthRedirect } from './auth-redirect'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
    return
  }

  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
})

describe('resolveAuthRedirect', () => {
  it('keeps safe relative in-app redirects on the canonical host', () => {
    const result = resolveAuthRedirect('/teklogic/dashboard?tab=ideas#top', {
      request: 'https://app.teklogic.test/login',
    })

    expect(result).toEqual({
      destination: 'https://app.teklogic.test/teklogic/dashboard?tab=ideas#top',
      isExternal: false,
      normalizedTarget: '/teklogic/dashboard?tab=ideas#top',
      rejectedReason: null,
    })
  })

  it('normalizes canonical absolute URLs back onto the canonical host', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://spark.teklogic.test'

    const result = resolveAuthRedirect('https://spark.teklogic.test/teklogic/dashboard', {
      request: 'https://preview.teklogic.test/login',
    })

    expect(result.destination).toBe('https://spark.teklogic.test/teklogic/dashboard')
    expect(result.isExternal).toBe(false)
    expect(result.rejectedReason).toBe(null)
  })

  it('rejects protocol-relative and off-site redirect targets by default', () => {
    const protocolRelative = resolveAuthRedirect('//evil.example/phish', {
      request: 'https://app.teklogic.test/login',
      fallbackPath: '/login',
    })
    const external = resolveAuthRedirect('https://evil.example/phish', {
      request: 'https://app.teklogic.test/login',
      fallbackPath: '/login',
    })

    expect(protocolRelative.destination).toBe('https://app.teklogic.test/login')
    expect(protocolRelative.rejectedReason).toBe('invalid_redirect_target')
    expect(external.destination).toBe('https://app.teklogic.test/login')
    expect(external.rejectedReason).toBe('external_origin_not_allowlisted')
  })

  it('allows explicit external origins when they are allowlisted', () => {
    const result = resolveAuthRedirect('https://docs.teklogic.test/post-auth', {
      request: 'https://app.teklogic.test/login',
      allowExternalOrigins: ['https://docs.teklogic.test'],
    })

    expect(result).toEqual({
      destination: 'https://docs.teklogic.test/post-auth',
      isExternal: true,
      normalizedTarget: 'https://docs.teklogic.test/post-auth',
      rejectedReason: null,
    })
  })
})

describe('buildAuthCallbackUrl', () => {
  it('uses the configured canonical site URL when present', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://spark.teklogic.test'

    expect(
      buildAuthCallbackUrl({
        currentOrigin: 'https://preview.teklogic.test',
        next: '/teklogic/dashboard',
      })
    ).toBe('https://spark.teklogic.test/auth/callback?next=%2Fteklogic%2Fdashboard')
  })

  it('falls back to the live browser origin for local development', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    expect(
      buildAuthCallbackUrl({
        currentOrigin: 'http://localhost:4321',
      })
    ).toBe('http://localhost:4321/auth/callback')
  })
})
