'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORY_IDS } from '@/lib/categories'

export interface TransactionFormState {
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
  date: string
}

export const EMPTY_FORM: TransactionFormState = {
  amount: '',
  type: 'EXPENSE',
  category: 'Other',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

interface Props {
  form: TransactionFormState
  error: string
  loading: boolean
  onChange: (form: TransactionFormState) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitLabel: string
}

export function TransactionForm({ form, error, loading, onChange, onSubmit, onCancel, submitLabel }: Props) {
  function field<K extends keyof TransactionFormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({ ...form, [key]: e.target.value })
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-2">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-default">
        {(['EXPENSE', 'INCOME'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...form, type: t })}
            disabled={loading}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.type === t
                ? t === 'INCOME'
                  ? 'bg-income text-white'
                  : 'bg-expense text-white'
                : 'bg-surface text-muted hover:text-primary'
            }`}
          >
            {t === 'INCOME' ? 'Income' : 'Expense'}
          </button>
        ))}
      </div>

      <Input
        type="number"
        min="0.01"
        max="10000000"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={field('amount')}
        className="rounded-xl"
        disabled={loading}
        autoFocus
      />

      <select
        value={form.category}
        onChange={field('category')}
        disabled={loading}
        className="h-10 rounded-xl border border-default bg-surface px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {CATEGORY_IDS.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <Input
        placeholder="Description (optional)"
        value={form.description}
        onChange={field('description')}
        className="rounded-xl"
        maxLength={200}
        disabled={loading}
      />

      <Input
        type="date"
        value={form.date}
        onChange={field('date')}
        className="rounded-xl"
        disabled={loading}
      />

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-2 mt-1">
        <Button type="submit" disabled={loading} className="rounded-xl flex-1">
          {loading ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="rounded-xl">
          Cancel
        </Button>
      </div>
    </form>
  )
}
