'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PromptCard, type Prompt } from '@/components/features/prompts/PromptCard'
import {
    Search,
    ArrowLeft,
    Shuffle,
    Star,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react'

type PromptsData = {
    categories: string[]
    prompts: Prompt[]
}

const ITEMS_PER_PAGE = 10

export default function PromptsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const clientId = params.client_id as string
    const initialQuery = searchParams.get('q') || ''

    const [data, setData] = useState<PromptsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Sync search query with URL params
    useEffect(() => {
        const q = searchParams.get('q') || ''
        if (q !== searchQuery) {
            setSearchQuery(q)
        }
    }, [searchParams])

    // Load prompts data
    useEffect(() => {
        fetch('/data/prompts.json')
            .then(res => res.json())
            .then((d: PromptsData) => {
                setData(d)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load prompts:', err)
                setLoading(false)
            })
    }, [])

    // Filter prompts based on search and category
    const filteredPrompts = useMemo(() => {
        if (!data) return []

        let results = data.prompts

        // Filter by category
        if (selectedCategory) {
            results = results.filter(p => p.category === selectedCategory)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            results = results.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.tags.some(t => t.toLowerCase().includes(query)) ||
                p.prompt.toLowerCase().includes(query)
            )
        }

        return results
    }, [data, searchQuery, selectedCategory])

    // Pagination
    const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE)
    const paginatedPrompts = filteredPrompts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    // Prompt of the Day (deterministic based on date)
    const promptOfTheDay = useMemo(() => {
        if (!data || data.prompts.length === 0) return null
        const today = new Date()
        const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
        )
        return data.prompts[dayOfYear % data.prompts.length]
    }, [data])

    // Random prompt handler
    const [randomPrompt, setRandomPrompt] = useState<Prompt | null>(null)

    const handleRandomPrompt = () => {
        if (!data) return
        const randomIndex = Math.floor(Math.random() * data.prompts.length)
        setRandomPrompt(data.prompts[randomIndex])
        // Scroll to top to see it
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-[#00080D] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-slate-400">Loading prompts...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex min-h-screen flex-col bg-[#00080D] items-center justify-center">
                <p className="text-slate-400">Failed to load prompts</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#00080D]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#00080D]/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/${clientId}/dashboard`} className="relative h-10 w-48 transition-opacity hover:opacity-90">
                            <Image
                                src="/logo.svg"
                                alt="Teklogic Spark AI"
                                fill
                                className="object-contain object-left mix-blend-screen"
                                priority
                            />
                        </Link>
                        <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium text-white hidden md:block">Prompt Hub</span>
                        </div>
                    </div>

                    <Link href={`/${clientId}/dashboard`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto flex-1 p-4 md:p-8 space-y-6">
                {/* Page Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Prompt Hub</h1>
                        <p className="text-slate-400">
                            {data.prompts.length.toLocaleString()} curated AI prompts to boost your workflow
                        </p>
                    </div>
                    <Button
                        onClick={handleRandomPrompt}
                        variant="outline"
                        className="border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                    >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Random Prompt
                    </Button>
                </div>

                {/* Random Prompt Display */}
                {randomPrompt && (
                    <div className="relative">
                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Random Pick
                        </div>
                        <PromptCard prompt={randomPrompt} featured />
                    </div>
                )}

                {/* Prompt of the Day */}
                {promptOfTheDay && !randomPrompt && (
                    <div className="relative">
                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Prompt of the Day
                        </div>
                        <PromptCard prompt={promptOfTheDay} featured />
                    </div>
                )}

                {/* Search and Filters */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search prompts by title, tags, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={selectedCategory === null ? "default" : "secondary"}
                            className={`cursor-pointer transition-colors ${selectedCategory === null
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All ({data.prompts.length})
                        </Badge>
                        {data.categories.map(category => {
                            const count = data.prompts.filter(p => p.category === category).length
                            return (
                                <Badge
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "secondary"}
                                    className={`cursor-pointer transition-colors ${selectedCategory === category
                                            ? 'bg-primary text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category} ({count})
                                </Badge>
                            )
                        })}
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-slate-500">
                    Showing {paginatedPrompts.length} of {filteredPrompts.length} prompts
                    {selectedCategory && ` in "${selectedCategory}"`}
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>

                {/* Prompts Grid */}
                {paginatedPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paginatedPrompts.map(prompt => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No prompts found matching your criteria</p>
                        <Button
                            variant="link"
                            className="text-primary mt-2"
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory(null)
                            }}
                        >
                            Clear filters
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="text-slate-400 hover:text-white disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-slate-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="text-slate-400 hover:text-white disabled:opacity-30"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
