'use client'

import { useActionState } from 'react'
import { createInvitation } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionStateFeedback } from '@/components/ui/action-state-feedback'

type OrganizationOption = {
  id: string
  name: string
}

export default function InviteForm({ organizations }: { organizations: OrganizationOption[] }) {
  const [state, formAction, isPending] = useActionState(createInvitation, null)
  const feedbackState = state as { error?: string; success?: string | boolean; message?: string } | null

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
      <div>
        <Label htmlFor="organization">Organization</Label>
        <select
          name="organization_id"
          id="organization"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Select an Organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input type="email" name="email" id="email" placeholder="colleague@example.com" required />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Generating Invite...' : 'Generate Invite Link'}
      </Button>

      <ActionStateFeedback
        error={feedbackState?.error}
        success={feedbackState?.success}
        message={feedbackState?.message}
      />
    </form>
  )
}
