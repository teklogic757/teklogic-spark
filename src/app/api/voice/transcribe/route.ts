
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { extractIdeaFromTranscript } from '@/lib/ai-evaluator'

// Initialize OpenAI for Whisper (Audio)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // 1. Transcribe with Whisper
        console.log(`[Voice API] Received file: ${file.name}, size: ${file.size}, type: ${file.type}`)

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'en',
            prompt: "The user is describing a business automation idea. Technical terms: API, Workflow, Integration, AI, Database."
        })

        const transcriptText = transcription.text
        console.log(`[Voice API] Transcript: ${transcriptText.substring(0, 50)}...`)

        // 2. Extract Structure with Shared Service
        const extraction = await extractIdeaFromTranscript(transcriptText)

        return NextResponse.json({
            transcript: transcriptText,
            extraction: extraction
        })

    } catch (error: any) {
        console.error('[Voice API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
