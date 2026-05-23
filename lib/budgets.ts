import '@/lib/env'
import { prisma } from './prisma'

export interface BudgetStatus {
  id: string
  category: string
  limitAmount: number
  spentAmount: number
  percentage: number
}

export async function getBudgetStatus(userId: string): Promise<BudgetStatus[]> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [budgets, spending] = await Promise.all([
    prisma.budget.findMany({ where: { userId } }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ])

  const spendMap = new Map(
    spending.map((s) => [s.category, Number(s._sum.amount ?? 0)]),
  )

  return budgets.map((b) => {
    const limitAmount = Number(b.limitAmount)
    const spentAmount = spendMap.get(b.category) ?? 0
    const percentage = limitAmount > 0 ? Math.round((spentAmount / limitAmount) * 100) : 0
    return { id: b.id, category: b.category, limitAmount, spentAmount, percentage }
  })
}
