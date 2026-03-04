'use client'

import { useActionState } from 'react'
import { updatePassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ActionStateFeedback } from '@/components/ui/action-state-feedback'

export default function AdminProfile() {
    const [state, formAction, isPending] = useActionState(updatePassword, null)
    const feedbackState = state as { error?: string; success?: string | boolean; message?: string } | null

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm Password</Label>
                            <Input
                                type="password"
                                name="confirm_password"
                                id="confirm_password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? 'Updating...' : 'Update Password'}
                        </Button>

                        <ActionStateFeedback
                            error={feedbackState?.error}
                            success={feedbackState?.success}
                            message={feedbackState?.message}
                        />
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
