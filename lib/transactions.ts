import './env'
import { prisma } from './prisma'
import { validateAmount } from './validators'
import type { TransactionType, Prisma } from '../app/generated/prisma/client'

interface TransactionInput {
  amount: number
  type: TransactionType
  category: string
  description?: string
  date?: Date
}

interface TransactionFilters {
  page?: number
  limit?: number
  category?: string
  type?: TransactionType
  month?: string
}

export async function createTransaction(userId: string, data: TransactionInput) {
  validateAmount(data.amount)

  const date = data.date ?? new Date()

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
        date,
      },
    })

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        balance:
          data.type === 'INCOME'
            ? { increment: data.amount }
            : { decrement: data.amount },
      },
    })

    return { transaction, newBalance: Number(updated.balance) }
  })
}

export async function deleteTransaction(userId: string, transactionId: string) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    })

    await tx.transaction.delete({ where: { id: transactionId } })

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        balance:
          transaction.type === 'INCOME'
            ? { decrement: Number(transaction.amount) }
            : { increment: Number(transaction.amount) },
      },
    })

    return { success: true, newBalance: Number(updated.balance) }
  })
}

export async function getUserTransactions(userId: string, filters: TransactionFilters = {}) {
  const { page = 1, limit = 20, category, type, month } = filters

  const where: Prisma.TransactionWhereInput = { userId }

  if (category) where.category = category
  if (type) where.type = type
  if (month) {
    const [year, monthNum] = month.split('-').map(Number)
    where.date = {
      gte: new Date(year!, monthNum! - 1, 1),
      lt: new Date(year!, monthNum!, 1),
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return { transactions, total }
}
