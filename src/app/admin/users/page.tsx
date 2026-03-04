import { getUsers } from '../actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { User, Edit, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function UsersPage() {
    const usersData = await getUsers()
    const users = (usersData as any) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500">Manage user roles and permissions.</p>
                </div>
                <Link href="/admin/users/new">
                    <Button>Add User</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-slate-100 rounded-full">
                                                <User className="h-4 w-4 text-slate-600" />
                                            </div>
                                            <span>{user.full_name || 'No Name'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.organizations?.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'secondary'}>
                                            {user.role === 'super_admin' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.job_role || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
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
