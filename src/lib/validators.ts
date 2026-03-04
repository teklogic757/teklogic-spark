/**
 * Zod Validation Schemas
 * Type-safe validation for all user inputs following security best practices.
 */

import { z } from 'zod'
import { parseYouTube } from '@/lib/training-videos'

// =============================================================================
// Common Validators
// =============================================================================

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .toLowerCase()
  .trim()

export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format (use #RRGGBB)')
  .optional()
  .nullable()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim()

// =============================================================================
// Idea Submission
// =============================================================================

export const IDEA_TITLE_MIN_LENGTH = 10
export const IDEA_TITLE_MAX_LENGTH = 200
export const IDEA_DEPARTMENT_MIN_LENGTH = 2
export const IDEA_DEPARTMENT_MAX_LENGTH = 100
export const IDEA_PROBLEM_MIN_LENGTH = 30
export const IDEA_PROBLEM_MAX_LENGTH = 5000
export const IDEA_SOLUTION_MIN_LENGTH = 30
export const IDEA_SOLUTION_MAX_LENGTH = 5000
export const IDEA_DESCRIPTION_MAX_LENGTH = 10000

export const IdeaSubmissionSchema = z.object({
  title: z
    .string()
    .min(IDEA_TITLE_MIN_LENGTH, `Title must be at least ${IDEA_TITLE_MIN_LENGTH} characters`)
    .max(IDEA_TITLE_MAX_LENGTH, `Title must be less than ${IDEA_TITLE_MAX_LENGTH} characters`)
    .trim(),
  department: z
    .string()
    .min(IDEA_DEPARTMENT_MIN_LENGTH, `Department must be at least ${IDEA_DEPARTMENT_MIN_LENGTH} characters`)
    .max(IDEA_DEPARTMENT_MAX_LENGTH, `Department must be less than ${IDEA_DEPARTMENT_MAX_LENGTH} characters`)
    .trim(),
  problem_statement: z
    .string()
    .min(IDEA_PROBLEM_MIN_LENGTH, `Problem statement must be at least ${IDEA_PROBLEM_MIN_LENGTH} characters`)
    .max(IDEA_PROBLEM_MAX_LENGTH, `Problem statement must be less than ${IDEA_PROBLEM_MAX_LENGTH} characters`)
    .trim(),
  proposed_solution: z
    .string()
    .min(IDEA_SOLUTION_MIN_LENGTH, `Proposed solution must be at least ${IDEA_SOLUTION_MIN_LENGTH} characters`)
    .max(IDEA_SOLUTION_MAX_LENGTH, `Proposed solution must be less than ${IDEA_SOLUTION_MAX_LENGTH} characters`)
    .trim(),
  description: z
    .string()
    .max(IDEA_DESCRIPTION_MAX_LENGTH, `Description must be less than ${IDEA_DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .nullable(),
  client_id: z
    .string()
    .min(1, 'Organization ID is required')
    .max(100, 'Invalid organization ID')
    .trim(),
})

export type IdeaSubmission = z.infer<typeof IdeaSubmissionSchema>

// =============================================================================
// Organization Management
// =============================================================================

export const RoleSchema = z.enum(['user', 'super_admin'], {
  message: 'Role must be either "user" or "super_admin"'
})

export const OrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),
  domain: z
    .string()
    .max(253, 'Domain too long')
    .optional()
    .nullable(),
  industry: z
    .string()
    .max(100, 'Industry must be less than 100 characters')
    .optional()
    .nullable(),
  brand_voice: z
    .string()
    .max(500, 'Brand voice must be less than 500 characters')
    .optional()
    .nullable(),
  annual_it_budget: z
    .string()
    .max(50, 'Budget must be less than 50 characters')
    .optional()
    .nullable(),
  estimated_revenue: z
    .string()
    .max(50, 'Revenue must be less than 50 characters')
    .optional()
    .nullable(),
  marketing_strategy: z
    .string()
    .max(2000, 'Marketing strategy must be less than 2000 characters')
    .optional()
    .nullable(),
  employee_count: z
    .string()
    .max(50, 'Employee count must be less than 50 characters')
    .optional()
    .nullable(),
  color_primary: hexColorSchema,
  color_secondary: hexColorSchema,
})

export type OrganizationInput = z.infer<typeof OrganizationSchema>

// =============================================================================
// User Management
// =============================================================================

export const CreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  organization_id: uuidSchema,
  role: RoleSchema.optional().default('user'),
  job_role: z
    .string()
    .max(100, 'Job role must be less than 100 characters')
    .optional()
    .nullable(),
  ai_context: z
    .string()
    .max(2000, 'AI context must be less than 2000 characters')
    .optional()
    .nullable(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

// =============================================================================
// Invitation
// =============================================================================

export const InvitationSchema = z.object({
  email: emailSchema,
  organization_id: uuidSchema,
  role: RoleSchema.optional().default('user'),
})

export type InvitationInput = z.infer<typeof InvitationSchema>

// =============================================================================
// Login / Search
// =============================================================================

export const LoginQuerySchema = z
  .string()
  .min(2, 'Search query must be at least 2 characters')
  .max(100, 'Search query too long')
  .trim()

// =============================================================================
// Join / Signup
// =============================================================================

export const SignupSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  password: passwordSchema,
  full_name: nameSchema,
})

export type SignupInput = z.infer<typeof SignupSchema>

// =============================================================================
// Contest Settings
// =============================================================================

export const ContestSettingsSchema = z.object({
  contest_enabled: z.boolean().optional(),
  contest_starts_at: z.string().datetime().optional().nullable(),
  contest_ends_at: z.string().datetime().optional().nullable(),
  contest_title: z
    .string()
    .max(200, 'Contest title must be less than 200 characters')
    .optional()
    .nullable(),
  contest_description: z
    .string()
    .max(2000, 'Contest description must be less than 2000 characters')
    .optional()
    .nullable(),
  contest_first_prize: z
    .string()
    .max(200, 'Prize description must be less than 200 characters')
    .optional()
    .nullable(),
  contest_second_prize: z
    .string()
    .max(200, 'Prize description must be less than 200 characters')
    .optional()
    .nullable(),
})

export type ContestSettings = z.infer<typeof ContestSettingsSchema>

// =============================================================================
// Training Video Management
// =============================================================================

export const trainingVideoTitleSchema = z
  .string()
  .min(3, 'Video title must be at least 3 characters')
  .max(200, 'Video title must be less than 200 characters')
  .trim()

export const trainingVideoUrlSchema = z
  .string()
  .url('A valid URL is required')
  .trim()
  .refine(value => parseYouTube(value) !== null, 'Only standard YouTube video URLs are supported')

export const TrainingVideoCreateSchema = z.object({
  title: trainingVideoTitleSchema,
  url: trainingVideoUrlSchema,
})

export const TrainingVideoDeleteSchema = z.object({
  id: uuidSchema,
})

export type TrainingVideoCreateInput = z.infer<typeof TrainingVideoCreateSchema>
export type TrainingVideoDeleteInput = z.infer<typeof TrainingVideoDeleteSchema>

// =============================================================================
// File Upload Validation
// =============================================================================

export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',                                                    // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',                                              // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',     // .xlsx
  // Text
  'text/plain',     // .txt
  'text/csv',       // .csv
  'text/markdown',  // .md
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: images, PDF, Word, Excel, text files.'
    }
  }

  // Check for suspicious file extensions (double extensions, etc.)
  const fileName = file.name.toLowerCase()
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.dll']
  if (dangerousExtensions.some(ext => fileName.includes(ext))) {
    return {
      valid: false,
      error: 'File type not allowed for security reasons.'
    }
  }

  return { valid: true }
}

// =============================================================================
// Helper: Validate and return typed result or error
// =============================================================================

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || 'Validation failed'
    }
  }

  return { success: true, data: result.data }
}
