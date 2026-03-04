'use client'

import { useState } from 'react'
import { ContestTimer } from './ContestTimer'
import { ContestDetailsModal } from './ContestDetailsModal'
import { ContestConfig } from '@/lib/types/database.types'

interface ContestBannerProps {
    contestStartsAt: string | null
    contestEndsAt: string | null
    contestConfig: ContestConfig | null
}

export function ContestBanner({ contestStartsAt, contestEndsAt, contestConfig }: ContestBannerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <ContestTimer
                contestStartsAt={contestStartsAt}
                contestEndsAt={contestEndsAt}
                contestConfig={contestConfig}
                onOpenDetails={() => setIsModalOpen(true)}
            />
            <ContestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contestStartsAt={contestStartsAt}
                contestEndsAt={contestEndsAt}
                contestConfig={contestConfig}
            />
        </>
    )
}
