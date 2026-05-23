import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { parseRecurrence, getUserReminders } from '@/lib/reminders'

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  recurrence: z.string().min(1).max(200),
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

  const activeCount = await prisma.reminder.count({
    where: { userId: user.id, isActive: true },
  })
  if (activeCount >= 10) {
    return NextResponse.json({ error: 'Maximum 10 active reminders allowed' }, { status: 422 })
  }

  const { recurrenceCron, nextDueAt } = parseRecurrence(parsed.data.recurrence)
  const reminder = await prisma.reminder.create({
    data: {
      userId: user.id,
      message: parsed.data.message,
      recurrence: recurrenceCron,
      nextDueAt,
    },
  })

  return NextResponse.json({ data: reminder }, { status: 201 })
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)
  const data = await getUserReminders(user.id)

  return NextResponse.json({ data })
}
