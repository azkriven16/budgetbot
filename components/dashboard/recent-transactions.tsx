import { getCategory } from '@/lib/categories'
import type { RecentTransaction } from '@/lib/dashboard'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="bg-surface border border-default rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-default">
        <h3 className="text-sm font-medium text-secondary">Recent Transactions</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-10 flex items-center justify-center">
          <p className="text-sm text-muted">No transactions yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-default">
          {transactions.map((t) => {
            const cat = getCategory(t.category)
            const Icon = cat.icon
            return (
              <li key={t.id} className="flex items-center gap-3 px-6 py-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ backgroundColor: cat.dim }}
                >
                  <Icon size={16} style={{ color: cat.color }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {t.description ?? t.category}
                  </p>
                  <p className="text-xs text-muted">{t.category} · {formatDate(t.date)}</p>
                </div>
                <p
                  className={`text-sm font-mono font-medium shrink-0 ${
                    t.type === 'INCOME' ? 'text-income' : 'text-expense'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}{fmt.format(t.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
