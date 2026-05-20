import type { LucideIcon } from 'lucide-react'

interface TransactionCardProps {
  categoryIcon: LucideIcon
  description: string
  amount: number
  type: 'income' | 'expense'
}

export function TransactionCard({
  categoryIcon: Icon,
  description,
  amount,
  type,
}: TransactionCardProps) {
  const isIncome = type === 'income'

  return (
    <div className="mt-2 p-3 bg-elevated rounded-xl border border-default flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isIncome ? 'bg-income-dim' : 'bg-expense-dim'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{description}</p>
        <p className="text-xs text-muted">Added to your balance</p>
      </div>
      <span
        className={`text-sm font-mono font-semibold shrink-0 ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '-'}${amount.toFixed(2)}
      </span>
    </div>
  )
}
