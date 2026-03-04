import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyContestDigests } from '@/lib/contest-digest'

function extractSecret(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i)

  return (
    request.headers.get('x-cron-secret') ||
    bearerMatch?.[1] ||
    request.nextUrl.searchParams.get('secret')
  )
}

async function handleContestDigest(request: NextRequest) {
  const configuredSecret = process.env.CONTEST_DIGEST_CRON_SECRET || process.env.CRON_SECRET

  if (!configuredSecret) {
    return NextResponse.json(
      { error: 'Contest digest cron secret is not configured' },
      { status: 503 }
    )
  }

  if (extractSecret(request) !== configuredSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const summary = await sendWeeklyContestDigests()

    return NextResponse.json({
      ok: true,
      ...summary,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleContestDigest(request)
}

export async function POST(request: NextRequest) {
  return handleContestDigest(request)
}
