'use client'

import { useRouter, usePathname } from 'next/navigation'
import { CATEGORY_IDS } from '@/lib/categories'

function generateMonths(): { value: string; label: string }[] {
  const months = []
  const now = new Date()
  for (let i = 0; i < 13; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}

const MONTHS = generateMonths()
const selectClass =
  'h-9 px-3 rounded-xl border border-default bg-surface text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent'

interface TransactionFiltersProps {
  month: string
  category?: string
  type?: string
}

export function TransactionFilters({ month, category, type }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string | undefined) {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const typeValue = type === 'INCOME' || type === 'EXPENSE' ? type : 'ALL'

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={month}
        onChange={e => update('month', e.target.value)}
        className={selectClass}
      >
        {MONTHS.map(m => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={category ?? ''}
        onChange={e => update('category', e.target.value || undefined)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {CATEGORY_IDS.map(id => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      <div className="flex rounded-xl border border-default bg-surface overflow-hidden">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map(t => (
          <button
            key={t}
            onClick={() => update('type', t === 'ALL' ? undefined : t)}
            className={`h-9 px-3 text-sm font-medium transition-colors ${
              typeValue === t
                ? 'bg-accent text-primary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
          </button>
        ))}
      </div>
    </div>
  )
}
