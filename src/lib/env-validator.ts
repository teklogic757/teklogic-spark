/**
 * Environment Variable Validation
 * Validates required environment variables at startup to fail fast with clear errors.
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
}

const isProduction = process.env.NODE_ENV === 'production'

const REQUIRED_ENV_VARS: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key for admin operations'
  },
  {
    name: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API key for idea evaluation'
  }
]

const OPTIONAL_ENV_VARS: EnvVar[] = [
  {
    name: 'EMAIL_USER',
    required: false,
    description: 'SMTP email username'
  },
  {
    name: 'EMAIL_PASSWORD',
    required: false,
    description: 'SMTP email password'
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key (alternative email provider)'
  }
]

function validateSiteUrl(siteUrl: string | undefined, missing: string[], warnings: string[], unsafe: string[]) {
  if (!siteUrl) {
    if (isProduction) {
      missing.push('NEXT_PUBLIC_SITE_URL - Canonical site URL for production redirects and email links')
    } else {
      warnings.push('NEXT_PUBLIC_SITE_URL is not set. Email links and absolute redirects may be incorrect outside local development.')
    }

    return
  }

  if (!isProduction) {
    return
  }

  let parsedSiteUrl: URL

  try {
    parsedSiteUrl = new URL(siteUrl)
  } catch {
    unsafe.push('NEXT_PUBLIC_SITE_URL must be a valid absolute URL in production.')
    return
  }

  if (parsedSiteUrl.protocol !== 'https:') {
    unsafe.push('NEXT_PUBLIC_SITE_URL must use https in production.')
  }

  if (parsedSiteUrl.hostname === 'localhost' || parsedSiteUrl.hostname === '127.0.0.1') {
    unsafe.push('NEXT_PUBLIC_SITE_URL must not point to localhost in production.')
  }
}

function validateEmailConfiguration(warnings: string[]) {
  const hasEmailUser = !!process.env.EMAIL_USER
  const hasEmailPassword = !!process.env.EMAIL_PASSWORD
  const hasResendKey = !!process.env.RESEND_API_KEY

  if (!hasEmailUser && !hasEmailPassword && !hasResendKey) {
    warnings.push('No email credentials configured (EMAIL_USER/EMAIL_PASSWORD or RESEND_API_KEY). Email notifications will be disabled.')
  } else if (hasEmailUser !== hasEmailPassword) {
    warnings.push('EMAIL_USER and EMAIL_PASSWORD must both be set for SMTP to work.')
  }
}

export function validateEnv(): void {
  const missing: string[] = []
  const warnings: string[] = []
  const unsafe: string[] = []

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar.name]) {
      missing.push(`${envVar.name} - ${envVar.description}`)
    }
  }

  // Touch optional var metadata so the definitions stay in sync with the documented surface area.
  void OPTIONAL_ENV_VARS

  validateEmailConfiguration(warnings)
  validateSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, missing, warnings, unsafe)

  if (process.env.TEST_EMAIL_OVERRIDE) {
    if (isProduction) {
      unsafe.push('TEST_EMAIL_OVERRIDE must be unset in production so live users receive their own emails.')
    } else {
      warnings.push('TEST_EMAIL_OVERRIDE is enabled. All outbound email will be rerouted to the override address.')
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\nEnvironment Configuration Warnings:')
    warnings.forEach(w => console.warn(`   - ${w}`))
    console.warn('')
  }

  if (unsafe.length > 0) {
    console.error('\nUnsafe environment configuration:')
    unsafe.forEach(issue => console.error(`   - ${issue}`))
    console.error('')
  }

  // Fail fast on missing required vars
  if (missing.length > 0) {
    console.error('\nMissing required environment variables:')
    missing.forEach(m => console.error(`   - ${m}`))
    console.error('\nPlease set these variables in your .env.local file.\n')

    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missing.map(m => m.split(' - ')[0]).join(', ')}`)
    }
  }

  if (unsafe.length > 0 && isProduction) {
    throw new Error(`Unsafe production environment configuration: ${unsafe.join(' | ')}`)
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv()
}
