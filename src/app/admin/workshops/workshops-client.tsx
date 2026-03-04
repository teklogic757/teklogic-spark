'use client'

import { useActionState } from 'react'
import { generateWorkshopCode, toggleCodeStatus } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ActionStateFeedback } from '@/components/ui/action-state-feedback'
import { Loader2, Plus, QrCode, Power, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

type WorkshopCode = {
    id: string
    code: string
    name: string
    is_active: boolean
}

export default function WorkshopsPage({
    codes,
    baseUrl
}: {
    codes: WorkshopCode[],
    baseUrl: string
}) {
    // Separate form component to handle state properly? Or just inline it.
    // Let's inline for simplicity of this artifact, but normally would separate.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Workshop Access</h1>
                    <p className="text-slate-400">Manage QR codes for instant workshop login.</p>
                </div>
            </div>

            <CreateCodeForm />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {codes.map((code) => (
                    <WorkshopCard key={code.id} code={code} baseUrl={baseUrl} />
                ))}
            </div>

            {codes.length === 0 && (
                <div className="text-center p-12 bg-white/5 rounded-lg border border-white/10">
                    <QrCode className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No Active Workshops</h3>
                    <p className="text-slate-400">Create a code to get started.</p>
                </div>
            )}
        </div>
    )
}

function CreateCodeForm() {
    const [state, formAction, isPending] = useActionState(generateWorkshopCode, null)
    const feedbackState = state as { error?: string; success?: string | boolean; message?: string } | null

    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="text-lg">Generate New Code</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="flex gap-4">
                    <Input
                        name="name"
                        placeholder="Workshop Name (e.g. Feb 2026 Strategy)"
                        className="bg-black/20 border-white/10"
                        required
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </form>
                <ActionStateFeedback
                    className="mt-3"
                    error={feedbackState?.error}
                    success={feedbackState?.success}
                    message={feedbackState?.message}
                />
            </CardContent>
        </Card>
    )
}

function WorkshopCard({ code, baseUrl }: { code: WorkshopCode, baseUrl: string }) {
    const joinUrl = `${baseUrl}/join?code=${code.code}`

    const copyLink = () => {
        navigator.clipboard.writeText(joinUrl)
        toast.success("Link copied!")
    }

    const toggleStatus = async () => {
        const res = await toggleCodeStatus(code.id, !code.is_active)
        if (res?.error) toast.error(res.error)
    }

    return (
        <Card className={`border-white/10 bg-black/40 ${!code.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-white text-lg">{code.name}</CardTitle>
                        <CardDescription className="font-mono text-primary text-md">Code: {code.code}</CardDescription>
                    </div>
                    <div className="bg-white p-2 rounded-md">
                        <QRCodeSVG value={joinUrl} size={80} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={copyLink} className="w-full justify-start text-xs border-white/10 hover:bg-white/10">
                        <Copy className="mr-2 h-3 w-3" /> Copy Join Link
                    </Button>
                    <Button
                        variant={code.is_active ? "destructive" : "secondary"}
                        size="sm"
                        onClick={toggleStatus}
                        className="w-full justify-start text-xs"
                    >
                        <Power className="mr-2 h-3 w-3" /> {code.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 text-center break-all">{joinUrl}</p>
            </CardContent>
        </Card>
    )
}
