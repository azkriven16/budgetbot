import type { InvestmentRecord } from '@/lib/investments'

const fmtCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})
const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

interface Props {
  records: InvestmentRecord[]
}

export function InvestmentHistory({ records }: Props) {
  return (
    <div className="bg-surface border border-default rounded-2xl overflow-hidden divide-y divide-default">
      {records.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                r.action === 'BUY' ? 'bg-income-dim text-income' : 'bg-expense-dim text-expense'
              }`}
            >
              {r.action}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">{r.ticker}</p>
              <p className="text-xs text-muted">
                {r.shares} share{r.shares !== 1 ? 's' : ''} @ {fmtCurrency.format(r.pricePerShare)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium text-primary">
              {fmtCurrency.format(r.shares * r.pricePerShare)}
            </p>
            <p className="text-xs text-muted">{fmtDate.format(new Date(r.date))}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
