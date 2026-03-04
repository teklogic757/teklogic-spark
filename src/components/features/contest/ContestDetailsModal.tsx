'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Gift, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { ContestConfig } from '@/lib/types/database.types'

interface ContestDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    contestStartsAt: string | null
    contestEndsAt: string | null
    contestConfig: ContestConfig | null
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'TBD'
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

function getTimeRemaining(endDate: string | null): string {
    if (!endDate) return 'TBD'
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) return 'Contest has ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)

    if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`
}

export function ContestDetailsModal({
    isOpen,
    onClose,
    contestStartsAt,
    contestEndsAt,
    contestConfig
}: ContestDetailsModalProps) {
    if (!contestConfig) return null

    const isEnded = contestEndsAt ? new Date(contestEndsAt).getTime() < Date.now() : false

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl bg-[#001D29] border-white/10">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                            <Trophy className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-white">
                                {contestConfig.title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 mt-1">
                                {isEnded ? 'This contest has ended' : getTimeRemaining(contestEndsAt)}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {contestConfig.description}
                    </p>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Start Date</span>
                            </div>
                            <p className="text-sm font-medium text-white">
                                {formatDate(contestStartsAt)}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>End Date</span>
                            </div>
                            <p className="text-sm font-medium text-white">
                                {formatDate(contestEndsAt)}
                            </p>
                        </div>
                    </div>

                    {/* Prizes */}
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                            <Gift className="h-4 w-4 text-primary" />
                            <span>Prizes</span>
                        </div>
                        <div className="space-y-2">
                            {contestConfig.prizes.map((prize, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${prize.place === 1
                                            ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/20'
                                            : prize.place === 2
                                                ? 'bg-gradient-to-r from-slate-400/10 to-slate-300/5 border-slate-400/20'
                                                : 'bg-white/5 border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${prize.place === 1
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : prize.place === 2
                                                    ? 'bg-slate-400/20 text-slate-300'
                                                    : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            #{prize.place}
                                        </div>
                                        <span className="text-sm text-white">{prize.description}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${prize.place === 1 ? 'text-amber-400' : 'text-slate-300'
                                        }`}>
                                        {prize.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rules */}
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Contest Rules</span>
                        </div>
                        <ul className="space-y-2">
                            {contestConfig.rules.map((rule, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter showCloseButton>
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                        onClick={onClose}
                    >
                        Got it!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
