'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ActionStateFeedbackProps = {
  error?: string | null
  success?: boolean | string | null
  message?: string | null
  className?: string
}

export function ActionStateFeedback({
  error,
  success,
  message,
  className,
}: ActionStateFeedbackProps) {
  const errorText = typeof error === 'string' ? error.trim() : ''
  const successText =
    typeof success === 'string'
      ? success.trim()
      : success
        ? (message ?? '').trim()
        : ''

  if (!errorText && !successText) {
    return null
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {errorText ? (
        <div className="flex items-start gap-2 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      ) : null}
      {successText ? (
        <div className="flex items-start gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successText}</span>
        </div>
      ) : null}
    </div>
  )
}
