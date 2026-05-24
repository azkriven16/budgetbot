'use client'

import { Trash2, Pencil } from 'lucide-react'
import { getCategory } from '@/lib/categories'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export interface SerializedTransaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string | null
  date: string
}

interface TransactionItemProps {
  transaction: SerializedTransaction
  onDelete: (id: string) => void
  onEdit: (transaction: SerializedTransaction) => void
  isDeleting: boolean
}

export function TransactionItem({ transaction, onDelete, onEdit, isDeleting }: TransactionItemProps) {
  const { icon: Icon, color, dim } = getCategory(transaction.category)
  const isIncome = transaction.type === 'INCOME'
  const time = new Date(transaction.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-surface rounded-2xl border border-default transition-opacity ${
        isDeleting ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <span
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: dim }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">
          {transaction.description || transaction.category}
        </p>
        <p className="text-xs text-muted">{time}</p>
      </div>

      <span
        className={`text-sm font-mono font-semibold shrink-0 ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '−'}{fmt.format(transaction.amount)}
      </span>

      <button
        onClick={() => onEdit(transaction)}
        disabled={isDeleting}
        aria-label="Edit transaction"
        className="ml-1 p-1.5 rounded-lg text-muted hover:text-primary hover:bg-subtle transition-colors disabled:opacity-40"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={() => onDelete(transaction.id)}
        disabled={isDeleting}
        aria-label="Delete transaction"
        className="p-1.5 rounded-lg text-muted hover:text-expense hover:bg-expense-dim transition-colors disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
