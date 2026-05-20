'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getCategory } from '@/lib/categories'

interface Props {
  data: { category: string; total: number }[]
}

export function SpendingChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="bg-surface border border-default rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-medium text-secondary mb-4">Spending by Category</h3>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-muted">No spending data this month</p>
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                dataKey="total"
                nameKey="category"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={getCategory(entry.category).color}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-muted">Total</p>
            <p className="text-lg font-bold font-mono text-primary">
              ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {data.map((d) => (
            <span key={d.category} className="flex items-center gap-1 text-xs text-secondary">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategory(d.category).color }}
              />
              {d.category}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
