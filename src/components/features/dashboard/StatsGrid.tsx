import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Timer, Trophy } from "lucide-react"

interface StatsGridProps {
    ideasCount: number
    contestEndsAt?: string | null
    totalPoints: number
}

function formatContestEndDate(contestEndsAt: string | null | undefined): { daysLeft: string; formattedDate: string } {
    if (!contestEndsAt) {
        return { daysLeft: 'TBD', formattedDate: 'Not set' }
    }

    const endDate = new Date(contestEndsAt)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const formattedDate = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    if (diffDays < 0) {
        return { daysLeft: 'Ended', formattedDate }
    } else if (diffDays === 0) {
        return { daysLeft: 'Today', formattedDate }
    } else if (diffDays === 1) {
        return { daysLeft: '1 Day', formattedDate }
    } else {
        return { daysLeft: `${diffDays} Days`, formattedDate }
    }
}

export function StatsGrid({ ideasCount, contestEndsAt, totalPoints }: StatsGridProps) {
    const { daysLeft, formattedDate } = formatContestEndDate(contestEndsAt)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
                    <p className="text-xs text-muted-foreground">
                        Your impact score
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ideas Submitted</CardTitle>
                    <Lightbulb className="h-4 w-4 text-secondary-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{ideasCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Your total submissions
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Contest Ends</CardTitle>
                    <Timer className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{daysLeft}</div>
                    <p className="text-xs text-muted-foreground">
                        {formattedDate}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
