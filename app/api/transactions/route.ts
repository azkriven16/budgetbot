import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { createTransaction, getUserTransactions } from '@/lib/transactions'
import { CATEGORY_IDS } from '@/lib/categories'

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum(CATEGORY_IDS),
  description: z.string().optional(),
  date: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(new Date(v).getTime()), { message: 'Invalid date' }),
})

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const user = await getOrCreateUser(clerkId)
  const { amount, type, category, description, date } = parsed.data

  try {
    const result = await createTransaction(user.id, {
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : undefined,
    })
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Amount must be')) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid query'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const user = await getOrCreateUser(clerkId)
  const { transactions, total } = await getUserTransactions(user.id, parsed.data)

  return NextResponse.json({
    data: { transactions, total, page: parsed.data.page, limit: parsed.data.limit },
  })
}
