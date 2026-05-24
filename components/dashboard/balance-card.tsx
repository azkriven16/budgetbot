'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  balance: number
}

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function BalanceCard({ balance }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isNegative = balance < 0

  function startEdit() {
    setValue(String(balance))
    setError('')
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setError('')
  }

  async function save() {
    const amount = parseFloat(value)
    if (isNaN(amount) || amount < 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/balance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: amount }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to update')
        return
      }
      setEditing(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  return (
    <div className="bg-surface border border-default rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted">Current Balance</p>
        {!editing && (
          <button
            onClick={startEdit}
            aria-label="Edit balance"
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-subtle transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              onKeyDown={handleKey}
              className="rounded-xl font-mono text-lg"
              autoFocus
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={save}
              disabled={loading}
              className="rounded-xl shrink-0"
              aria-label="Save balance"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancel}
              disabled={loading}
              className="rounded-xl shrink-0 text-muted"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      ) : (
        <p
          className={`text-5xl font-bold font-mono tracking-tight ${
            isNegative ? 'text-expense' : 'text-primary'
          }`}
        >
          {fmt.format(balance)}
        </p>
      )}
    </div>
  )
}
