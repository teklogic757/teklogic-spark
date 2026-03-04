'use client'

import { useState, useEffect } from 'react'
import { Trophy, Clock } from 'lucide-react'
import { ContestConfig } from '@/lib/types/database.types'

interface ContestTimerProps {
    contestStartsAt: string | null
    contestEndsAt: string | null
    contestConfig: ContestConfig | null
    onOpenDetails: () => void
}

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
}

function calculateTimeLeft(endDate: string): TimeLeft {
    const difference = new Date(endDate).getTime() - new Date().getTime()

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
    }
}

export function ContestTimer({ contestStartsAt, contestEndsAt, contestConfig, onOpenDetails }: ContestTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
    const [mounted, setMounted] = useState(false)

    // Check if contest is active
    const isContestActive = Boolean(
        contestEndsAt &&
        contestConfig?.is_active &&
        new Date(contestEndsAt).getTime() > Date.now()
    )

    useEffect(() => {
        setMounted(true)

        if (!isContestActive || !contestEndsAt) return

        // Initial calculation
        setTimeLeft(calculateTimeLeft(contestEndsAt))

        // Update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft(contestEndsAt)
            setTimeLeft(newTimeLeft)

            if (newTimeLeft.total <= 0) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [contestEndsAt, isContestActive])

    // Don't render if no active contest
    if (!isContestActive || !contestConfig) {
        return null
    }

    // Don't render until mounted (prevents hydration mismatch)
    if (!mounted || !timeLeft) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-500 font-medium">Loading...</span>
            </div>
        )
    }

    // Contest ended
    if (timeLeft.total <= 0) {
        return (
            <button
                onClick={onOpenDetails}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-500/10 to-slate-600/10 border border-slate-500/20 hover:border-slate-400/30 transition-colors cursor-pointer"
            >
                <Trophy className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Contest Ended</span>
            </button>
        )
    }

    // Format time display
    const formatNumber = (n: number) => n.toString().padStart(2, '0')

    return (
        <button
            onClick={onOpenDetails}
            className="group flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/15 hover:to-orange-500/15 transition-all cursor-pointer"
            title="Click for contest details"
        >
            <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-amber-500 hidden sm:inline">Contest</span>
            </div>
            <div className="h-4 w-px bg-amber-500/30 hidden sm:block" />
            <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-500/70" />
                <div className="flex items-center gap-1 font-mono text-xs font-semibold">
                    {timeLeft.days > 0 && (
                        <>
                            <span className="text-amber-400">{timeLeft.days}</span>
                            <span className="text-amber-500/50">d</span>
                        </>
                    )}
                    <span className="text-amber-400">{formatNumber(timeLeft.hours)}</span>
                    <span className="text-amber-500/50 animate-pulse">:</span>
                    <span className="text-amber-400">{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-amber-500/50 animate-pulse">:</span>
                    <span className="text-amber-400">{formatNumber(timeLeft.seconds)}</span>
                </div>
            </div>
        </button>
    )
}
