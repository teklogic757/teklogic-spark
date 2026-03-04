import { getOrganizations } from '../../actions'
import UserForm from '../user-form'

export default async function NewUserPage() {
    const organizations = await getOrganizations()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
            <UserForm user={{}} orgs={organizations || []} />
        </div>
    )
}
