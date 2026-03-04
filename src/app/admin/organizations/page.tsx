import { getOrganizations } from '../actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Building2, Edit } from 'lucide-react'

export default async function OrganizationsPage() {
    const orgs = await getOrganizations()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-sm text-gray-500">Manage client workspaces and AI context.</p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button>Add Organization</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Organizations ({orgs?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orgs?.map((org: any) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                <Building2 className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <span>{org.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{org.slug}</TableCell>
                                    <TableCell>{org.domain || '-'}</TableCell>
                                    <TableCell>{org.industry || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/organizations/${org.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Context
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
