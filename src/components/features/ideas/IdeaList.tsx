'use client'

import { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from 'next/link'
import { IdeaDetailModal } from "./IdeaDetailModal"

interface Idea {
    id: string
    title: string
    description: string
    status: 'new' | 'processed'
    created_at: string
    ai_score: number | null
    ai_reframed_text: string | null
    ai_feedback: string | null
    ai_analysis_json: {
        criteria_scores?: Record<string, number | { score: number; reasoning: string }>
        related_suggestions?: (string | { title: string; rationale: string; description: string })[]
        key_benefits?: string[]
        evaluated_at?: string
    } | null
    department?: string | null
    problem_statement?: string | null
    proposed_solution?: string | null
    users?: {
        full_name: string | null
        job_role?: string | null
    }
}

interface IdeaListProps {
    ideas: Idea[]
    clientId: string
}

export function IdeaList({ ideas, clientId }: IdeaListProps) {
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleIdeaClick = (idea: Idea) => {
        if (idea.status === 'processed') {
            setSelectedIdea(idea)
            setIsModalOpen(true)
        }
    }

    if (ideas.length === 0) {
        return (
            <Card className="border-dashed border-2 border-white/10 bg-transparent flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No ideas yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Be the first to submit an automation idea and earn points for your team.
                </p>
                <Link href={`/${clientId}/submit`}>
                    <Button>Submit First Idea</Button>
                </Link>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4">
                {ideas.map((idea) => {
                    const isProcessed = idea.status === 'processed'
                    return (
                        <Card
                            key={idea.id}
                            className={`bg-card/50 border-white/5 transition-colors ${
                                isProcessed
                                    ? 'hover:border-primary/20 cursor-pointer'
                                    : 'opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => handleIdeaClick(idea)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base font-medium text-foreground">
                                        {idea.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {idea.ai_score !== null && (
                                            <Badge variant="outline" className="border-primary/50 text-primary">
                                                Score: {idea.ai_score}
                                            </Badge>
                                        )}
                                        <Badge variant={isProcessed ? 'default' : 'secondary'}>
                                            {isProcessed ? (
                                                'Processed'
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Processing
                                                </span>
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                                <CardDescription className="text-xs">
                                    Submitted on {new Date(idea.created_at).toLocaleDateString()}
                                    {!isProcessed && (
                                        <span className="text-muted-foreground/70 ml-2">
                                            — Click to view once processed
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>

            <IdeaDetailModal
                idea={selectedIdea}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    )
}
