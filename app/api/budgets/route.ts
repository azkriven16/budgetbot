import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { getBudgetStatus } from '@/lib/budgets'
import { CATEGORY_IDS } from '@/lib/categories'
import { validateAmount } from '@/lib/validators'

const bodySchema = z.object({
  category: z.enum(CATEGORY_IDS),
  limitAmount: z.number().positive().max(1_000_000),
})

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    validateAmount(parsed.data.limitAmount)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const user = await getOrCreateUser(clerkId)

  const budget = await prisma.budget.upsert({
    where: { userId_category: { userId: user.id, category: parsed.data.category } },
    create: { userId: user.id, category: parsed.data.category, limitAmount: parsed.data.limitAmount },
    update: { limitAmount: parsed.data.limitAmount },
  })

  return NextResponse.json({ data: budget }, { status: 201 })
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)
  const data = await getBudgetStatus(user.id)

  return NextResponse.json({ data })
}
