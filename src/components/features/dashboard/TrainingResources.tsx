'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { trainingVideos, shuffleVideos, type TrainingVideo } from "@/data/training-videos"

const VIDEOS_PER_PAGE = 5

// Thumbnail component with fallback through multiple YouTube thumbnail sizes
function VideoThumbnail({ video }: { video: TrainingVideo }) {
    const [thumbnailIndex, setThumbnailIndex] = useState(0)

    // YouTube provides multiple thumbnail sizes - try them in order
    // mqdefault (320x180), hqdefault (480x360), sddefault (640x480), default (120x90)
    const thumbnailSizes = ['mqdefault', 'hqdefault', 'sddefault', 'default', '0']

    const currentThumbnail = video.thumbnail.replace('mqdefault', thumbnailSizes[thumbnailIndex])

    const handleError = () => {
        if (thumbnailIndex < thumbnailSizes.length - 1) {
            setThumbnailIndex(prev => prev + 1)
        }
    }

    // If we've exhausted all options, show fallback
    if (thumbnailIndex >= thumbnailSizes.length) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-slate-800 flex items-center justify-center">
                <Play className="h-6 w-6 text-red-500/70" />
            </div>
        )
    }

    return (
        <img
            src={currentThumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleError}
        />
    )
}

interface TrainingResourcesProps {
    videos?: TrainingVideo[]
}

export function TrainingResources({ videos = trainingVideos }: TrainingResourcesProps) {
    const [shuffledVideos, setShuffledVideos] = useState<TrainingVideo[]>([])
    const [currentPage, setCurrentPage] = useState(0)

    useEffect(() => {
        setShuffledVideos(shuffleVideos(videos))
        setCurrentPage(0)
    }, [videos])

    const totalPages = Math.max(1, Math.ceil(shuffledVideos.length / VIDEOS_PER_PAGE))
    const startIndex = currentPage * VIDEOS_PER_PAGE
    const displayedVideos = shuffledVideos.slice(startIndex, startIndex + VIDEOS_PER_PAGE)

    const handlePrevious = () => {
        setCurrentPage(p => Math.max(0, p - 1))
    }

    const handleNext = () => {
        setCurrentPage(p => Math.min(totalPages - 1, p + 1))
    }

    const handleVideoClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    if (shuffledVideos.length === 0) {
        return (
            <Card className="bg-card border-white/5">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white">AI Training Resources</CardTitle>
                            <CardDescription className="text-slate-400">Loading videos...</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white">AI Training Resources</CardTitle>
                        <CardDescription className="text-slate-400">
                            Curated videos to help you learn AI fundamentals
                        </CardDescription>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                        className="h-8 w-8 p-0 border-white/10 hover:bg-white/5"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-slate-400 min-w-[60px] text-center">
                        {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages - 1}
                        className="h-8 w-8 p-0 border-white/10 hover:bg-white/5"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {displayedVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleVideoClick(video.url)}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5
                                         hover:bg-white/10 hover:border-primary/30 cursor-pointer transition-all group"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                                    <VideoThumbnail video={video} />
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40
                                                  opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                                        {video.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <ExternalLink className="h-3 w-3" />
                                        YouTube
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
