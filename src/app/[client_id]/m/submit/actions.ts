'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { submitIdeaFlow } from '@/lib/submit-flow'

export async function submitIdeaMobile(_prevState: unknown, formData: FormData) {
    const result = await submitIdeaFlow(formData, 'mobile')

    if (!result.ok) {
        return { error: result.error }
    }

    revalidatePath(`/${result.organizationSlug}/dashboard`)
    redirect(`/${result.organizationSlug}/m/submit/success`)
}
