import { afterEach, describe, expect, it } from 'vitest'

import {
  collectEnvValidationIssues,
  getConfiguredSiteUrl,
  isPreviewEnvironment,
  isProductionEnvironment,
} from './env-policy.mjs'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('deployment environment detection', () => {
  it('treats Vercel preview deployments as non-production at runtime', () => {
    expect(
      isProductionEnvironment({
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
      })
    ).toBe(false)
    expect(
      isPreviewEnvironment({
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
      })
    ).toBe(true)
  })

  it('still treats local production builds as production when no Vercel environment is present', () => {
    expect(
      isProductionEnvironment({
        NODE_ENV: 'production',
      })
    ).toBe(true)
  })
})

describe('configured site URL resolution', () => {
  it('prefers NEXT_PUBLIC_SITE_URL when provided', () => {
    const url = getConfiguredSiteUrl({
      NEXT_PUBLIC_SITE_URL: 'https://spark.teklogic.net',
      VERCEL_ENV: 'preview',
      VERCEL_URL: 'teklogic-preview.vercel.app',
    })

    expect(url?.toString()).toBe('https://spark.teklogic.net/')
  })

  it('falls back to VERCEL_URL for preview deployments', () => {
    const url = getConfiguredSiteUrl({
      VERCEL_ENV: 'preview',
      VERCEL_URL: 'teklogic-preview.vercel.app',
    })

    expect(url?.toString()).toBe('https://teklogic-preview.vercel.app/')
  })
})

describe('runtime validation for preview deployments', () => {
  it('warns instead of failing when local-only email overrides are used on Vercel preview', () => {
    const result = collectEnvValidationIssues(
      {
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
        VERCEL_URL: 'teklogic-preview.vercel.app',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
        SUPABASE_SERVICE_ROLE_KEY: 'service',
        OPENAI_API_KEY: 'openai',
        TEST_EMAIL_OVERRIDE: 'test@teklogic.net',
      },
      'runtime'
    )

    expect(result.unsafe).toEqual([])
    expect(result.missing).toEqual([])
    expect(result.warnings).toContain(
      'NEXT_PUBLIC_SITE_URL is not set. Runtime code will use the Vercel preview URL until a production hostname is configured.'
    )
    expect(result.warnings).toContain(
      'TEST_EMAIL_OVERRIDE is enabled. This should stay limited to local development and testing.'
    )
  })

  it('keeps deploy preflight strict for production readiness', () => {
    const result = collectEnvValidationIssues(
      {
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
        VERCEL_URL: 'teklogic-preview.vercel.app',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
        SUPABASE_SERVICE_ROLE_KEY: 'service',
        OPENAI_API_KEY: 'openai',
        TEST_EMAIL_OVERRIDE: 'test@teklogic.net',
      },
      'deploy'
    )

    expect(result.missing).toContain(
      'NEXT_PUBLIC_SITE_URL - Canonical site URL for production redirects and email links'
    )
    expect(result.unsafe).toContain(
      'TEST_EMAIL_OVERRIDE must be unset in production because it is a local-only override.'
    )
  })
})
