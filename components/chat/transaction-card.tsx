'use client'

import { useState } from 'react'
import { Undo2 } from 'lucide-react'
import { getCategory } from '@/lib/categories'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface TransactionCardProps {
  transactionId?: string
  category: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  newBalance: number
  onUndo?: () => Promise<void>
}

export function TransactionCard({
  category,
  description,
  amount,
  type,
  newBalance,
  onUndo,
}: TransactionCardProps) {
  const isIncome = type === 'INCOME'
  const { icon: Icon, color, dim } = getCategory(category)
  const [undoing, setUndoing] = useState(false)
  const [undone, setUndone] = useState(false)

  async function handleUndo() {
    if (!onUndo || undoing) return
    setUndoing(true)
    try {
      await onUndo()
      setUndone(true)
    } finally {
      setUndoing(false)
    }
  }

  if (undone) {
    return (
      <div className="mt-2 p-3 bg-elevated rounded-xl border border-default text-xs text-muted text-center">
        Transaction undone
      </div>
    )
  }

  return (
    <div className="mt-2 bg-elevated rounded-xl border border-default overflow-hidden">
      <div className="p-3 flex items-center gap-3">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ backgroundColor: dim }}
        >
          <Icon size={16} style={{ color }} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{description || category}</p>
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
      {onUndo && (
        <button
          onClick={handleUndo}
          disabled={undoing}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted hover:text-primary border-t border-default transition-colors disabled:opacity-50"
        >
          <Undo2 size={11} />
          {undoing ? 'Undoing…' : 'Undo'}
        </button>
      )}
    </div>
  )
}
