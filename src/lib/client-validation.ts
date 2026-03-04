import {
  ALLOWED_FILE_TYPES,
  IDEA_DEPARTMENT_MAX_LENGTH,
  IDEA_DEPARTMENT_MIN_LENGTH,
  IDEA_DESCRIPTION_MAX_LENGTH,
  IDEA_PROBLEM_MAX_LENGTH,
  IDEA_PROBLEM_MIN_LENGTH,
  IDEA_SOLUTION_MAX_LENGTH,
  IDEA_SOLUTION_MIN_LENGTH,
  IDEA_TITLE_MAX_LENGTH,
  IDEA_TITLE_MIN_LENGTH,
  MAX_FILE_SIZE,
} from '@/lib/validators'

export type IdeaFieldName =
  | 'title'
  | 'department'
  | 'problem_statement'
  | 'proposed_solution'
  | 'description'

const FIELD_RULES: Record<IdeaFieldName, { min?: number; max: number; label: string; required: boolean }> = {
  title: { label: 'Title', min: IDEA_TITLE_MIN_LENGTH, max: IDEA_TITLE_MAX_LENGTH, required: true },
  department: { label: 'Department', min: IDEA_DEPARTMENT_MIN_LENGTH, max: IDEA_DEPARTMENT_MAX_LENGTH, required: true },
  problem_statement: { label: 'Problem statement', min: IDEA_PROBLEM_MIN_LENGTH, max: IDEA_PROBLEM_MAX_LENGTH, required: true },
  proposed_solution: { label: 'Proposed solution', min: IDEA_SOLUTION_MIN_LENGTH, max: IDEA_SOLUTION_MAX_LENGTH, required: true },
  description: { label: 'Additional context', max: IDEA_DESCRIPTION_MAX_LENGTH, required: false },
}

export function validateIdeaField(name: IdeaFieldName, value: string) {
  const rules = FIELD_RULES[name]
  const normalized = value.trim()

  if (rules.required && !normalized) {
    return `${rules.label} is required.`
  }

  if (!normalized) {
    return ''
  }

  if (rules.min && normalized.length < rules.min) {
    return `${rules.label} must be at least ${rules.min} characters.`
  }

  if (normalized.length > rules.max) {
    return `${rules.label} must be less than ${rules.max} characters.`
  }

  return ''
}

export function validateIdeaFile(file: File | null | undefined) {
  if (!file) {
    return ''
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
    return 'Invalid file type. Allowed: images, PDF, Word, Excel, text files.'
  }

  const fileName = file.name.toLowerCase()
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.dll']

  if (dangerousExtensions.some((ext) => fileName.includes(ext))) {
    return 'File type not allowed for security reasons.'
  }

  return ''
}

export function getIdeaFileRules() {
  return {
    maxSizeMb: Math.round(MAX_FILE_SIZE / 1024 / 1024),
    accepts: 'PDF, Word, Excel, images, TXT, CSV, and Markdown files',
  }
}
