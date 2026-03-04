'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { joinWorkshop } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'

function JoinWorkshopForm() {
    const searchParams = useSearchParams()
    const codeParam = searchParams.get('code')

    const [state, formAction, isPending] = useActionState(joinWorkshop, null)

    return (
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-fit rounded-full bg-primary/20 p-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-white">Join Workshop</CardTitle>
                <CardDescription>Enter your access code to start submitting ideas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            name="code"
                            placeholder="ENTER CODE"
                            defaultValue={codeParam || ''}
                            className="h-14 bg-black/40 text-center text-2xl tracking-widest uppercase"
                            maxLength={6}
                            required
                        />
                    </div>

                    <Button type="submit" className="h-12 w-full text-lg" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 animate-spin" /> : 'Enter Workshop'}
                    </Button>

                    {state?.error ? (
                        <p className="rounded border border-red-500/20 bg-red-500/10 p-2 text-center text-sm text-red-400">
                            {state.error}
                        </p>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    )
}

export default function JoinPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Suspense fallback={<div className="text-sm text-slate-400">Loading workshop access...</div>}>
                <JoinWorkshopForm />
            </Suspense>
        </div>
    )
}
