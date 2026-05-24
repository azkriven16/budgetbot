'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getCategory } from '@/lib/categories'

export interface CalendarTransaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string | null
  date: string
}

interface Props {
  year: number
  month: number // 0-indexed
  byDay: Record<string, CalendarTransaction[]>
  monthIncome: number
  monthExpense: number
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function CalendarView({ year, month, byDay, monthIncome, monthExpense }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const grid = buildGrid(year, month)
  const today = new Date()

  const navigate = useCallback(
    (dir: -1 | 1) => {
      let y = year
      let m = month + dir
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      const param = `${y}-${String(m + 1).padStart(2, '0')}`
      router.push(`/calendar?month=${param}`)
      setSelected(null)
    },
    [year, month, router],
  )

  const selectedTxns = selected ? (byDay[selected] ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Calendar</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-income font-semibold">{fmt.format(monthIncome)}</span>
          <span className="text-muted">·</span>
          <span className="text-expense font-semibold">{fmt.format(monthExpense)}</span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-subtle transition-colors text-muted hover:text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-primary">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-lg hover:bg-subtle transition-colors text-muted hover:text-primary"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, i) => {
              if (day === null) return <div key={i} />
              const key = toKey(year, month, day)
              const txns = byDay[key] ?? []
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day
              const isSelected = selected === key
              const income = txns
                .filter((t) => t.type === 'INCOME')
                .reduce((s, t) => s + t.amount, 0)
              const expense = txns
                .filter((t) => t.type === 'EXPENSE')
                .reduce((s, t) => s + t.amount, 0)

              return (
                <button
                  key={key}
                  onClick={() => setSelected(isSelected ? null : key)}
                  className={`flex flex-col items-center py-2 px-0.5 rounded-xl transition-colors min-h-14 ${
                    isSelected
                      ? 'bg-accent-dim ring-1 ring-accent'
                      : isToday
                      ? 'bg-subtle'
                      : 'hover:bg-subtle'
                  }`}
                >
                  <span
                    className={`text-xs font-medium leading-none ${
                      isToday ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {day}
                  </span>
                  {txns.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1.5 w-full px-1">
                      {income > 0 && (
                        <span className="text-[9px] font-mono text-income leading-none truncate text-center">
                          +{fmt.format(income)}
                        </span>
                      )}
                      {expense > 0 && (
                        <span className="text-[9px] font-mono text-expense leading-none truncate text-center">
                          −{fmt.format(expense)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop day detail panel */}
        {selected && (
          <div className="hidden md:flex w-72 shrink-0 flex-col bg-surface border border-default rounded-2xl overflow-hidden self-start">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default">
              <span className="text-sm font-semibold text-primary">
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="overflow-y-auto p-2 flex flex-col gap-1.5 max-h-96">
              {selectedTxns.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">No transactions</p>
              ) : (
                selectedTxns.map((t) => <DayTxnRow key={t.id} t={t} />)
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl max-h-[70dvh] flex flex-col pb-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
              <span className="text-sm font-semibold text-primary">
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
              {selectedTxns.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">No transactions</p>
              ) : (
                selectedTxns.map((t) => <DayTxnRow key={t.id} t={t} />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DayTxnRow({ t }: { t: CalendarTransaction }) {
  const { icon: Icon, color, dim } = getCategory(t.category)
  const isIncome = t.type === 'INCOME'
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-elevated rounded-xl">
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ backgroundColor: dim }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary truncate">
          {t.description || t.category}
        </p>
        <p className="text-[10px] text-muted">{t.category}</p>
      </div>
      <span
        className={`text-xs font-mono font-semibold shrink-0 ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '−'}
        {fmt.format(t.amount)}
      </span>
    </div>
  )
}
