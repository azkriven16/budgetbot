import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { contributeToGoalById } from '@/lib/goals'

const bodySchema = z.object({
  amount: z.number().positive().max(1_000_000),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  const result = await contributeToGoalById(user.id, id, parsed.data.amount)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ data: result })
}
