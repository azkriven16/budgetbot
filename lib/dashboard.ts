import { prisma } from './prisma'

export async function getSpendingByCategory(
  userId: string,
  month: Date,
): Promise<{ category: string; total: number }[]> {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)

  const rows = await prisma.transaction.groupBy({
    by: ['category'],
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  return rows.map((r) => ({
    category: r.category,
    total: Number(r._sum.amount ?? 0),
  }))
}

export async function getMonthlyTotals(
  userId: string,
  months: number,
): Promise<{ month: string; income: number; expenses: number }[]> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const txns = await prisma.transaction.findMany({
    where: { userId, date: { gte: start } },
    select: { amount: true, type: true, date: true },
  })

  // Pre-fill all buckets so months with no data still appear
  const buckets: Record<string, { income: number; expenses: number }> = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { income: 0, expenses: 0 }
  }

  for (const t of txns) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (buckets[key]) {
      if (t.type === 'INCOME') buckets[key].income += Number(t.amount)
      else buckets[key].expenses += Number(t.amount)
    }
  }

  return Object.entries(buckets).map(([key, v]) => {
    const [year, month] = key.split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, 1)
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      ...v,
    }
  })
}

export type RecentTransaction = {
  id: string
  category: string
  description: string | null
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
}

export async function getRecentTransactions(
  userId: string,
  limit: number,
): Promise<RecentTransaction[]> {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
    select: { id: true, category: true, description: true, amount: true, type: true, date: true },
  })

  return rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    type: r.type as 'INCOME' | 'EXPENSE',
  }))
}
