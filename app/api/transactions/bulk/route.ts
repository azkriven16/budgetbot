import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

const querySchema = z.object({
  range: z.enum(['today', 'week', 'month', 'all']),
})

function getDateFilter(range: 'today' | 'week' | 'month' | 'all') {
  if (range === 'all') return undefined
  const now = new Date()
  if (range === 'today') {
    return { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
  }
  const start = new Date(now)
  start.setDate(now.getDate() - (range === 'week' ? 7 : 30))
  return { gte: start }
}

export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) return new Response('Invalid range', { status: 400 })

  const user = await getOrCreateUser(clerkId)
  const dateFilter = getDateFilter(parsed.data.range)
  const where = { userId: user.id, ...(dateFilter ? { date: dateFilter } : {}) }

  const { count } = await prisma.$transaction(async (tx) => {
    const toDelete = await tx.transaction.findMany({
      where,
      select: { amount: true, type: true },
    })

    // Reverse every deleted transaction's balance impact
    const delta = toDelete.reduce(
      (acc, t) => (t.type === 'INCOME' ? acc - Number(t.amount) : acc + Number(t.amount)),
      0,
    )

    const result = await tx.transaction.deleteMany({ where })

    if (result.count > 0 && delta !== 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: delta } },
      })
    }

    return result
  })

  return Response.json({ data: { deleted: count } })
}
