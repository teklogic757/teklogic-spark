'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, ArrowRight, Copy, Check, Loader2, Search } from "lucide-react"

type Prompt = {
    id: number
    title: string
    category: string
    tags: string[]
    prompt: string
}

type PromptsData = {
    categories: string[]
    prompts: Prompt[]
}

type PromptHubTeaserProps = {
    clientId: string
}

export function PromptHubTeaser({ clientId }: PromptHubTeaserProps) {
    const router = useRouter()
    const [data, setData] = useState<PromptsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Load prompts data
    useEffect(() => {
        fetch('/data/prompts.json')
            .then(res => res.json())
            .then((d: PromptsData) => {
                setData(d)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // Prompt of the Day (deterministic based on date)
    const promptOfTheDay = useMemo(() => {
        if (!data || data.prompts.length === 0) return null
        const today = new Date()
        const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
        )
        return data.prompts[dayOfYear % data.prompts.length]
    }, [data])

    const handleCopy = async () => {
        if (!promptOfTheDay) return
        await navigator.clipboard.writeText(promptOfTheDay.prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/${clientId}/prompts?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            router.push(`/${clientId}/prompts`)
        }
    }

    return (
        <Card className="bg-card border-white/5 relative overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10">
                            <MessageSquare className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-white">Prompt Hub</CardTitle>
                            <CardDescription className="text-slate-400">
                                {data ? `${data.prompts.length.toLocaleString()} curated AI prompts` : 'AI prompts to boost your workflow'}
                            </CardDescription>
                        </div>
                    </div>
                    <Link href={`/${clientId}/prompts`}>
                        <Badge
                            variant="outline"
                            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                        >
                            Browse All
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Badge>
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Search Box */}
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-20 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            Search
                        </Button>
                    </div>
                </form>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    </div>
                ) : promptOfTheDay ? (
                    <>
                        {/* Prompt of the Day */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 via-primary/5 to-transparent border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                                        Prompt of the Day
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-slate-400 hover:text-white hover:bg-white/10"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                            <span className="text-xs text-green-500">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                                            <span className="text-xs">Copy Prompt</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <h3 className="font-semibold text-white text-lg mb-2">{promptOfTheDay.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                                {promptOfTheDay.prompt}
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                                    {promptOfTheDay.category}
                                </Badge>
                                {promptOfTheDay.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-xs text-slate-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="text-xl font-bold text-white">
                                    {data?.prompts.length.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-500">Prompts</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="text-xl font-bold text-white">
                                    {data?.categories.length}
                                </div>
                                <div className="text-xs text-slate-500">Categories</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="text-xl font-bold text-primary">
                                    Free
                                </div>
                                <div className="text-xs text-slate-500">Forever</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 text-slate-500">
                        Unable to load prompts
                    </div>
                )}

                {/* Browse Link */}
                <Link href={`/${clientId}/prompts`} className="block">
                    <Button
                        variant="outline"
                        className="w-full h-11 border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                        Explore All Prompts
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
