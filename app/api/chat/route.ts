import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { tasks } from '@trigger.dev/sdk'
import { getOrCreateUser } from '@/lib/user'
import type { parseMessage } from '@/trigger/parse-message'

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const user = await getOrCreateUser(clerkId)

  try {
    const handle = await tasks.trigger<typeof parseMessage>('parse-message', {
      userId: user.id,
      clerkId,
      message: parsed.data.message,
    })
    return NextResponse.json({ data: { runId: handle.id } }, { status: 202 })
  } catch {
    return NextResponse.json({ error: 'Failed to queue message. Please try again.' }, { status: 503 })
  }
}
