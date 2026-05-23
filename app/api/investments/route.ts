import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { createInvestment, getPortfolioSummary, ValidationError } from '@/lib/investments'

const bodySchema = z.object({
  ticker: z.string().min(1).max(10),
  companyName: z.string().max(100).optional(),
  action: z.enum(['BUY', 'SELL']),
  shares: z.number().positive(),
  pricePerShare: z.number().positive(),
  date: z.string().optional(),
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

  try {
    const investment = await createInvestment(user.id, {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    })
    return NextResponse.json({ data: investment }, { status: 201 })
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof Error && e.message.startsWith('Amount must be')) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)
  const data = await getPortfolioSummary(user.id)

  return NextResponse.json({ data })
}
