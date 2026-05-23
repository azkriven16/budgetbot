import { TrendingUp } from 'lucide-react'
import type { Holding } from '@/lib/investments'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

interface Props {
  holding: Holding
}

export function HoldingCard({ holding }: Props) {
  const { ticker, companyName, totalShares, totalCost, averageCostPerShare } = holding

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-accent shrink-0" />
        <h2 className="text-lg font-bold text-primary">{ticker}</h2>
      </div>
      {companyName && <p className="text-xs text-muted -mt-2 truncate">{companyName}</p>}
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Shares</span>
          <span className="text-primary font-medium">{totalShares}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Avg. Cost</span>
          <span className="text-primary font-medium">{fmt.format(averageCostPerShare)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total Cost</span>
          <span className="text-primary font-medium">{fmt.format(totalCost)}</span>
        </div>
      </div>
    </div>
  )
}
