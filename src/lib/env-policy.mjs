export const LOCAL_SITE_URL = 'http://localhost:3000'

const REQUIRED_ENV_VARS = [
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anonymous/public key'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role key for admin operations'],
  ['OPENAI_API_KEY', 'OpenAI API key for idea evaluation'],
]

const OPTIONAL_ENV_VARS = [
  ['EMAIL_USER', 'SMTP email username'],
  ['EMAIL_PASSWORD', 'SMTP email password'],
  ['RESEND_API_KEY', 'Resend API key (alternative email provider)'],
]

const LOCAL_ONLY_OVERRIDE_VARS = ['TEST_EMAIL_OVERRIDE', 'EMAIL_TO']
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

export function getVercelDeploymentEnvironment(env = process.env) {
  return env.VERCEL_ENV?.trim().toLowerCase() || null
}

export function isPreviewEnvironment(env = process.env) {
  return getVercelDeploymentEnvironment(env) === 'preview'
}

export function isProductionEnvironment(env = process.env) {
  const vercelEnvironment = getVercelDeploymentEnvironment(env)
  if (vercelEnvironment) {
    return vercelEnvironment === 'production'
  }

  return env.NODE_ENV === 'production'
}

export function isProductionLikeValidation(env = process.env, mode = 'runtime') {
  return mode === 'deploy' || isProductionEnvironment(env)
}

export function isLocalHostname(hostname) {
  return LOCAL_HOSTNAMES.has(String(hostname || '').toLowerCase())
}

export function getConfiguredSiteUrl(env = process.env) {
  const rawValue = env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!rawValue) {
    const previewHost = env.VERCEL_URL?.trim()
    if (isPreviewEnvironment(env) && previewHost) {
      try {
        return new URL(`https://${previewHost}`)
      } catch {
        return null
      }
    }

    return null
  }

  try {
    return new URL(rawValue)
  } catch {
    return null
  }
}

export function getNotificationProvider(env = process.env) {
  return env.NOTIFICATION_PROVIDER || env.EMAIL_PROVIDER || 'smtp'
}

function validateSiteUrl(env, mode, missing, warnings, unsafe) {
  const productionLike = isProductionLikeValidation(env, mode)
  const rawSiteUrl = env.NEXT_PUBLIC_SITE_URL?.trim()
  const configuredSiteUrl = getConfiguredSiteUrl(env)

  if (!rawSiteUrl) {
    if (mode === 'runtime' && configuredSiteUrl && isPreviewEnvironment(env)) {
      warnings.push('NEXT_PUBLIC_SITE_URL is not set. Runtime code will use the Vercel preview URL until a production hostname is configured.')
      return
    }

    if (productionLike) {
      missing.push('NEXT_PUBLIC_SITE_URL - Canonical site URL for production redirects and email links')
    } else {
      warnings.push('NEXT_PUBLIC_SITE_URL is not set. Runtime code will fall back to localhost only in local development.')
    }
    return
  }

  if (!configuredSiteUrl) {
    unsafe.push('NEXT_PUBLIC_SITE_URL must be a valid absolute URL.')
    return
  }

  if (!productionLike) {
    return
  }

  if (configuredSiteUrl.protocol !== 'https:') {
    unsafe.push('NEXT_PUBLIC_SITE_URL must use https in production.')
  }

  if (isLocalHostname(configuredSiteUrl.hostname)) {
    unsafe.push('NEXT_PUBLIC_SITE_URL must not point to localhost in production.')
  }
}

function validateEmailConfiguration(env, warnings) {
  const provider = getNotificationProvider(env)
  const hasEmailUser = Boolean(env.EMAIL_USER)
  const hasEmailPassword = Boolean(env.EMAIL_PASSWORD)
  const hasResendKey = Boolean(env.RESEND_API_KEY)

  if (!hasEmailUser && !hasEmailPassword && !hasResendKey) {
    warnings.push('No email credentials configured (EMAIL_USER/EMAIL_PASSWORD or RESEND_API_KEY). Email notifications will be disabled.')
  } else if (hasEmailUser !== hasEmailPassword) {
    warnings.push('EMAIL_USER and EMAIL_PASSWORD must both be set for SMTP to work.')
  }

  if (!['smtp', 'resend'].includes(provider)) {
    warnings.push(`Unknown notification provider "${provider}". Expected "smtp" or "resend".`)
  }
}

function validateLocalOnlyOverrides(env, mode, warnings, unsafe) {
  const productionLike = isProductionLikeValidation(env, mode)

  for (const envVar of LOCAL_ONLY_OVERRIDE_VARS) {
    if (!env[envVar]) {
      continue
    }

    if (productionLike) {
      unsafe.push(`${envVar} must be unset in production because it is a local-only override.`)
    } else {
      warnings.push(`${envVar} is enabled. This should stay limited to local development and testing.`)
    }
  }
}

export function collectEnvValidationIssues(env = process.env, mode = 'runtime') {
  const missing = []
  const warnings = []
  const unsafe = []

  for (const [name, description] of REQUIRED_ENV_VARS) {
    if (!env[name]) {
      missing.push(`${name} - ${description}`)
    }
  }

  void OPTIONAL_ENV_VARS

  validateEmailConfiguration(env, warnings)
  validateSiteUrl(env, mode, missing, warnings, unsafe)
  validateLocalOnlyOverrides(env, mode, warnings, unsafe)

  if (env.NEXT_PUBLIC_URL) {
    warnings.push('NEXT_PUBLIC_URL is deprecated and ignored. Use NEXT_PUBLIC_SITE_URL instead.')
  }

  return {
    missing,
    warnings,
    unsafe,
    provider: getNotificationProvider(env),
  }
}
