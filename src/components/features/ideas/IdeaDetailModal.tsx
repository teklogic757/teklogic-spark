'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Building2, Brain, Target, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react"

interface IdeaDetail {
    id: string
    title: string
    description: string
    status: 'new' | 'processed'
    created_at: string
    department?: string | null
    problem_statement?: string | null
    proposed_solution?: string | null
    ai_score: number | null
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

interface IdeaDetailModalProps {
    idea: IdeaDetail | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function getScoreColor(score: number | null): string {
    if (score === null) return 'text-muted-foreground'
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
}

function getScoreBgColor(score: number | null): string {
    if (score === null) return 'bg-muted'
    if (score >= 70) return 'bg-green-500/10'
    if (score >= 50) return 'bg-yellow-500/10'
    return 'bg-red-500/10'
}

export function IdeaDetailModal({ idea, open, onOpenChange }: IdeaDetailModalProps) {
    if (!idea) return null

    const analysis = idea.ai_analysis_json

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <DialogTitle className="text-xl">{idea.title}</DialogTitle>
                        <Badge variant={idea.status === 'processed' ? 'default' : 'secondary'}>
                            {idea.status === 'processed' ? 'Processed' : 'New'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{idea.users?.full_name || 'Anonymous'}</span>
                            {idea.users?.job_role && (
                                <span className="text-xs">({idea.users.job_role})</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        {idea.department && (
                            <div className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4" />
                                <span>{idea.department}</span>
                            </div>
                        )}
                    </div>

                    {/* AI Score */}
                    {idea.ai_score !== null && (
                        <div className={`rounded-lg p-4 ${getScoreBgColor(idea.ai_score)}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    <span className="font-medium">AI Score</span>
                                </div>
                                <span className={`text-3xl font-bold ${getScoreColor(idea.ai_score)}`}>
                                    {idea.ai_score}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            Description
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {idea.description}
                        </p>
                    </div>

                    {/* Problem Statement */}
                    {idea.problem_statement && (
                        <div className="space-y-2">
                            <h4 className="font-medium">Problem Statement</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {idea.problem_statement}
                            </p>
                        </div>
                    )}

                    {/* Proposed Solution */}
                    {idea.proposed_solution && (
                        <div className="space-y-2">
                            <h4 className="font-medium">Proposed Solution</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {idea.proposed_solution}
                            </p>
                        </div>
                    )}

                    {/* AI Reframed Text */}
                    {idea.ai_reframed_text && (
                        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Reframed Summary
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {idea.ai_reframed_text}
                            </p>
                        </div>
                    )}

                    {/* AI Feedback */}
                    {idea.ai_feedback && (
                        <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                AI Feedback
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {idea.ai_feedback}
                            </p>
                        </div>
                    )}

                    {/* AI Analysis Breakdown */}
                    {analysis && (
                        <div className="space-y-4">
                            {/* Criteria Scores */}
                            {analysis.criteria_scores && Object.keys(analysis.criteria_scores).length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Evaluation Criteria</h4>
                                    <div className="grid gap-3">
                                        {Object.entries(analysis.criteria_scores).map(([criterion, scoreData]) => {
                                            const score = typeof scoreData === 'number' ? scoreData : scoreData?.score
                                            const reasoning = typeof scoreData === 'object' ? scoreData?.reasoning : null
                                            return (
                                                <div key={criterion} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground capitalize">
                                                            {criterion.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className={`font-medium ${getScoreColor(score)}`}>
                                                            {score}
                                                        </span>
                                                    </div>
                                                    {reasoning && (
                                                        <p className="text-xs text-muted-foreground/70 pl-2 border-l-2 border-muted">
                                                            {reasoning}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Key Benefits */}
                            {analysis.key_benefits && analysis.key_benefits.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Key Benefits</h4>
                                    <ul className="space-y-1">
                                        {analysis.key_benefits.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Related Suggestions */}
                            {analysis.related_suggestions && analysis.related_suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Related Suggestions</h4>
                                    <ul className="space-y-3">
                                        {analysis.related_suggestions.map((suggestion, index) => {
                                            if (typeof suggestion === 'string') {
                                                return (
                                                    <li key={index} className="text-sm text-muted-foreground">
                                                        • {suggestion}
                                                    </li>
                                                )
                                            }
                                            return (
                                                <li key={index} className="space-y-1 pl-2 border-l-2 border-primary/30">
                                                    <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                                                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                                    {suggestion.rationale && (
                                                        <p className="text-xs text-muted-foreground/70 italic">{suggestion.rationale}</p>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter showCloseButton>
                    {/* Close button handled by DialogFooter */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
