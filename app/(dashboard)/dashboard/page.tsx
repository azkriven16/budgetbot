import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import {
  getSpendingByCategory,
  getMonthlyTotals,
  getRecentTransactions,
} from '@/lib/dashboard'
import { getBudgetStatus } from '@/lib/budgets'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { EmptyState } from '@/components/dashboard/empty-state'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { BudgetSettingsModal } from '@/components/dashboard/budget-settings-modal'

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const user = await getOrCreateUser(clerkId)

  const [spending, monthly, transactions, budgets] = await Promise.all([
    getSpendingByCategory(user.id, new Date()),
    getMonthlyTotals(user.id, 6),
    getRecentTransactions(user.id, 10),
    getBudgetStatus(user.id),
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

        {/* Right column — transactions + budget limits */}
        <div className="flex flex-col gap-4">
          {hasTransactions ? (
            <RecentTransactions transactions={transactions} />
          ) : (
            <EmptyState />
          )}

          {/* Budget limits section */}
          <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-primary">Budget Limits</h2>
              <BudgetSettingsModal initialBudgets={budgets} />
            </div>
            {budgets.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No budget limits set. Use &ldquo;Edit Budgets&rdquo; to add one.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {budgets.map((b) => (
                  <BudgetProgress key={b.id} budget={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
