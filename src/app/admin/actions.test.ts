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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/rate-limiter', () => ({
  rateLimitAction: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn(),
}))

vi.mock('@/lib/training-videos', () => ({
  normalizeTrainingVideo: vi.fn((value) => value),
}))

vi.mock('@/lib/audit-log', () => ({
  writeAdminAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/server-log', () => ({
  errorLog: vi.fn(),
  warnLog: vi.fn(),
}))

import { createInvitation, getAdminAccessState, verifyAdmin } from './actions'

beforeEach(() => {
  vi.clearAllMocks()
  createAdminClientMock.mockResolvedValue(createSupabaseMock())
})

describe('getAdminAccessState', () => {
  it('marks anonymous requests when no auth user exists', async () => {
    createClientMock.mockResolvedValue(
      createSupabaseMock({
        authUser: null,
      })
    )

    await expect(getAdminAccessState()).resolves.toEqual({
      status: 'anonymous',
      userId: null,
    })
  })

  it('marks authenticated non-admin users as unauthorized', async () => {
    createClientMock.mockResolvedValue(
      createSupabaseMock({
        authUser: { id: 'user-1', email: 'user@example.com' },
        tables: {
          users: {
            rows: [
              {
                id: 'user-1',
                role: 'user',
              },
            ],
          },
        },
      })
    )

    await expect(getAdminAccessState()).resolves.toEqual({
      status: 'unauthorized',
      userId: 'user-1',
    })
  })

  it('marks super admins as authorized', async () => {
    createClientMock.mockResolvedValue(
      createSupabaseMock({
        authUser: { id: 'admin-1', email: 'admin@example.com' },
        tables: {
          users: {
            rows: [
              {
                id: 'admin-1',
                role: 'super_admin',
              },
            ],
          },
        },
      })
    )

    await expect(getAdminAccessState()).resolves.toEqual({
      status: 'authorized',
      userId: 'admin-1',
    })
    await expect(verifyAdmin()).resolves.toBe(true)
  })
})

describe('createInvitation', () => {
  it('fails closed for authenticated non-admin users', async () => {
    createClientMock.mockResolvedValue(
      createSupabaseMock({
        authUser: { id: 'user-1', email: 'user@example.com' },
        tables: {
          users: {
            rows: [
              {
                id: 'user-1',
                role: 'user',
              },
            ],
          },
        },
      })
    )

    const formData = new FormData()
    formData.set('email', 'invitee@example.com')
    formData.set('organization_id', 'org-1')
    formData.set('role', 'user')

    await expect(createInvitation(null, formData)).resolves.toEqual({
      error: 'Unauthorized',
    })
  })
})
