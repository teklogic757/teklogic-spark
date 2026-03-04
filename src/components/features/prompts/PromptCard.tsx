'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

export type Prompt = {
    id: number
    title: string
    category: string
    tags: string[]
    prompt: string
}

type PromptCardProps = {
    prompt: Prompt
    featured?: boolean
}

export function PromptCard({ prompt, featured = false }: PromptCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(prompt.prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const truncatedPrompt = prompt.prompt.length > 200
        ? prompt.prompt.slice(0, 200) + '...'
        : prompt.prompt

    return (
        <Card
            className={`
                border-white/10 bg-slate-900/60 hover:bg-slate-800/70 transition-all cursor-pointer shadow-lg
                ${featured ? 'ring-1 ring-purple-500/40 bg-gradient-to-br from-purple-500/10 to-slate-900/60' : ''}
            `}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <CardContent className="p-5 space-y-3">
                {/* Header - horizontal layout */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-medium text-white text-base leading-snug">{prompt.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary border-0 text-xs"
                            >
                                {prompt.category}
                            </Badge>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Prompt Preview/Full */}
                <p className="text-sm text-slate-400 leading-relaxed">
                    {isExpanded ? prompt.prompt : truncatedPrompt}
                </p>

                {/* Tags */}
                {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {prompt.tags.slice(0, isExpanded ? undefined : 3).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-slate-500"
                            >
                                {tag}
                            </span>
                        ))}
                        {!isExpanded && prompt.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-slate-600">
                                +{prompt.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Expand indicator */}
                {prompt.prompt.length > 200 && (
                    <div className="flex justify-center pt-1">
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
