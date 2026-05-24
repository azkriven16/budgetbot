import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { getUserTransactions } from '@/lib/transactions'
import { CATEGORY_IDS } from '@/lib/categories'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { TransactionList } from '@/components/transactions/transaction-list'
import { TransactionEmpty } from '@/components/transactions/transaction-empty'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import type { TransactionType } from '@/app/generated/prisma/client'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface PageProps {
  searchParams: Promise<{ month?: string; category?: string; type?: string }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const params = await searchParams
  const monthRegex = /^\d{4}-\d{2}$/
  const month =
    params.month && monthRegex.test(params.month) ? params.month : currentMonth()
  const type: TransactionType | undefined =
    params.type === 'INCOME' || params.type === 'EXPENSE' ? params.type : undefined
  const category = CATEGORY_IDS.includes(params.category as (typeof CATEGORY_IDS)[number])
    ? params.category
    : undefined

  const user = await getOrCreateUser(clerkId)
  const { transactions } = await getUserTransactions(user.id, {
    month,
    category,
    type,
    limit: 500,
  })

  const serialized = transactions.map(t => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type as 'INCOME' | 'EXPENSE',
    category: t.category,
    description: t.description,
    date: t.date.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Transactions</h1>
        <AddTransactionDialog />
      </div>
      <TransactionFilters month={month} category={category} type={params.type} />
      {serialized.length === 0 ? (
        <TransactionEmpty />
      ) : (
        <TransactionList transactions={serialized} />
      )}
    </div>
  )
}
