import { getCategory } from '@/lib/categories'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface TransactionCardProps {
  category: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  newBalance: number
}

export function TransactionCard({
  category,
  description,
  amount,
  type,
  newBalance,
}: TransactionCardProps) {
  const isIncome = type === 'INCOME'
  const { icon: Icon, color, dim } = getCategory(category)

  return (
    <div className="mt-2 p-3 bg-elevated rounded-xl border border-default flex items-center gap-3">
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ backgroundColor: dim }}
      >
        <Icon size={16} style={{ color }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{description}</p>
        <p className="text-xs text-muted">Balance: {fmt.format(newBalance)}</p>
      </div>
      <span
        className={`text-sm font-mono font-semibold shrink-0 ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '-'}
        {fmt.format(amount)}
      </span>
    </div>
  )
}
