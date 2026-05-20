'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_IDS, getCategory } from '@/lib/categories'
import type { BudgetStatus } from '@/lib/budgets'

interface Props {
  initialBudgets: BudgetStatus[]
}

export function BudgetSettingsModal({ initialBudgets }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // inputs: category → raw string value
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const b of initialBudgets) map[b.category] = String(b.limitAmount)
    return map
  })

  // ids: category → budget id (present only when budget exists)
  const [ids, setIds] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const b of initialBudgets) map[b.category] = b.id
    return map
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSave(category: string) {
    const raw = inputs[category]?.trim()
    const amount = parseFloat(raw ?? '')
    if (!raw || isNaN(amount) || amount <= 0) {
      setErrors((e) => ({ ...e, [category]: 'Enter a valid amount' }))
      return
    }
    setErrors((e) => ({ ...e, [category]: '' }))

    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, limitAmount: amount }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErrors((e) => ({ ...e, [category]: json.error ?? 'Save failed' }))
      return
    }

    const json = await res.json()
    setIds((prev) => ({ ...prev, [category]: json.data.id }))
    startTransition(() => router.refresh())
  }

  async function handleRemove(category: string) {
    const id = ids[category]
    if (!id) return

    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    if (!res.ok) return

    setIds((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
    setInputs((prev) => ({ ...prev, [category]: '' }))
    startTransition(() => router.refresh())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted" />
        }
      >
        <Settings className="h-4 w-4" />
        Edit Budgets
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget Limits</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {CATEGORY_IDS.map((cat) => {
            const config = getCategory(cat)
            const Icon = config.icon
            const hasExisting = !!ids[cat]
            const err = errors[cat]

            return (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 h-5 w-5" style={{ color: config.color }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-primary w-28 shrink-0">{cat}</span>
                  <Input
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    placeholder="No limit"
                    value={inputs[cat] ?? ''}
                    onChange={(e) => {
                      setInputs((prev) => ({ ...prev, [cat]: e.target.value }))
                      setErrors((prev) => ({ ...prev, [cat]: '' }))
                    }}
                    className="h-8 text-sm rounded-xl flex-1"
                    disabled={isPending}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSave(cat)}
                    disabled={isPending}
                    className="rounded-xl shrink-0"
                  >
                    Set
                  </Button>
                  {hasExisting && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(cat)}
                      disabled={isPending}
                      className="rounded-xl shrink-0 text-muted hover:text-error"
                    >
                      ×
                    </Button>
                  )}
                </div>
                {err && <p className="text-xs text-error pl-7">{err}</p>}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
