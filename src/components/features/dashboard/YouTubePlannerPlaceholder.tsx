'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Video, Calendar, Clock, ListVideo, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function YouTubePlannerPlaceholder() {
    return (
        <Card className="bg-card border-white/5 relative overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00080D]/80 z-10 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <Video className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white">YouTube Video Planner</CardTitle>
                        <CardDescription className="text-slate-400">Plan, schedule, and track your video content</CardDescription>
                    </div>
                </div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Coming Soon
                </Badge>
            </CardHeader>

            <CardContent className="space-y-4 opacity-50">
                {/* Mock Video Queue */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ListVideo className="h-4 w-4" />
                        <span>Upcoming Videos</span>
                    </div>

                    {/* Placeholder Video Items */}
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                            {/* Thumbnail Placeholder */}
                            <div className="w-24 h-14 rounded bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                                <Video className="h-6 w-6 text-slate-500" />
                            </div>

                            {/* Video Info Placeholder */}
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-slate-700/50 rounded" />
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <div className="h-3 w-16 bg-slate-700/50 rounded" />
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <div className="h-3 w-12 bg-slate-700/50 rounded" />
                                    </span>
                                </div>
                            </div>

                            {/* Status Placeholder */}
                            <div className="h-6 w-16 bg-slate-700/50 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Quick Actions Placeholder */}
                <div className="flex gap-2 pt-2">
                    <div className="h-9 flex-1 bg-slate-700/30 rounded-md border border-white/5" />
                    <div className="h-9 w-32 bg-primary/20 rounded-md border border-primary/20" />
                </div>
            </CardContent>
        </Card>
    )
}