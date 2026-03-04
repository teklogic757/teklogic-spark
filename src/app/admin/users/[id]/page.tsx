import { getUserById, getOrganizations } from '../../actions'
import UserForm from '../user-form'


import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const userData = await getUserById(id)
    const orgs = await getOrganizations() // For the dropdown

    if (!userData) {
        return <div>User not found</div>
    }

    const user = userData as any

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                    <p className="text-sm text-gray-500">{user.full_name}</p>
                </div>
            </div>

            <UserForm user={user} orgs={orgs} />
        </div>
    )
}
