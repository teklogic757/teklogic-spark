import 'server-only'

type RedditSearchOptions = {
  title: string
  department?: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  resourceTopics?: string[]
  maxLinks?: number
}

export interface RedditLinkResult {
  title: string
  url: string
  source: 'Reddit'
}

type RedditApiListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string
        permalink?: string
        over_18?: boolean
      }
    }>
  }
}

function buildSearchQueries(options: RedditSearchOptions): string[] {
  const generated = [
    options.title,
    options.proposedSolution,
    options.problemStatement,
    options.department,
    ...(options.resourceTopics ?? []),
  ]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .map((value) => value.trim())

  return [...new Set(generated)].slice(0, 5)
}

async function searchReddit(query: string): Promise<RedditLinkResult[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const endpoint = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=5`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'teklogic-spark-ai/1.0',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as RedditApiListing
    const children = payload.data?.children ?? []

    return children
      .map((child) => child.data)
      .filter((post): post is NonNullable<typeof post> => Boolean(post && post.title && post.permalink))
      .filter((post) => !post.over_18)
      .map((post) => ({
        title: post.title as string,
        url: `https://www.reddit.com${post.permalink as string}`,
        source: 'Reddit' as const,
      }))
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export async function findRelevantRedditLinks(options: RedditSearchOptions): Promise<RedditLinkResult[]> {
  const queries = buildSearchQueries(options)
  const allResults = await Promise.all(queries.map((query) => searchReddit(query)))
  const flattened = allResults.flat()

  const deduped = new Map<string, RedditLinkResult>()
  for (const result of flattened) {
    if (!deduped.has(result.url)) {
      deduped.set(result.url, result)
    }
  }

  return Array.from(deduped.values()).slice(0, options.maxLinks ?? 5)
}
