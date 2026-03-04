'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Sparkles } from 'lucide-react'
import Link from 'next/link'

type PromptQuickSearchProps = {
    clientId: string
}

export function PromptQuickSearch({ clientId }: PromptQuickSearchProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/${clientId}/prompts?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            router.push(`/${clientId}/prompts`)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Link href={`/${clientId}/prompts`}>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Prompts
                </Button>
            </Link>
            <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 h-9 pl-8 pr-2 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:w-52 transition-all"
                />
            </form>
        </div>
    )
}
