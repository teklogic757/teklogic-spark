import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseMock } from '@/test/mocks/supabase'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  rateLimitAction: vi.fn(),
  getClientIpRateLimitIdentifier: vi.fn(),
  buildScopedRateLimitIdentifier: vi.fn(),
  evaluateIdea: vi.fn(),
  generateEvaluationEmail: vi.fn(),
  sendEvaluationEmail: vi.fn(),
  sendAdminNotification: vi.fn(),
  summarizeEmailResult: vi.fn(),
  cookies: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createAdminClient: mocks.createAdminClient,
}))

vi.mock('@/lib/rate-limiter', () => ({
  rateLimitAction: mocks.rateLimitAction,
  getClientIpRateLimitIdentifier: mocks.getClientIpRateLimitIdentifier,
  buildScopedRateLimitIdentifier: mocks.buildScopedRateLimitIdentifier,
}))

vi.mock('@/lib/ai-evaluator', () => ({
  evaluateIdea: mocks.evaluateIdea,
  generateEvaluationEmail: mocks.generateEvaluationEmail,
}))

vi.mock('@/lib/email', () => ({
  sendEvaluationEmail: mocks.sendEvaluationEmail,
  sendAdminNotification: mocks.sendAdminNotification,
  summarizeEmailResult: mocks.summarizeEmailResult,
}))

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}))

vi.mock('@/lib/server-log', () => ({
  errorLog: vi.fn(),
  warnLog: vi.fn(),
}))

import { submitIdeaFlow } from './submit-flow'

function createValidFormData() {
  const formData = new FormData()
  formData.set('title', 'Improve team onboarding with AI copilots')
  formData.set('department', 'Operations')
  formData.set('problem_statement', 'New employees spend too much time searching internal systems and repeated guidance.')
  formData.set('proposed_solution', 'Provide a role-aware AI assistant with curated docs and workflow prompts.')
  formData.set('description', 'Initial pilot in support and HR.')
  formData.set('client_id', 'teklogic')
  return formData
}

function mockDefaultExternalServices() {
  mocks.rateLimitAction.mockResolvedValue(null)
  mocks.getClientIpRateLimitIdentifier.mockResolvedValue('127.0.0.1')
  mocks.buildScopedRateLimitIdentifier.mockReturnValue('workshop:org-1:127.0.0.1')
  mocks.cookies.mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
  })

  mocks.evaluateIdea.mockResolvedValue({
    overall_score: 82,
    reframed_idea: {
      title: 'AI Copilot for Onboarding',
      description: 'Role-aware assistant for onboarding',
      key_benefits: ['Faster ramp', 'Lower support load', 'Consistent onboarding'],
    },
    criteria_scores: [],
    related_suggestions: [],
    canonical_score_details: null,
    model_overall_score: 82,
    evaluation_summary: 'Strong fit for onboarding workflows.',
  })
  mocks.generateEvaluationEmail.mockReturnValue('<html>evaluation</html>')
  mocks.sendEvaluationEmail.mockResolvedValue({ status: 'delivered' })
  mocks.sendAdminNotification.mockResolvedValue({ status: 'delivered' })
  mocks.summarizeEmailResult.mockReturnValue('ok')
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDefaultExternalServices()
})

describe('submitIdeaFlow', () => {
  it('persists an authenticated submission successfully', async () => {
    const insertedPayloads: unknown[] = []

    const userClient = createSupabaseMock({
      authUser: { id: 'user-1', email: 'user@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-1',
              full_name: 'Alex User',
              job_role: 'Analyst',
              ai_context: '',
              total_points: 10,
            },
          ],
        },
      },
    })

    const adminClient = createSupabaseMock({
      tables: {
        organizations: {
          rows: [
            {
              id: 'org-1',
              slug: 'teklogic',
              name: 'Teklogic',
              industry: null,
              brand_voice: null,
              marketing_strategy: null,
              annual_it_budget: null,
              estimated_revenue: null,
              employee_count: null,
            },
          ],
        },
        ideas: {
          insert: (payload) => {
            insertedPayloads.push(payload)
            return { data: null, error: null }
          },
        },
        users: {
          rows: [{ email: 'admin@teklogic.net', organization_id: 'org-1', role: 'super_admin' }],
        },
      },
    })

    mocks.createClient.mockResolvedValue(userClient)
    mocks.createAdminClient.mockResolvedValue(adminClient)

    const result = await submitIdeaFlow(createValidFormData(), 'desktop')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.organizationSlug).toBe('teklogic')
    }
    expect(insertedPayloads).toHaveLength(1)
  })

  it('blocks guest submission when no workshop context is present', async () => {
    const userClient = createSupabaseMock({
      authUser: null,
    })

    mocks.createClient.mockResolvedValue(userClient)
    mocks.createAdminClient.mockResolvedValue(createSupabaseMock())
    mocks.cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
      set: vi.fn(),
    })

    const result = await submitIdeaFlow(createValidFormData(), 'desktop')

    expect(result).toEqual({
      ok: false,
      error: 'You must be logged in to submit an idea.',
    })
  })

  it('returns a stable error when persistence fails', async () => {
    const userClient = createSupabaseMock({
      authUser: { id: 'user-1', email: 'user@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-1',
              full_name: 'Alex User',
              job_role: 'Analyst',
              ai_context: '',
              total_points: 10,
            },
          ],
        },
      },
    })

    const adminClient = createSupabaseMock({
      tables: {
        organizations: {
          rows: [
            {
              id: 'org-1',
              slug: 'teklogic',
              name: 'Teklogic',
              industry: null,
              brand_voice: null,
              marketing_strategy: null,
              annual_it_budget: null,
              estimated_revenue: null,
              employee_count: null,
            },
          ],
        },
        ideas: {
          insert: () => ({ data: null, error: { message: 'insert failed' } }),
        },
      },
    })

    mocks.createClient.mockResolvedValue(userClient)
    mocks.createAdminClient.mockResolvedValue(adminClient)

    const result = await submitIdeaFlow(createValidFormData(), 'desktop')

    expect(result).toEqual({
      ok: false,
      error: 'Failed to submit idea. Please try again.',
    })
  })

  it('keeps success when post-persist email side effects fail', async () => {
    const userClient = createSupabaseMock({
      authUser: { id: 'user-1', email: 'user@example.com' },
      tables: {
        users: {
          rows: [
            {
              id: 'user-1',
              organization_id: 'org-1',
              full_name: 'Alex User',
              job_role: 'Analyst',
              ai_context: '',
              total_points: 10,
            },
          ],
        },
      },
    })

    const adminClient = createSupabaseMock({
      tables: {
        organizations: {
          rows: [
            {
              id: 'org-1',
              slug: 'teklogic',
              name: 'Teklogic',
              industry: null,
              brand_voice: null,
              marketing_strategy: null,
              annual_it_budget: null,
              estimated_revenue: null,
              employee_count: null,
            },
          ],
        },
        ideas: {
          insert: () => ({ data: null, error: null }),
        },
        users: {
          rows: [{ email: 'admin@teklogic.net', organization_id: 'org-1', role: 'super_admin' }],
        },
      },
    })

    mocks.createClient.mockResolvedValue(userClient)
    mocks.createAdminClient.mockResolvedValue(adminClient)
    mocks.sendEvaluationEmail.mockRejectedValue(new Error('smtp outage'))
    mocks.sendAdminNotification.mockRejectedValue(new Error('webhook timeout'))

    const result = await submitIdeaFlow(createValidFormData(), 'desktop')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.postPersistOutcomes.some((outcome) => outcome.status === 'failed')).toBe(true)
    }
  })
})
