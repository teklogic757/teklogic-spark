import { getConfiguredSiteUrl, LOCAL_SITE_URL } from './env-policy.mjs'
import {
  buildAbsoluteAppUrl,
  getCanonicalSiteOrigin,
  normalizeRelativeAppPath,
} from './site-url'

const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard'

type ResolveAuthRedirectOptions = {
  allowExternalOrigins?: string[]
  fallbackPath?: string
  request?: Request | URL | string
}

type ResolvedAuthRedirect = {
  destination: string
  isExternal: boolean
  normalizedTarget: string
  rejectedReason: string | null
}

function getClientBaseUrl(currentOrigin?: string) {
  const configuredSiteUrl = getConfiguredSiteUrl()
  if (configuredSiteUrl) {
    return configuredSiteUrl
  }

  if (currentOrigin) {
    return new URL(currentOrigin)
  }

  return new URL(LOCAL_SITE_URL)
}

export function buildAuthCallbackUrl(options: {
  currentOrigin?: string
  next?: string | null
} = {}) {
  const callbackUrl = new URL('/auth/callback', getClientBaseUrl(options.currentOrigin))
  const nextPath = normalizeRelativeAppPath(options.next, '')

  if (nextPath) {
    callbackUrl.searchParams.set('next', nextPath)
  }

  return callbackUrl.toString()
}

export function resolveAuthRedirect(
  rawTarget: string | null | undefined,
  options: ResolveAuthRedirectOptions = {}
): ResolvedAuthRedirect {
  const fallbackPath = normalizeRelativeAppPath(
    options.fallbackPath,
    DEFAULT_AUTH_REDIRECT_PATH
  )
  const trimmedTarget = rawTarget?.trim()

  if (!trimmedTarget) {
    return {
      destination: buildAbsoluteAppUrl(fallbackPath, { request: options.request }),
      isExternal: false,
      normalizedTarget: fallbackPath,
      rejectedReason: null,
    }
  }

  const relativeTarget = normalizeRelativeAppPath(trimmedTarget, '')
  if (relativeTarget) {
    return {
      destination: buildAbsoluteAppUrl(relativeTarget, { request: options.request }),
      isExternal: false,
      normalizedTarget: relativeTarget,
      rejectedReason: null,
    }
  }

  try {
    const parsedTarget = new URL(trimmedTarget)
    const canonicalOrigin = getCanonicalSiteOrigin({ request: options.request })

    if (parsedTarget.origin === canonicalOrigin) {
      const normalizedTarget = `${parsedTarget.pathname}${parsedTarget.search}${parsedTarget.hash}`
      return {
        destination: buildAbsoluteAppUrl(normalizedTarget, { request: options.request }),
        isExternal: false,
        normalizedTarget,
        rejectedReason: null,
      }
    }

    if (options.allowExternalOrigins?.includes(parsedTarget.origin)) {
      return {
        destination: parsedTarget.toString(),
        isExternal: true,
        normalizedTarget: parsedTarget.toString(),
        rejectedReason: null,
      }
    }

    return {
      destination: buildAbsoluteAppUrl(fallbackPath, { request: options.request }),
      isExternal: false,
      normalizedTarget: fallbackPath,
      rejectedReason: 'external_origin_not_allowlisted',
    }
  } catch {
    return {
      destination: buildAbsoluteAppUrl(fallbackPath, { request: options.request }),
      isExternal: false,
      normalizedTarget: fallbackPath,
      rejectedReason: 'invalid_redirect_target',
    }
  }
}
