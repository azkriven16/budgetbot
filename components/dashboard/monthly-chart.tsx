'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface Props {
  data: { month: string; income: number; expenses: number }[]
}

const usd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function MonthlyChart({ data }: Props) {
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="bg-surface border border-default rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-medium text-secondary mb-4">Income vs Expenses</h3>
      {!hasData ? (
        <div className="h-50 flex items-center justify-center">
          <p className="text-sm text-muted">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={2} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-default)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={usd}
              width={52}
            />
            <Tooltip formatter={(v) => usd(Number(v))} />
            <Bar dataKey="income" name="Income" fill="var(--state-income)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--state-expense)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
