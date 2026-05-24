'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { CATEGORY_IDS, getCategory } from '@/lib/categories'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BudgetStatus {
  id: string
  category: string
  limitAmount: number
  spentAmount: number
  percentage: number
}

type ConfirmAction =
  | { type: 'clear-chat' }
  | { type: 'clear-txn'; range: 'today' | 'week' | 'month' | 'all'; label: string }

const RANGE_OPTIONS: { range: 'today' | 'week' | 'month' | 'all'; label: string; desc: string }[] = [
  { range: 'today',  label: 'Today',        desc: "transactions from today" },
  { range: 'week',   label: 'Last 7 days',  desc: "transactions from the last 7 days" },
  { range: 'month',  label: 'Last 30 days', desc: "transactions from the last 30 days" },
  { range: 'all',    label: 'All time',     desc: "all transactions" },
]

export function PreferencesView() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [acting, setActing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/budgets')
      .then((r) => r.json())
      .then((j) => setBudgets(j.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (editingCategory) inputRef.current?.focus()
  }, [editingCategory])

  function startEdit(category: string, current?: number) {
    setEditingCategory(category)
    setEditValue(current ? String(current) : '')
  }

  function cancelEdit() {
    setEditingCategory(null)
    setEditValue('')
  }

  async function saveEdit(category: string) {
    const amount = parseFloat(editValue)
    if (isNaN(amount) || amount <= 0) { cancelEdit(); return }
    setSaving(category)
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limitAmount: amount }),
      })
      if (res.ok) {
        const json = await res.json()
        setBudgets((prev) => {
          const existing = prev.find((b) => b.category === category)
          if (existing) {
            return prev.map((b) =>
              b.category === category ? { ...b, limitAmount: amount, id: json.data.id } : b,
            )
          }
          return [...prev, { id: json.data.id, category, limitAmount: amount, spentAmount: 0, percentage: 0 }]
        })
      }
    } finally {
      setSaving(null)
      cancelEdit()
    }
  }

  async function deleteBudget(id: string, category: string) {
    setSaving(category)
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setSaving(null)
    }
  }

  async function handleConfirm() {
    if (!confirm) return
    setActing(true)
    try {
      if (confirm.type === 'clear-chat') {
        await fetch('/api/chat/sessions', { method: 'DELETE' })
        router.push('/chat')
      } else {
        await fetch(`/api/transactions/bulk?range=${confirm.range}`, { method: 'DELETE' })
        router.refresh()
      }
    } finally {
      setActing(false)
      setConfirm(null)
    }
  }

  const budgetMap = new Map(budgets.map((b) => [b.category, b]))
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-primary">Preferences</h1>

      {/* Budget Limits */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">Budget Limits</h2>
          <p className="text-xs text-muted mt-0.5">Monthly spending limits per category</p>
        </div>

        <div className="flex flex-col gap-1.5">
          {CATEGORY_IDS.map((cat) => {
            const { icon: Icon, color, dim } = getCategory(cat)
            const budget = budgetMap.get(cat)
            const isEditing = editingCategory === cat
            const isSaving = saving === cat

            return (
              <div
                key={cat}
                className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-xl border border-default"
              >
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ backgroundColor: dim }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </span>

                <span className="flex-1 text-sm font-medium text-primary">{cat}</span>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">$</span>
                    <input
                      ref={inputRef}
                      type="number"
                      min="1"
                      step="any"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(cat)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="w-24 text-sm border border-default rounded-lg px-2 py-1 bg-base text-primary outline-none focus:ring-1 focus:ring-accent"
                      placeholder="0"
                    />
                    <button
                      onClick={() => saveEdit(cat)}
                      disabled={isSaving}
                      className="p-1 rounded-md text-income hover:bg-income/10 transition-colors disabled:opacity-40"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-md text-muted hover:bg-subtle transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : budget ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-primary">
                      {fmt.format(budget.limitAmount)}
                    </span>
                    <span className="text-xs text-muted">
                      {budget.percentage}% used
                    </span>
                    <button
                      onClick={() => startEdit(cat, budget.limitAmount)}
                      disabled={isSaving}
                      className="p-1 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors disabled:opacity-40"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteBudget(budget.id, cat)}
                      disabled={isSaving}
                      className="p-1 rounded-md text-muted hover:text-expense hover:bg-expense-dim transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-xs text-muted hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent-dim"
                  >
                    + Set limit
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Data Management */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">Data Management</h2>
          <p className="text-xs text-muted mt-0.5">Permanently remove data — cannot be undone</p>
        </div>

        {/* Clear chat */}
        <div className="flex items-center justify-between px-3 py-3 bg-surface rounded-xl border border-default">
          <div>
            <p className="text-sm font-medium text-primary">Chat history</p>
            <p className="text-xs text-muted">Delete all sessions and messages</p>
          </div>
          <button
            onClick={() => setConfirm({ type: 'clear-chat' })}
            className="text-xs font-medium text-expense hover:bg-expense-dim px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Clear transactions */}
        <div className="flex flex-col gap-2 px-3 py-3 bg-surface rounded-xl border border-default">
          <div>
            <p className="text-sm font-medium text-primary">Transactions</p>
            <p className="text-xs text-muted mb-3">Delete transactions by time range</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {RANGE_OPTIONS.map(({ range, label }) => (
              <button
                key={range}
                onClick={() =>
                  setConfirm({
                    type: 'clear-txn',
                    range,
                    label: RANGE_OPTIONS.find((o) => o.range === range)!.desc,
                  })
                }
                className="text-xs font-medium text-expense hover:bg-expense-dim px-3 py-2 rounded-lg border border-default transition-colors text-left"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Confirmation dialog */}
      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-expense shrink-0" />
              Are you sure?
            </DialogTitle>
            <DialogDescription>
              {confirm?.type === 'clear-chat'
                ? 'This will permanently delete all your chat sessions and messages. This cannot be undone.'
                : `This will permanently delete ${confirm?.label}. Your balance will be recalculated automatically.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={acting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={acting}
            >
              {acting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
