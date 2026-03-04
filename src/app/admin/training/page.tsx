import Link from 'next/link'
import { ExternalLink, Trash2, Video } from 'lucide-react'
import { createTrainingVideo, deleteTrainingVideo, getTrainingVideos } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TrainingVideoRecord } from '@/lib/training-videos'

export default async function AdminTrainingPage() {
    const videos = await getTrainingVideos() as TrainingVideoRecord[]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Library</h1>
                <p className="text-sm text-gray-500">Manage the shared AI learning videos shown on every tenant dashboard.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add Training Video</CardTitle>
                    <CardDescription>Submit a YouTube URL and the app will normalize it before saving.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createTrainingVideo} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" required maxLength={200} placeholder="AI Fundamentals for Sales Teams" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">YouTube URL</Label>
                            <Input id="url" name="url" type="url" required placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                        <Button type="submit">Save Video</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Managed Videos ({videos.length})</CardTitle>
                    <CardDescription>Changes here appear on tenant dashboards after the next refresh.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {videos.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No managed videos yet. The dashboard will keep using fallback content until you add one.
                        </div>
                    ) : (
                        videos.map(video => (
                            <div
                                key={video.id}
                                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="rounded-lg bg-slate-100 p-2">
                                        <Video className="h-4 w-4 text-slate-700" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900">{video.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Added {new Date(video.created_at).toLocaleString('en-US')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={video.youtube_url}
                                        target="_blank"
                                        className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open
                                    </Link>
                                    <form action={deleteTrainingVideo}>
                                        <input type="hidden" name="id" value={video.id} />
                                        <Button type="submit" variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
