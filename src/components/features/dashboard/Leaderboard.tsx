'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Medal, Users } from "lucide-react"

type LeaderboardUser = {
    id: string
    full_name: string | null
    job_role: string | null
    total_points: number
}

interface LeaderboardProps {
    users: LeaderboardUser[]
    currentUserId?: string
}

// Match the collapsed TopIdeas count for visual symmetry
const DISPLAY_COUNT = 5

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
    // Only show top 5 to match TopIdeas height
    const displayedUsers = users.slice(0, DISPLAY_COUNT)

    if (!users || users.length === 0) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Users className="h-5 w-5 text-primary" />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No participants yet.</p>
                </CardContent>
            </Card>
        )
    }

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 0: return 'text-yellow-500 bg-yellow-500/20'
            case 1: return 'text-zinc-400 bg-zinc-400/20'
            case 2: return 'text-amber-700 bg-amber-700/20'
            default: return 'text-muted-foreground bg-muted'
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Medal className="h-5 w-5 text-primary" />
                        Leaderboard
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                        <Users className="mr-1 h-3 w-3" /> {users.length} Participants
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 flex-1">
                <div className="flex flex-col h-full">
                    {displayedUsers.map((user, index) => {
                        const isCurrentUser = user.id === currentUserId
                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    flex items-center justify-between p-4 transition-all
                                    ${isCurrentUser ? 'bg-primary/10 border-l-2 border-l-primary' : 'border-l-2 border-transparent'}
                                    ${index !== displayedUsers.length - 1 ? 'border-b border-border/50' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm
                                        ${getMedalColor(index)}
                                    `}>
                                        #{index + 1}
                                    </div>
                                    <p className={`font-medium leading-none ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                        {user.full_name || 'Anonymous'}
                                        {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 font-semibold text-primary">
                                    <span className="text-lg">{user.total_points}</span>
                                    <span className="text-xs text-muted-foreground">pts</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
