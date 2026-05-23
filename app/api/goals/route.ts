import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { getUserGoals } from '@/lib/goals'

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive().max(10_000_000),
  emoji: z.string().max(8).optional(),
})

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const user = await getOrCreateUser(clerkId)

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      emoji: parsed.data.emoji ?? null,
    },
  })

  return NextResponse.json({ data: goal }, { status: 201 })
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)
  const data = await getUserGoals(user.id)

  return NextResponse.json({ data })
}
