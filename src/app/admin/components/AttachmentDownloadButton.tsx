'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, Download, Loader2 } from 'lucide-react'
import { getAttachmentDownloadUrl } from '../actions'

interface AttachmentDownloadButtonProps {
    attachmentPath: string
    attachmentDescription?: string | null
}

export function AttachmentDownloadButton({ attachmentPath, attachmentDescription }: AttachmentDownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            const result = await getAttachmentDownloadUrl(attachmentPath)
            if (result.url) {
                // Open the signed URL in a new tab to trigger download
                window.open(result.url, '_blank')
            } else {
                console.error('Failed to get download URL:', result.error)
                alert('Failed to download attachment: ' + result.error)
            }
        } catch (err) {
            console.error('Download error:', err)
            alert('Failed to download attachment')
        } finally {
            setIsLoading(false)
        }
    }

    // Extract filename from path
    const filename = attachmentPath.split('/').pop() || 'attachment'

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
            className="h-8 px-2"
            title={attachmentDescription || filename}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Paperclip className="h-4 w-4 mr-1" />
                    <Download className="h-3 w-3" />
                </>
            )}
        </Button>
    )
}
