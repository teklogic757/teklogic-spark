'use client'

import { useActionState, useState } from 'react'
import { updateOrganization, createOrganization } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ActionStateFeedback } from '@/components/ui/action-state-feedback'
import { Trophy, Gift, Calendar } from 'lucide-react'

type ActionFeedbackState = {
    message?: string
    error?: string
    success?: string | boolean
}

type ContestPrize = {
    description?: string
}

type ContestConfig = {
    is_active?: boolean
    title?: string
    description?: string
    prizes?: ContestPrize[]
}

type BrandColors = {
    primary?: string
    secondary?: string
}

type OrganizationFormValues = {
    id?: string
    name?: string
    domain?: string
    industry?: string
    marketing_strategy?: string
    brand_voice?: string
    annual_it_budget?: string
    estimated_revenue?: string
    employee_count?: string
    color_primary?: string
    color_secondary?: string
    contest_starts_at?: string | null
    contest_ends_at?: string | null
    brand_colors?: string | BrandColors
    contest_config?: ContestConfig
}

export default function OrganizationForm({ org }: { org?: OrganizationFormValues }) {
    const isCreating = !org?.id
    const action = isCreating ? createOrganization : updateOrganization

    // Initial state matching the server action return type
    const initialState = { message: '', error: '', success: '' }

    // @ts-expect-error - useActionState type definition mismatch with custom server action return types
    const [state, formAction, isPending] = useActionState(action, initialState)
    const feedbackState = state as ActionFeedbackState

    const brandColors: BrandColors =
        typeof org?.brand_colors === 'string'
            ? JSON.parse(org.brand_colors) as BrandColors
            : typeof org?.brand_colors === 'object' && org.brand_colors
                ? org.brand_colors
                : { primary: '#000000', secondary: '#ffffff' }

    // Contest settings state
    const hasExistingContest = Boolean(org?.contest_config?.is_active)
    const [contestEnabled, setContestEnabled] = useState(hasExistingContest)

    // Parse existing contest config
    const existingContestConfig = org?.contest_config || {}

    // Format dates for datetime-local input
    const formatDateForInput = (dateStr?: string | null) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    }

    const defaultValues = org || {}

    return (
        <form action={formAction} className="space-y-8 max-w-4xl">
            {!isCreating && <input type="hidden" name="id" value={org.id} />}



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Core Identity */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Identity</CardTitle>
                        <CardDescription>Core identifiers used for url and login.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input id="name" name="name" defaultValue={defaultValues.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input id="domain" name="domain" defaultValue={defaultValues.domain} placeholder="company.com" />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Context: Market & Strategy */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Market & Strategy</CardTitle>
                        <CardDescription>High-level business context for the AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" name="industry" defaultValue={defaultValues.industry} placeholder="e.g. Fintech, Healthcare" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="marketing_strategy">Target Demographic</Label>
                            <Textarea
                                id="marketing_strategy"
                                name="marketing_strategy"
                                defaultValue={defaultValues.marketing_strategy}
                                placeholder="Who is your customer? Describe who the company sells to..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Context: Voice & Brand */}
                <Card className="md:col-span-2 h-fit">
                    <CardHeader>
                        <CardTitle>Voice & Brand</CardTitle>
                        <CardDescription>Define how the AI should &quot;sound&quot; and understand the brand.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand_voice">Brand Voice</Label>
                                <Textarea
                                    id="brand_voice"
                                    name="brand_voice"
                                    defaultValue={defaultValues.brand_voice}
                                    placeholder="e.g. Professional, Witty, Authoritative..."
                                    className="min-h-[120px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="color_primary">Primary Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            id="color_primary"
                                            name="color_primary"
                                            defaultValue={brandColors.primary}
                                            className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            defaultValue={brandColors.primary}
                                            className="uppercase font-mono"
                                            readOnly // For now just display
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color_secondary">Secondary Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            id="color_secondary"
                                            name="color_secondary"
                                            defaultValue={brandColors.secondary}
                                            className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            defaultValue={brandColors.secondary}
                                            className="uppercase font-mono"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="annual_it_budget">Annual IT Budget</Label>
                                <Select name="annual_it_budget" defaultValue={defaultValues.annual_it_budget}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="< $100k">&lt; $100k</SelectItem>
                                        <SelectItem value="$100k - $500k">$100k - $500k</SelectItem>
                                        <SelectItem value="$500k - $1M">$500k - $1M</SelectItem>
                                        <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                                        <SelectItem value="$5M+">$5M+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimated_revenue">Estimated Revenue</Label>
                                <Select name="estimated_revenue" defaultValue={defaultValues.estimated_revenue}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="< $1M">&lt; $1M</SelectItem>
                                        <SelectItem value="$1M - $10M">$1M - $10M</SelectItem>
                                        <SelectItem value="$10M - $50M">$10M - $50M</SelectItem>
                                        <SelectItem value="$50M+">$50M+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employee_count">Employee Count</Label>
                                <Select name="employee_count" defaultValue={defaultValues.employee_count}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-10">1-10</SelectItem>
                                        <SelectItem value="11-50">11-50</SelectItem>
                                        <SelectItem value="51-200">51-200</SelectItem>
                                        <SelectItem value="201-500">201-500</SelectItem>
                                        <SelectItem value="500+">500+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contest Settings */}
                <Card className="md:col-span-2 h-fit">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <CardTitle>Contest Settings</CardTitle>
                                    <CardDescription>Configure idea submission contests with prizes for top contributors.</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="contest_enabled" className="text-sm text-muted-foreground">
                                    {contestEnabled ? 'Contest Active' : 'Contest Disabled'}
                                </Label>
                                <Switch
                                    id="contest_enabled"
                                    checked={contestEnabled}
                                    onCheckedChange={setContestEnabled}
                                />
                                <input type="hidden" name="contest_enabled" value={contestEnabled ? 'true' : 'false'} />
                            </div>
                        </div>
                    </CardHeader>
                    {contestEnabled && (
                        <CardContent className="space-y-6">
                            {/* Contest Title & Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contest_title">Contest Title</Label>
                                    <Input
                                        id="contest_title"
                                        name="contest_title"
                                        defaultValue={existingContestConfig.title || 'Spark AI Innovation Challenge'}
                                        placeholder="e.g. Q1 Innovation Challenge"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contest_description">Description</Label>
                                    <Input
                                        id="contest_description"
                                        name="contest_description"
                                        defaultValue={existingContestConfig.description || ''}
                                        placeholder="Submit your best ideas and compete for prizes!"
                                    />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Timeline</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contest_starts_at">Start Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            id="contest_starts_at"
                                            name="contest_starts_at"
                                            defaultValue={formatDateForInput(org?.contest_starts_at)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contest_ends_at">End Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            id="contest_ends_at"
                                            name="contest_ends_at"
                                            defaultValue={formatDateForInput(org?.contest_ends_at)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Prizes */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Gift className="h-4 w-4 text-green-500" />
                                    <span>Prizes</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contest_first_prize">1st Place Prize</Label>
                                        <Input
                                            id="contest_first_prize"
                                            name="contest_first_prize"
                                            defaultValue={existingContestConfig.prizes?.[0]?.description || '$100 Amazon Gift Card'}
                                            placeholder="e.g. $100 Amazon Gift Card"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contest_second_prize">2nd Place Prize</Label>
                                        <Input
                                            id="contest_second_prize"
                                            name="contest_second_prize"
                                            defaultValue={existingContestConfig.prizes?.[1]?.description || '$50 Amazon Gift Card'}
                                            placeholder="e.g. $50 Amazon Gift Card"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                When a contest is active, a countdown timer will appear in the dashboard header. Users can click it to view contest details, prizes, and rules.
                            </p>
                        </CardContent>
                    )}
                </Card>
            </div>

            <div className="flex items-center justify-end gap-4">
                <div className="min-w-0 flex-1">
                    <ActionStateFeedback
                        error={feedbackState?.error}
                        success={feedbackState?.success}
                        message={feedbackState?.message}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-32">
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
