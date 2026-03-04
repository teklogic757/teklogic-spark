'use client'

import { useActionState, useRef, useState, type FormEvent } from 'react'
import { submitIdea } from '@/app/[client_id]/submit/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2, Send, Upload, Lightbulb, AlertCircle, CheckCircle2, FileText, X } from 'lucide-react'
import { VoiceRecorder } from '@/components/voice-recorder'
import { getIdeaFileRules, validateIdeaField, validateIdeaFile, type IdeaFieldName } from '@/lib/client-validation'

const initialState = {
  error: '',
}

const FILE_RULES = getIdeaFileRules()
type VoiceTranscriptionPayload = Partial<Record<'title' | 'department' | 'problem_statement' | 'proposed_solution' | 'description', string>>

export function SubmitIdeaForm({ clientId, isGuest = false }: { clientId: string, isGuest?: boolean }) {
  const [state, formAction, isPending] = useActionState(submitIdea, initialState)
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    problem_statement: '',
    proposed_solution: '',
    description: '',
    guest_name: '',
    guest_email: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<IdeaFieldName, string>>>({})
  const [formError, setFormError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateField = (name: IdeaFieldName, value: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateIdeaField(name, value),
    }))
  }

  const handleTranscription = (data: VoiceTranscriptionPayload) => {
    setFormData((prev) => {
      const nextData = {
        ...prev,
        title: data.title || prev.title,
        department: data.department || prev.department,
        problem_statement: data.problem_statement || prev.problem_statement,
        proposed_solution: data.proposed_solution || prev.proposed_solution,
        description: data.description || prev.description,
      }

      ;(['title', 'department', 'problem_statement', 'proposed_solution', 'description'] as IdeaFieldName[]).forEach((fieldName) => {
        validateField(fieldName, nextData[fieldName])
      })

      return nextData
    })
    setFormError('')
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'title' || name === 'department' || name === 'problem_statement' || name === 'proposed_solution' || name === 'description') {
      validateField(name, value)
    }

    setFormError('')
  }

  const handleBlur = (name: IdeaFieldName) => {
    validateField(name, formData[name])
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    const nextFileError = validateIdeaFile(file)

    if (nextFileError) {
      setSelectedFile(null)
      setFileError(nextFileError)
      setFormError(nextFileError)
      event.target.value = ''
      return
    }

    setSelectedFile(file)
    setFileError('')
    setFormError('')
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const nextFieldErrors: Partial<Record<IdeaFieldName, string>> = {
      title: validateIdeaField('title', formData.title),
      department: validateIdeaField('department', formData.department),
      problem_statement: validateIdeaField('problem_statement', formData.problem_statement),
      proposed_solution: validateIdeaField('proposed_solution', formData.proposed_solution),
      description: validateIdeaField('description', formData.description),
    }

    const nextFileError = validateIdeaFile(selectedFile)
    const firstFieldError = (Object.values(nextFieldErrors).find(Boolean) ?? '') as string
    const nextFormError = nextFileError || firstFieldError

    setFieldErrors(nextFieldErrors)
    setFileError(nextFileError)
    setFormError(nextFormError)

    if (nextFormError) {
      event.preventDefault()
    }
  }

  const visibleError = state?.error || formError

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Card className="border-white/10 bg-black/40 shadow-2xl backdrop-blur-md ring-1 ring-white/5">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Submit Your AI Idea</CardTitle>
            <CardDescription className="mt-1 text-slate-400">
              Share your automation concept and let our AI evaluate its potential impact.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="mb-2 px-6">
        <VoiceRecorder onTranscriptionComplete={handleTranscription} />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/40 px-2 text-slate-500 backdrop-blur-md">Or type manually</span>
          </div>
        </div>
      </div>

      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="client_id" value={clientId} />
        <CardContent className="space-y-6">
          {isGuest ? (
            <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg border border-primary/10 bg-primary/5 p-4 md:grid-cols-2">
              <div className="col-span-full">
                <h3 className="mb-1 text-sm font-medium text-primary">Guest Information (Optional)</h3>
                <p className="text-xs text-slate-400">Let us know who you are so we can follow up.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_name" className="text-sm font-medium text-slate-200">
                  Your Name
                </Label>
                <Input
                  id="guest_name"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="h-10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_email" className="text-sm font-medium text-slate-200">
                  Your Email
                </Label>
                <Input
                  id="guest_email"
                  name="guest_email"
                  type="email"
                  value={formData.guest_email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="h-10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium text-slate-200">
              Idea Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              placeholder="e.g., Automate Customer Onboarding Emails"
              className="h-11 bg-white/5 text-white placeholder:text-slate-600"
              required
              minLength={10}
              maxLength={200}
            />
            <p className="text-xs text-slate-500">A clear, concise title for your idea (10-200 characters)</p>
            {fieldErrors.title ? <p className="text-xs text-red-400">{fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="font-medium text-slate-200">
              Department <span className="text-red-400">*</span>
            </Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={() => handleBlur('department')}
              placeholder="e.g., Sales, Marketing, Operations, Customer Service"
              className="h-11 bg-white/5 text-white placeholder:text-slate-600"
              required
              minLength={2}
            />
            <p className="text-xs text-slate-500">Which department or team will this idea benefit?</p>
            {fieldErrors.department ? <p className="text-xs text-red-400">{fieldErrors.department}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_statement" className="font-medium text-slate-200">
              What Problem Does This Solve? <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="problem_statement"
              name="problem_statement"
              value={formData.problem_statement}
              onChange={handleChange}
              onBlur={() => handleBlur('problem_statement')}
              placeholder="Describe the specific problem, pain point, or inefficiency this idea addresses. What's the current challenge?"
              className="min-h-[100px] resize-y bg-white/5 text-white placeholder:text-slate-600"
              required
              minLength={30}
            />
            <p className="text-xs text-slate-500">Be specific about the current problem or opportunity (minimum 30 characters)</p>
            {fieldErrors.problem_statement ? <p className="text-xs text-red-400">{fieldErrors.problem_statement}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposed_solution" className="font-medium text-slate-200">
              What&apos;s Possible? <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="proposed_solution"
              name="proposed_solution"
              value={formData.proposed_solution}
              onChange={handleChange}
              onBlur={() => handleBlur('proposed_solution')}
              placeholder="Describe your proposed solution. What could be automated? How might it work? What tools or approaches could be used?"
              className="min-h-[120px] resize-y bg-white/5 text-white placeholder:text-slate-600"
              required
              minLength={30}
            />
            <p className="text-xs text-slate-500">Share your vision for how this could be implemented (minimum 30 characters)</p>
            {fieldErrors.proposed_solution ? <p className="text-xs text-red-400">{fieldErrors.proposed_solution}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-slate-200">
              Additional Context <span className="text-xs text-slate-400">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              placeholder="Any additional details, expected benefits, potential challenges, or context that would help evaluate this idea..."
              className="min-h-[100px] resize-y bg-white/5 text-white placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500">Optional: Add any extra information that provides more context</p>
            {fieldErrors.description ? <p className="text-xs text-red-400">{fieldErrors.description}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment" className="font-medium text-slate-200">
              Supporting Documents <span className="text-xs text-slate-400">(Encouraged)</span>
            </Label>
            <Input
              ref={fileInputRef}
              id="attachment"
              name="attachment"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleFileChange}
              className="h-11 cursor-pointer bg-white/5 text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-medium file:text-primary hover:file:bg-primary/20"
            />

            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                Attachment Rules
              </div>
              <ul className="space-y-1 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  {fileError ? <AlertCircle className="h-3.5 w-3.5 text-red-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  <span>Maximum file size: {FILE_RULES.maxSizeMb}MB</span>
                </li>
                <li className="flex items-center gap-2">
                  {fileError ? <AlertCircle className="h-3.5 w-3.5 text-red-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  <span>{FILE_RULES.accepts}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Select a different file any time to replace the current upload.</span>
                </li>
              </ul>
            </div>

            {selectedFile ? (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3" data-selected-file>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-white/10 bg-transparent text-slate-200 hover:bg-white/10"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {fileError ? <p className="text-xs text-red-400">{fileError}</p> : null}

            <Textarea
              id="attachment_description"
              name="attachment_description"
              placeholder="Briefly describe the attached file(s). E.g., 'Current process flowchart', 'Sample data spreadsheet', 'Screenshot of error message'..."
              className="min-h-[60px] bg-white/5 text-sm placeholder:text-slate-500"
              maxLength={500}
            />
            <div className="flex items-start gap-2 rounded-md border border-primary/10 bg-primary/5 p-3">
              <Upload className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-slate-400">
                <span className="font-medium text-primary">Pro tip:</span> Upload screenshots, diagrams, process docs, or examples to strengthen your submission.
              </p>
            </div>
          </div>

          {visibleError ? (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <strong>Error:</strong> {visibleError}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            <span className="text-red-400">*</span> Required fields
          </p>
          <div className="flex flex-col items-end gap-2">
            <Button
              type="submit"
              className="h-11 min-w-[160px] bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Submit for AI Review
                </>
              )}
            </Button>
            {isPending ? (
              <p className="text-xs text-slate-400">Processing your submission and preparing the redirect...</p>
            ) : null}
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
