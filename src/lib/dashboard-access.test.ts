import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock } from '@/test/mocks/supabase'

const { createClientMock, createAdminClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createAdminClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
  createAdminClient: createAdminClientMock,
}))

vi.mock('@/lib/leaderboard', () => ({
  getOrganizationLeaderboard: vi.fn(),
  getUserLeaderboardEntry: vi.fn(),
}))

vi.mock('@/lib/training-video-access', () => ({
  getTrainingVideosForOrganization: vi.fn(),
}))

vi.mock('@/data/training-videos', () => ({
  trainingVideos: [],
}))

import { getTenantRequestContext } from './dashboard-access'

const organization = {
  id: 'org-1',
  name: 'Teklogic',
  slug: 'teklogic',
  contest_starts_at: null,
  contest_ends_at: null,
  contest_config: null,
  is_leaderboard_enabled: true,
}

const otherOrganization = {
  ...organization,
  id: 'org-2',
  slug: 'other-org',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getTenantRequestContext', () => {
  it('returns null when no authenticated user exists', async () => {
    createClientMock.mockResolvedValue(
      createSupabaseMock({
        authUser: null,
      })
    )

    const result = await getTenantRequestContext('teklogic')
    expect(result).toBeNull()
  })

  it('redirects to login when user profile is missing', async () => {
    const client = createSupabaseMock({
      authUser: { id: 'user-1', email: 'u@example.com' },
      tables: {
        users: { rows: [] },
        organizations: { rows: [organization] },
      },
    })

    createClientMock.mockResolvedValue(client)
    createAdminClientMock.mockResolvedValue(client)

    const result = await getTenantRequestContext('teklogic')

    expect(result?.redirectTo).toBe('/login')
    expect(result?.redirectReason).toBe('missing_user_profile')
    expect(result?.organization.slug).toBe('teklogic')
  })

  it('redirects to login when user organization cannot be loaded', async () => {
    const client = createSupabaseMock({
      authUser: { id: 'user-1', email: 'u@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-missing',
              role: 'user',
              full_name: 'User',
            },
          ],
        },
        organizations: {
          rows: [organization],
        },
      },
    })

    createClientMock.mockResolvedValue(client)
    createAdminClientMock.mockResolvedValue(
      createSupabaseMock({
        tables: {
          organizations: {
            rows: [organization],
          },
        },
      })
    )

    const result = await getTenantRequestContext('teklogic')

    expect(result?.redirectTo).toBe('/login')
    expect(result?.redirectReason).toBe('missing_user_organization')
    expect(result?.organization.slug).toBe('teklogic')
  })

  it('redirects when user is on the wrong tenant path', async () => {
    const client = createSupabaseMock({
      authUser: { id: 'user-1', email: 'u@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-2',
              role: 'user',
              full_name: 'User',
            },
          ],
        },
        organizations: {
          rows: [otherOrganization],
        },
      },
    })

    createClientMock.mockResolvedValue(client)
    createAdminClientMock.mockResolvedValue(client)

    const result = await getTenantRequestContext('teklogic')

    expect(result?.redirectTo).toBe('/other-org/dashboard')
    expect(result?.redirectReason).toBe('wrong_tenant')
  })

  it('returns active tenant context when user and route organization match', async () => {
    const client = createSupabaseMock({
      authUser: { id: 'user-1', email: 'u@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-1',
              role: 'user',
              full_name: 'User',
            },
          ],
        },
        organizations: {
          rows: [organization],
        },
      },
    })

    createClientMock.mockResolvedValue(client)
    createAdminClientMock.mockResolvedValue(client)

    const result = await getTenantRequestContext('teklogic')

    expect(result?.redirectTo).toBeNull()
    expect(result?.redirectReason).toBeNull()
    expect(result?.organization.slug).toBe('teklogic')
    expect(result?.user.id).toBe('user-1')
  })
})
