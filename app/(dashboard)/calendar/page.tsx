import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { getUserTransactions } from '@/lib/transactions'
import { CalendarView } from '@/components/calendar/calendar-view'
import type { CalendarTransaction } from '@/components/calendar/calendar-view'

function currentMonthParam(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const params = await searchParams
  const monthRegex = /^\d{4}-\d{2}$/
  const monthParam =
    params.month && monthRegex.test(params.month) ? params.month : currentMonthParam()

  const [yearStr, monthStr] = monthParam.split('-')
  const year = parseInt(yearStr!)
  const month = parseInt(monthStr!) - 1 // 0-indexed for JS Date

  const user = await getOrCreateUser(clerkId)
  const { transactions } = await getUserTransactions(user.id, { month: monthParam, limit: 500 })

  const byDay: Record<string, CalendarTransaction[]> = {}
  let monthIncome = 0
  let monthExpense = 0

  for (const t of transactions) {
    const key = t.date.toISOString().slice(0, 10)
    if (!byDay[key]) byDay[key] = []
    const amount = Number(t.amount)
    byDay[key].push({
      id: t.id,
      amount,
      type: t.type as 'INCOME' | 'EXPENSE',
      category: t.category,
      description: t.description,
      date: t.date.toISOString(),
    })
    if (t.type === 'INCOME') monthIncome += amount
    else monthExpense += amount
  }

  return (
    <CalendarView
      year={year}
      month={month}
      byDay={byDay}
      monthIncome={monthIncome}
      monthExpense={monthExpense}
    />
  )
}
