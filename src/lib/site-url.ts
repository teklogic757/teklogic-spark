import { getConfiguredSiteUrl, isProductionEnvironment, LOCAL_SITE_URL } from './env-policy.mjs'

type ResolveSiteUrlOptions = {
  env?: NodeJS.ProcessEnv
  request?: Request | URL | string
}

function toUrl(request?: Request | URL | string): URL | null {
  if (!request) {
    return null
  }

  if (request instanceof URL) {
    return request
  }

  if (typeof request === 'string') {
    return new URL(request)
  }

  return new URL(request.url)
}

export function normalizeRelativeAppPath(pathname: string | null | undefined, fallback = '/'): string {
  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return fallback
  }

  return pathname
}

export function getCanonicalSiteUrl(options: ResolveSiteUrlOptions = {}): URL {
  const env = options.env ?? process.env
  const configuredSiteUrl = getConfiguredSiteUrl(env)

  if (configuredSiteUrl) {
    return configuredSiteUrl
  }

  if (isProductionEnvironment(env)) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for production-safe absolute URLs.')
  }

  const requestUrl = toUrl(options.request)
  if (requestUrl) {
    return new URL(requestUrl.origin)
  }

  return new URL(LOCAL_SITE_URL)
}

export function getCanonicalSiteOrigin(options: ResolveSiteUrlOptions = {}): string {
  return getCanonicalSiteUrl(options).origin
}

export function buildAbsoluteAppUrl(
  pathname: string,
  options: ResolveSiteUrlOptions = {}
): string {
  const safePathname = normalizeRelativeAppPath(pathname, '/')
  return new URL(safePathname, getCanonicalSiteUrl(options)).toString()
}
