import { getOrganizations } from '../actions'
import InviteForm from './invite-form'

export default async function AdminInvitesPage() {
    const organizations = await getOrganizations()

    return (
        <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200">
                <h3 className="text-2xl leading-6 font-medium text-gray-900">
                    Invite Users
                </h3>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    Generate unique invite links for new users to join specific organizations.
                </p>
            </div>

            <InviteForm organizations={organizations || []} />
        </div>
    )
}
