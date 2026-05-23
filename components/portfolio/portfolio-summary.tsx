const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

interface Props {
  totalInvested: number
  holdingCount: number
}

export function PortfolioSummary({ totalInvested, holdingCount }: Props) {
  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-muted mb-1">Total Invested (Cost Basis)</p>
      <p className="text-3xl font-bold text-primary">{fmt.format(totalInvested)}</p>
      <p className="text-xs text-muted mt-1">
        {holdingCount} position{holdingCount !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
