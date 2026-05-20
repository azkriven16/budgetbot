interface Props {
  balance: number
}

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function BalanceCard({ balance }: Props) {
  const isNegative = balance < 0
  return (
    <div className="bg-surface border border-default rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-muted mb-1">Current Balance</p>
      <p
        className={`text-5xl font-bold font-mono tracking-tight ${
          isNegative ? 'text-expense' : 'text-primary'
        }`}
      >
        {fmt.format(balance)}
      </p>
    </div>
  )
}
