
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface VoiceRecorderProps {
    onTranscriptionComplete: (data: {
        title: string
        department: string
        problem_statement: string
        proposed_solution: string
        description?: string
    }) => void
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout>(null)
    const [duration, setDuration] = useState(0)

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    const startRecording = async () => {
        try {
            setError(null)
            setSuccessMessage(null)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)

            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                await processAudio(audioBlob)

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setDuration(0)

            timerRef.current = setInterval(() => {
                setDuration(d => d + 1)
            }, 1000)

        } catch (err: any) {
            console.error('Error accessing microphone:', err)
            setError('Microphone not found or permission denied. Please check your system settings or type manually.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append('file', audioBlob, 'recording.webm')

            const response = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Transcription failed')
            }

            if (data.extraction) {
                onTranscriptionComplete(data.extraction)
                setSuccessMessage("Idea transcribed! Please review the form below before submitting.")
            } else {
                throw new Error('Could not extract idea structure')
            }

        } catch (err: any) {
            console.error('Processing error:', err)
            setError(err.message || 'Failed to process audio')
        } finally {
            setIsProcessing(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                    Retry
                </Button>
            </div>
        )
    }

    if (successMessage) {
        return (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Sparkles className="h-4 w-4" />
                    {successMessage}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                >
                    Record Again
                </Button>
            </div>
        )
    }

    if (isProcessing) {
        return (
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 mb-6 flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-primary font-medium">Processing your idea...</p>
                <p className="text-xs text-primary/70">Using AI to extract details from your voice</p>
            </div>
        )
    }

    if (isRecording) {
        return (
            <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-400 font-mono font-bold text-lg">{formatTime(duration)}</span>
                </div>
                <p className="text-white text-sm mb-4">Listening... Describe your idea clearly.</p>
                <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="gap-2 shadow-lg shadow-red-900/20"
                >
                    <Square className="h-4 w-4 fill-current" /> Stop Recording
                </Button>
            </div>
        )
    }

    return (
        <div className="mb-6 p-1">
            <Button
                onClick={startRecording}
                type="button" // Prevent form submission
                variant="secondary"
                className="w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 hover:text-white h-20 text-lg shadow-lg flex flex-col items-center justify-center gap-1"
            >
                <div className="flex items-center gap-2">
                    <Mic className="h-6 w-6" />
                    <span>Use Microphone to Record</span>
                </div>
                <span className="text-xs text-indigo-400/70 font-normal">Tap to speak your idea instead of typing</span>
            </Button>
            <p className="text-center text-xs text-slate-500 mt-2">
                Requires a microphone. We'll transcribe your voice and fill out the form for you to review.
            </p>
        </div>
    )
}
