'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { buildAuthCallbackUrl } from '@/lib/auth-redirect'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isMagicLink, setIsMagicLink] = useState(false)
    const params = useParams()
    const router = useRouter()
    const clientId = params.client_id as string

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        // Robust access to form data, ensuring browser autofill works correctly
        const formData = new FormData(e.currentTarget)
        const emailInput = formData.get('email') as string
        const passwordInput = formData.get('password') as string

        const supabase = createClient()
        const redirectUrl = buildAuthCallbackUrl({
            currentOrigin: window.location.origin,
            next: `/${clientId}/dashboard`,
        })

        if (isMagicLink || !passwordInput) {
            // Magic Link Logic
            // Sends an email with a secure link to sign in.
            // Useful for users who forgot passwords or prefer passwordless.
            const { error } = await supabase.auth.signInWithOtp({
                email: emailInput,
                options: {
                    emailRedirectTo: redirectUrl,
                },
            })

            if (error) {
                toast.error('Error sending magic link', { description: error.message })
            } else {
                toast.success('Check your email', { description: 'We sent you a magic link to sign in.' })
            }
        } else {
            // Standard Password Authentication
            // Authenticates against Supabase Auth.
            // On success, client-side router pushes to dashboard.
            // Middleware establishes the session cookies.
            const { error } = await supabase.auth.signInWithPassword({
                email: emailInput,
                password: passwordInput,
            })

            if (error) {
                toast.error('Login failed', { description: error.message })
            } else {
                router.push(`/${clientId}/dashboard`)
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#00080D] p-4 text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="relative w-64 h-24 mb-6">
                        <Image
                            src="/logo.svg"
                            alt="Teklogic Spark AI"
                            fill
                            className="object-contain mix-blend-screen"
                            priority
                        />
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm">
                        <p className="text-xs font-semibold text-primary tracking-widest uppercase">
                            {clientId.replace('-', ' ')} Portal
                        </p>
                    </div>
                </div>

                <Card className="border-white/10 bg-black/40 shadow-2xl backdrop-blur-md ring-1 ring-white/5">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-xl font-medium text-white">Sign In</CardTitle>
                        <CardDescription className="text-slate-400">
                            Access your dashboard securely.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-slate-300 uppercase tracking-wider">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all font-light"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {!isMagicLink && (
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-medium text-slate-300 uppercase tracking-wider">Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all font-light"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_-5px_var(--color-primary)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <span className="flex items-center">
                                        {isMagicLink ? 'Send Magic Link' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button
                            variant="link"
                            className="text-slate-400 hover:text-white text-xs"
                            onClick={() => setIsMagicLink(!isMagicLink)}
                        >
                            {isMagicLink ? 'Sign in with Password instead' : 'Forgot password? Sign in with Magic Link'}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
