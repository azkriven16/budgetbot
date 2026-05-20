import { MessageCircle } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="bg-surface border border-default rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-dim">
        <MessageCircle size={28} className="text-accent" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary mb-1">No transactions yet</p>
        <p className="text-sm text-muted">
          Start by telling BudgBot what you spent today 💛
        </p>
      </div>
    </div>
  )
}
