'use client'


import { useActionState } from 'react'
import { updateUser, createUser } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActionStateFeedback } from '@/components/ui/action-state-feedback'

type ActionFeedbackState = {
    message?: string
    error?: string
    success?: string | boolean
}

type UserFormValues = {
    id?: string
    full_name?: string
    email?: string
    job_role?: string
    ai_context?: string
    organization_id?: string
    role?: string
}

type OrganizationOption = {
    id: string
    name: string
}

export default function UserForm({ user, orgs }: { user?: UserFormValues, orgs: OrganizationOption[] }) {
    const isCreating = !user?.id
    const action = isCreating ? createUser : updateUser

    // @ts-expect-error - useActionState type definition mismatch with custom server action return types
    const [state, formAction, isPending] = useActionState(action, null)
    const feedbackState = state as ActionFeedbackState | null

    const defaultValues = user || {}

    return (
        <form action={formAction} className="space-y-6 max-w-2xl">
            {!isCreating && <input type="hidden" name="id" value={user.id} />}

            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Edit personal details and context.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" defaultValue={defaultValues.full_name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            defaultValue={defaultValues.email}
                            disabled={!isCreating}
                            className={!isCreating ? "bg-gray-100" : ""}
                            required
                        />
                        {!isCreating && <p className="text-xs text-gray-400">Email updates currently disabled.</p>}
                    </div>

                    {isCreating && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Set initial password"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="job_role">Job Role / Title</Label>
                        <Input id="job_role" name="job_role" defaultValue={defaultValues.job_role} placeholder="e.g. CTO, Product Manager" />
                        <p className="text-xs text-gray-500">Used by AI to personalize suggestions.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ai_context">AI Context</Label>
                        <Textarea
                            id="ai_context"
                            name="ai_context"
                            defaultValue={defaultValues.ai_context}
                            placeholder="Additional context about this user that influences how AI responds to them. E.g., 'Prefers detailed technical explanations', 'New to automation', 'Very experienced with AI tools', 'Responds well to encouragement'..."
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500">This context helps the AI personalize feedback for this specific user.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-100 bg-red-50/50">
                <CardHeader>
                    <CardTitle className="text-red-700">Permissions & Access</CardTitle>
                    <CardDescription>Dangerous Zone: Manage system access levels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="organization_id">Organization</Label>
                        <Select name="organization_id" defaultValue={defaultValues.organization_id} required>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {orgs.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">System Role</Label>
                        <Select name="role" defaultValue={defaultValues.role || 'user'}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Standard User</SelectItem>
                                <SelectItem value="super_admin">Super Admin (Master)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-600 font-medium">Caution: &apos;Super Admin&apos; gives full system access.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
                <div className="min-w-0 flex-1">
                    <ActionStateFeedback
                        error={feedbackState?.error}
                        success={feedbackState?.success}
                        message={feedbackState?.message}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-32">
                    {isPending ? 'Saving...' : (isCreating ? 'Create User' : 'Save Changes')}
                </Button>
            </div>
        </form>
    )
}
