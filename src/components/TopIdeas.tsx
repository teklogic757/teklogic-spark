'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { IdeaDetailModal } from "@/components/features/ideas/IdeaDetailModal"

type Idea = {
    id: string
    title: string
    description: string
    ai_score: number | null
    status: 'new' | 'processed'
    created_at: string
    department?: string | null
    problem_statement?: string | null
    proposed_solution?: string | null
    ai_reframed_text: string | null
    ai_feedback: string | null
    ai_analysis_json: {
        criteria_scores?: Record<string, number | { score: number; reasoning: string }>
        related_suggestions?: (string | { title: string; rationale: string; description: string })[]
        key_benefits?: string[]
        evaluated_at?: string
    } | null
    users?: {
        full_name: string | null
        job_role?: string | null
    }
}

const COLLAPSED_COUNT = 5
const PAGE_SIZE = 10

export function TopIdeas({ ideas }: { ideas: Idea[] }) {
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const handleIdeaClick = (idea: Idea) => {
        setSelectedIdea(idea)
        setIsModalOpen(true)
    }

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded)
        setCurrentPage(1)
    }

    // Calculate which ideas to display
    const totalIdeas = ideas.length
    const totalPages = Math.ceil(totalIdeas / PAGE_SIZE)

    let displayedIdeas: Idea[]
    let startIndex: number

    if (!isExpanded) {
        // Collapsed: show top 5
        displayedIdeas = ideas.slice(0, COLLAPSED_COUNT)
        startIndex = 0
    } else {
        // Expanded: paginate at 10 per page
        startIndex = (currentPage - 1) * PAGE_SIZE
        displayedIdeas = ideas.slice(startIndex, startIndex + PAGE_SIZE)
    }

    const hasMoreThanCollapsed = totalIdeas > COLLAPSED_COUNT

    if (!ideas || ideas.length === 0) {
        return (
            <Card className="col-span-1 md:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Rated Ideas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No ideas rated yet. Be the first!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="col-span-1 md:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Rated Ideas
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex flex-col">
                        <AnimatePresence mode="wait">
                            {displayedIdeas.map((idea, index) => {
                                const globalIndex = startIndex + index
                                return (
                                    <motion.div
                                        key={idea.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`
                                            flex items-center justify-between p-4 transition-all cursor-pointer
                                            hover:bg-primary/5 border-l-2 border-transparent hover:border-l-primary
                                            ${index !== displayedIdeas.length - 1 ? 'border-b border-border/50' : ''}
                                        `}
                                        onClick={() => handleIdeaClick(idea)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm
                                                ${globalIndex === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    globalIndex === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                                                        globalIndex === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-muted text-muted-foreground'}
                                            `}>
                                                #{globalIndex + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none text-foreground">{idea.title}</p>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="line-clamp-1 text-xs text-muted-foreground max-w-[250px] sm:max-w-md">
                                                        {idea.description}
                                                    </p>
                                                    <p className="text-[10px] text-primary/70">
                                                        by {idea.users?.full_name || 'Anonymous'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge variant={
                                                idea.status === 'processed' ? 'default' : 'secondary'
                                            } className="hidden sm:inline-flex capitalize">
                                                {idea.status === 'processed' ? 'Processed' : 'New'}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 min-w-[3rem] justify-end font-semibold text-primary">
                                                <span className="text-xs text-muted-foreground mr-1">Score:</span>
                                                <span>{idea.ai_score || 0}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </CardContent>

                {/* Footer with View All / Collapse and Pagination */}
                {(hasMoreThanCollapsed || isExpanded) && (
                    <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleExpand}
                            className="text-primary hover:text-primary/80"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    View All ({totalIdeas})
                                </>
                            )}
                        </Button>

                        {/* Pagination - only show when expanded and more than one page */}
                        {isExpanded && totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                )}
            </Card>

            <IdeaDetailModal
                idea={selectedIdea}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    )
}
