import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import {
  getSpendingByCategory,
  getMonthlyTotals,
  getRecentTransactions,
} from '@/lib/dashboard'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { EmptyState } from '@/components/dashboard/empty-state'

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const user = await getOrCreateUser(clerkId)

  const [spending, monthly, transactions] = await Promise.all([
    getSpendingByCategory(user.id, new Date()),
    getMonthlyTotals(user.id, 6),
    getRecentTransactions(user.id, 10),
  ])

  const balance = Number(user.balance)
  const hasTransactions = transactions.length > 0

  return (
    <div className="p-4 md:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left column — balance + charts */}
        <div className="flex flex-col gap-4">
          <BalanceCard balance={balance} />
          <SpendingChart data={spending} />
          <MonthlyChart data={monthly} />
        </div>

        {/* Right column — transactions or empty state */}
        <div className="flex flex-col gap-4">
          {hasTransactions ? (
            <RecentTransactions transactions={transactions} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}
