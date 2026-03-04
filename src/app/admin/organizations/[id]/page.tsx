import { getOrganizationById, updateOrganization, getOrganizationIdeas } from '../../actions'
import OrgForm from '../org-form'
import { TopIdeas } from '@/components/TopIdeas'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AttachmentDownloadButton } from '../../components/AttachmentDownloadButton'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const orgData = await getOrganizationById(id)
    const { topIdeas, recentIdeas } = await getOrganizationIdeas(id)

    if (!orgData) {
        return <div>Organization not found</div>
    }

    const org = orgData as any

    // Adapt TopIdeas type (TopIdeas expects 'users' object, we fetched it)
    // The data fetch in getOrganizationIdeas includes *, users(full_name) which matches.

    return (
        <div className="space-y-8">
            {/* Header with Client Name */}
            <div className="flex items-center space-x-4">
                <Link href="/admin/organizations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <p className="text-sm font-medium text-primary uppercase tracking-wide">Client</p>
                    <h1 className="text-3xl font-bold text-foreground">{org.name}</h1>
                    <p className="text-sm text-muted-foreground">Update Context & Settings</p>
                </div>
            </div>

            {/* Dashboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Leaderboard */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Leaderboard</h2>
                    {/* Wrap TopIdeas in a container to enforce dark mode style if component is built for dark mode only, 
                        OR accept that TopIdeas might look odd in light mode admin. 
                        TopIdeas uses 'bg-card/50', 'text-foreground'. 
                        In Admin (likely light mode), these shadcn tokens should adapt.
                    */}
                    <TopIdeas ideas={topIdeas as any[]} />
                </div>

                {/* Right: Recent Ideas Table */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Submissions</h2>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">Last 10 Ideas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Submitter</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Attachment</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentIdeas.map((idea: any) => (
                                        <TableRow key={idea.id}>
                                            <TableCell className="font-medium text-sm">{idea.title}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{idea.users?.full_name || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {idea.ai_score || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    idea.status === 'approved' ? 'default' :
                                                        idea.status === 'rejected' ? 'destructive' : 'secondary'
                                                } className="text-xs capitalize">
                                                    {idea.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {idea.attachment_path ? (
                                                    <AttachmentDownloadButton
                                                        attachmentPath={idea.attachment_path}
                                                        attachmentDescription={idea.attachment_description}
                                                    />
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {new Date(idea.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {recentIdeas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No ideas submitted yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="border-t pt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Organization Settings</h2>
                <OrgForm org={org} />
            </div>
        </div>
    )
}
