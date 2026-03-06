import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  getClientIpRateLimitIdentifier: vi.fn(),
  rateLimitAction: vi.fn(),
  cookies: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createAdminClient: mocks.createAdminClient,
}))

vi.mock('@/lib/rate-limiter', () => ({
  getClientIpRateLimitIdentifier: mocks.getClientIpRateLimitIdentifier,
  rateLimitAction: mocks.rateLimitAction,
}))

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

import { joinWorkshop } from './actions'

function createFormData(code: string) {
  const formData = new FormData()
  formData.set('code', code)
  return formData
}

function buildJoinClients(options: {
  workshopData?: Record<string, unknown> | null
  workshopError?: unknown
  orgSlug?: string | null
}) {
  let codeEqCount = 0
  let selectedCode: string | null = null

  const userQuery = {
    select: vi.fn(() => userQuery),
    eq: vi.fn((column: string, value: string) => {
      if (column === 'code') {
        codeEqCount += 1
        selectedCode = value
      }
      return userQuery
    }),
    single: vi.fn(async () => ({
      data: options.workshopData ?? null,
      error: options.workshopError ?? null,
    })),
  }

  const adminQuery = {
    select: vi.fn(() => adminQuery),
    eq: vi.fn(() => adminQuery),
    single: vi.fn(async () => ({
      data: options.orgSlug ? { slug: options.orgSlug } : null,
      error: null,
    })),
  }

  const userClient = {
    from: vi.fn(() => userQuery),
    auth: {
      signInAnonymously: vi.fn(async () => ({ error: null })),
    },
  }

  const adminClient = {
    from: vi.fn(() => adminQuery),
  }

  return {
    userClient,
    adminClient,
    getCodeEqCount: () => codeEqCount,
    getSelectedCode: () => selectedCode,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getClientIpRateLimitIdentifier.mockResolvedValue('127.0.0.1')
  mocks.rateLimitAction.mockResolvedValue(null)
  mocks.cookies.mockResolvedValue({
    set: vi.fn(),
  })
  mocks.redirect.mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  })
})

describe('joinWorkshop', () => {
  it('rejects invalid code format', async () => {
    const result = await joinWorkshop(null, createFormData('abc'))
    expect(result).toEqual({ error: 'Invalid code format' })
  })

  it('rejects throttled join attempts', async () => {
    mocks.rateLimitAction.mockResolvedValue({ error: 'Rate limit exceeded', status: 429 })

    const result = await joinWorkshop(null, createFormData('ABC123'))
    expect(result).toEqual({ error: 'Rate limit exceeded' })
  })

  it('rejects invalid workshop codes', async () => {
    const { userClient, adminClient } = buildJoinClients({
      workshopData: null,
      workshopError: { message: 'not found' },
      orgSlug: 'teklogic',
    })
    mocks.createClient.mockResolvedValue(userClient)
    mocks.createAdminClient.mockResolvedValue(adminClient)

    const result = await joinWorkshop(null, createFormData('ABC123'))
    expect(result).toEqual({ error: 'Invalid workshop code.' })
  })

  it('rejects inactive or expired workshop links', async () => {
    const inactive = buildJoinClients({
      workshopData: {
        id: 'w1',
        organization_id: 'org-1',
        code: 'ABC123',
        is_active: false,
        expires_at: null,
      },
      orgSlug: 'teklogic',
    })
    mocks.createClient.mockResolvedValue(inactive.userClient)
    mocks.createAdminClient.mockResolvedValue(inactive.adminClient)

    const inactiveResult = await joinWorkshop(null, createFormData('ABC123'))
    expect(inactiveResult).toEqual({ error: 'This workshop link has expired.' })

    const expired = buildJoinClients({
      workshopData: {
        id: 'w1',
        organization_id: 'org-1',
        code: 'ABC123',
        is_active: true,
        expires_at: '2000-01-01T00:00:00.000Z',
      },
      orgSlug: 'teklogic',
    })
    mocks.createClient.mockResolvedValue(expired.userClient)
    mocks.createAdminClient.mockResolvedValue(expired.adminClient)

    const expiredResult = await joinWorkshop(null, createFormData('ABC123'))
    expect(expiredResult).toEqual({ error: 'This workshop link has expired.' })
  })

  it('sets workshop cookie and redirects for valid codes with a single code filter', async () => {
    const cookieStore = { set: vi.fn() }
    mocks.cookies.mockResolvedValue(cookieStore)

    const clients = buildJoinClients({
      workshopData: {
        id: 'w1',
        organization_id: 'org-1',
        code: 'ABC123',
        is_active: true,
        expires_at: null,
      },
      orgSlug: 'teklogic',
    })

    mocks.createClient.mockResolvedValue(clients.userClient)
    mocks.createAdminClient.mockResolvedValue(clients.adminClient)

    await expect(joinWorkshop(null, createFormData('abc123'))).rejects.toThrow(
      'REDIRECT:/teklogic/submit?source=workshop'
    )

    expect(clients.getCodeEqCount()).toBe(1)
    expect(clients.getSelectedCode()).toBe('ABC123')
    expect(cookieStore.set).toHaveBeenCalledWith(
      'teklogic_workshop_org',
      'org-1',
      expect.objectContaining({ httpOnly: true, path: '/' })
    )
  })
})
