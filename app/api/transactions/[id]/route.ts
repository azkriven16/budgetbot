import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { deleteTransaction } from '@/lib/transactions'
import { assertOwnership, validateAmount } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { CATEGORY_IDS } from '@/lib/categories'

const updateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum(CATEGORY_IDS),
  description: z.string().optional(),
  date: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(new Date(v).getTime()), { message: 'Invalid date' }),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  const transaction = await prisma.transaction.findUnique({ where: { id } })
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    assertOwnership(transaction.userId, user.id)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    validateAmount(parsed.data.amount)
  } catch (e) {
    if (e instanceof Error) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }

  const { amount, type, category, description, date } = parsed.data
  const oldAmount = Number(transaction.amount)
  const oldType = transaction.type

  // Reverse old balance impact then apply new one — atomically
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        category,
        description: description ?? null,
        date: date ? new Date(date) : transaction.date,
      },
    })

    const undoOld = oldType === 'INCOME' ? { decrement: oldAmount } : { increment: oldAmount }
    const applyNew = type === 'INCOME' ? { increment: amount } : { decrement: amount }

    await tx.user.update({ where: { id: user.id }, data: { balance: undoOld } })
    const final = await tx.user.update({ where: { id: user.id }, data: { balance: applyNew } })

    return { transaction: updated, newBalance: Number(final.balance) }
  })

  return NextResponse.json({ data: result })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  const transaction = await prisma.transaction.findUnique({ where: { id } })
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    assertOwnership(transaction.userId, user.id)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await deleteTransaction(user.id, transaction)

  return NextResponse.json({ data: { success: true } })
}
