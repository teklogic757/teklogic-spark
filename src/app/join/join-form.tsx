'use client'

import { useActionState } from 'react'
import { signupWithInvite } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function JoinForm({ invite, token }: { invite: any, token: string }) {
    const [state, formAction, isPending] = useActionState(signupWithInvite, null)

    return (
        <form action={formAction} className="space-y-4 max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Join {invite.organization_name}</h2>
                <p className="text-gray-500">Create your account to get started.</p>
            </div>

            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    value={invite.email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">Your email is linked to this invitation.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input type="text" name="full_name" required placeholder="John Doe" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input type="password" name="password" required minLength={8} placeholder="••••••••" />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating Account...' : 'Create Account'}
            </Button>

            {state?.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {state.error}
                </div>
            )}
        </form>
    )
}
