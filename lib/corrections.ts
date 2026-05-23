import '@/lib/env'
import { prisma } from './prisma'
import { assertOwnership, validateAmount } from './validators'
import { CATEGORY_IDS } from './categories'
import { deleteTransaction } from './transactions'
import type { TransactionType } from '../app/generated/prisma/client'

async function findRecentTransactionId(userId: string): Promise<string | null> {
  const messages = await prisma.chatMessage.findMany({
    where: { userId, role: 'ASSISTANT' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  const msg = messages.find((m) => {
    const meta = m.metadata as { transactionId?: string } | null
    return !!meta?.transactionId
  })
  return (msg?.metadata as { transactionId?: string } | null)?.transactionId ?? null
}

export interface CorrectionResult {
  id: string
  amount: number
  oldAmount: number
  type: TransactionType
  category: string
  description: string | null
}

export interface UndoResult {
  id: string
  amount: number
  type: TransactionType
  category: string
  description: string | null
  newBalance: number
}

export async function applyCorrection(
  userId: string,
  field: 'amount' | 'category' | 'description',
  newValue: string,
): Promise<CorrectionResult | null> {
  const transactionId = await findRecentTransactionId(userId)
  if (!transactionId) return null

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return null

  assertOwnership(transaction.userId, userId)

  const oldAmount = Number(transaction.amount)
  let updated: typeof transaction

  if (field === 'amount') {
    const parsed = parseFloat(newValue)
    if (isNaN(parsed)) throw new Error('Amount must be a valid number')
    const newAmount = validateAmount(parsed)

    // Balance delta: INCOME gains newAmount-oldAmount, EXPENSE gains oldAmount-newAmount
    const delta =
      transaction.type === 'INCOME' ? newAmount - oldAmount : oldAmount - newAmount

    updated = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.update({
        where: { id: transactionId },
        data: { amount: newAmount },
      })
      if (delta !== 0) {
        await tx.user.update({
          where: { id: userId },
          data: delta > 0 ? { balance: { increment: delta } } : { balance: { decrement: -delta } },
        })
      }
      return t
    })
  } else if (field === 'category') {
    if (!(CATEGORY_IDS as readonly string[]).includes(newValue)) {
      throw new Error(`Invalid category: ${newValue}`)
    }
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { category: newValue },
    })
  } else {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { description: newValue },
    })
  }

  return {
    id: updated.id,
    amount: Number(updated.amount),
    oldAmount,
    type: updated.type,
    category: updated.category,
    description: updated.description,
  }
}

export async function undoLastTransaction(userId: string): Promise<UndoResult | null> {
  const transactionId = await findRecentTransactionId(userId)
  if (!transactionId) return null

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return null

  assertOwnership(transaction.userId, userId)

  const { newBalance } = await deleteTransaction(userId, {
    id: transaction.id,
    amount: transaction.amount,
    type: transaction.type,
  })

  return {
    id: transaction.id,
    amount: Number(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    newBalance,
  }
}
