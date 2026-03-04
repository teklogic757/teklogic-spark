'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { submitIdeaMobile } from './actions'
import { DesktopToggle } from '@/components/mobile/DesktopToggle'
import { validateIdeaField } from '@/lib/client-validation'

const DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Operations',
  'Finance',
  'Human Resources',
  'IT / Technology',
  'Customer Service',
  'Product',
  'Engineering',
  'Legal',
  'Other',
] as const

type MobileFormField = 'title' | 'department' | 'problem_statement' | 'proposed_solution'

export default function MobileSubmitPage() {
  const params = useParams()
  const clientId = params.client_id as string

  const [state, formAction, isPending] = useActionState(submitIdeaMobile, null)
  const [formValues, setFormValues] = useState<Record<MobileFormField, string>>({
    title: '',
    department: '',
    problem_statement: '',
    proposed_solution: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<MobileFormField, string>>>({})
  const [formError, setFormError] = useState('')

  const updateField = (name: MobileFormField, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateIdeaField(name, value),
    }))
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const nextErrors: Partial<Record<MobileFormField, string>> = {
      title: validateIdeaField('title', formValues.title),
      department: validateIdeaField('department', formValues.department),
      problem_statement: validateIdeaField('problem_statement', formValues.problem_statement),
      proposed_solution: validateIdeaField('proposed_solution', formValues.proposed_solution),
    }

    const nextFormError = (Object.values(nextErrors).find(Boolean) ?? '') as string

    setFieldErrors(nextErrors)
    setFormError(nextFormError)

    if (nextFormError) {
      event.preventDefault()
    }
  }

  const visibleError = state?.error || formError

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#00080D]">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href={`/${clientId}/m/`} className="flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="relative h-6 w-24">
            <Image
              src="/logo.svg"
              alt="Teklogic"
              fill
              className="object-contain"
            />
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-white">Submit Your Idea</h1>

        {visibleError ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-400">{visibleError}</p>
          </div>
        ) : null}

        <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="department" value={formValues.department} />

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Idea Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={(event) => updateField('title', event.target.value)}
              onBlur={(event) => updateField('title', event.target.value)}
              placeholder="Give your idea a clear, descriptive name"
              required
              minLength={10}
              maxLength={200}
              className="h-12 bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldErrors.title ? <p className="text-xs text-red-400">{fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-white">
              Department <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formValues.department}
              onValueChange={(value) => updateField('department', value)}
            >
              <SelectTrigger className="h-12 w-full bg-white/5 text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.department ? <p className="text-xs text-red-400">{fieldErrors.department}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_statement" className="text-white">
              What problem does this solve? <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="problem_statement"
              name="problem_statement"
              value={formValues.problem_statement}
              onChange={(event) => updateField('problem_statement', event.target.value)}
              onBlur={(event) => updateField('problem_statement', event.target.value)}
              placeholder="Describe the pain point or inefficiency you've identified..."
              required
              minLength={30}
              rows={4}
              className="resize-none bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldErrors.problem_statement ? <p className="text-xs text-red-400">{fieldErrors.problem_statement}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposed_solution" className="text-white">
              Your proposed solution <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="proposed_solution"
              name="proposed_solution"
              value={formValues.proposed_solution}
              onChange={(event) => updateField('proposed_solution', event.target.value)}
              onBlur={(event) => updateField('proposed_solution', event.target.value)}
              placeholder="How would you solve this? What could be automated?"
              required
              minLength={30}
              rows={4}
              className="resize-none bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldErrors.proposed_solution ? <p className="text-xs text-red-400">{fieldErrors.proposed_solution}</p> : null}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full bg-primary text-base hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Idea'
            )}
          </Button>
          {isPending ? (
            <p className="text-center text-xs text-slate-400">Processing your submission and opening the success screen...</p>
          ) : null}
        </form>
      </main>

      <footer className="border-t border-white/5 bg-[#00080D]">
        <div className="flex justify-center">
          <DesktopToggle clientId={clientId} />
        </div>
      </footer>
    </div>
  )
}
