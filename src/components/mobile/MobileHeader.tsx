'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

type MobileHeaderProps = {
    clientId: string
    onSignOut: () => void
}

export function MobileHeader({ clientId, onSignOut }: MobileHeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#00080D]">
            <div className="flex h-14 items-center justify-between px-4">
                <Link href={`/${clientId}/m/`} className="relative h-8 w-32">
                    <Image
                        src="/logo.svg"
                        alt="Teklogic Spark AI"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSignOut}
                    className="text-slate-400 hover:text-white h-9 px-3"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </header>
    )
}
