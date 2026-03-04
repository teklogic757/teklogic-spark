'use client'

import { useRouter } from 'next/navigation'
import { Monitor } from 'lucide-react'

type DesktopToggleProps = {
    clientId: string
}

export function DesktopToggle({ clientId }: DesktopToggleProps) {
    const router = useRouter()

    const switchToDesktop = () => {
        // Set cookie to prefer desktop
        document.cookie = 'prefer-desktop=true; path=/; max-age=31536000' // 1 year
        // Redirect to desktop dashboard
        router.push(`/${clientId}/dashboard`)
        router.refresh()
    }

    return (
        <button
            onClick={switchToDesktop}
            className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 py-4 transition-colors"
        >
            <Monitor className="h-3.5 w-3.5" />
            View Desktop Site
        </button>
    )
}
