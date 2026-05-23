import type { GoalWithProgress } from '@/lib/goals'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface Props {
  goal: GoalWithProgress
}

export function GoalCard({ goal }: Props) {
  const { name, emoji, currentAmount, targetAmount, percentage, isCompleted } = goal

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {emoji && (
            <span className="text-xl shrink-0" aria-hidden="true">
              {emoji}
            </span>
          )}
          <h2 className="text-sm font-semibold text-primary truncate">{name}</h2>
        </div>
        {isCompleted && (
          <span className="shrink-0 text-xs bg-income-dim text-income px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            ✅ Done
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-primary font-medium">{fmt.format(currentAmount)}</span>
          <span className="text-muted">{fmt.format(targetAmount)}</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-subtle overflow-hidden">
          <div
            className="h-full rounded-full transition-all bg-accent"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1.5 text-right">{percentage}%</p>
      </div>
    </div>
  )
}
