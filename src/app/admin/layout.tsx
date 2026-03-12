import { getAdminAccessState } from './actions'
import { notFound, redirect } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const access = await getAdminAccessState()

    if (access.status === 'anonymous') {
        redirect('/login')
    }

    if (access.status === 'unauthorized') {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-card shadow-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="font-bold text-xl text-primary">Teklogic Admin</span>
                            </div>
                            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                <a href="/" className="text-foreground border-transparent hover:border-gray-300 hover:text-muted-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </a>
                                <a href="/admin/organizations" className="text-foreground border-transparent hover:border-gray-300 hover:text-muted-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Organizations
                                </a>
                                <a href="/admin/users" className="text-foreground border-transparent hover:border-gray-300 hover:text-muted-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Users
                                </a>
                                <a href="/admin/invites" className="text-foreground border-transparent hover:border-gray-300 hover:text-muted-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Invites
                                </a>
                                <a href="/admin/training" className="text-foreground border-transparent hover:border-gray-300 hover:text-muted-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Training
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <form action={signOut}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="py-10">
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
