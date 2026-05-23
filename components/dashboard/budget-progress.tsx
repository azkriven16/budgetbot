import { getCategory } from '@/lib/categories'
import type { BudgetStatus } from '@/lib/budgets'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function indicatorClass(percentage: number) {
  if (percentage >= 100) return 'bg-error'
  if (percentage >= 80) return 'bg-warning'
  return 'bg-income'
}

interface Props {
  budget: BudgetStatus
}

export function BudgetProgress({ budget }: Props) {
  const { category, limitAmount, spentAmount, percentage } = budget
  const cat = getCategory(category)
  const Icon = cat.icon
  const clamped = Math.min(percentage, 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 h-5 w-5" style={{ color: cat.color }}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-primary truncate">{category}</span>
        </div>
        <span className="text-xs text-muted whitespace-nowrap shrink-0">
          {fmt.format(spentAmount)} / {fmt.format(limitAmount)}
        </span>
      </div>
      {/* Plain div track — avoids double-render bug in the Progress wrapper component */}
      <div className="relative h-1.5 w-full rounded-full bg-subtle overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${indicatorClass(percentage)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
