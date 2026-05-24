'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TransactionForm, TransactionFormState, EMPTY_FORM } from './transaction-form'

export function AddTransactionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<TransactionFormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(next: TransactionFormState) {
    setForm(next)
    setError('')
  }

  function reset() {
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount'); return }
    if (!form.date) { setError('Select a date'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: form.type,
          category: form.category,
          description: form.description.trim() || undefined,
          date: form.date,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to add transaction')
        return
      }
      setOpen(false)
      reset()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger render={<Button size="sm" className="rounded-xl gap-1.5" />}>
        <Plus className="h-4 w-4" />
        Add
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          form={form}
          error={error}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => { setOpen(false); reset() }}
          submitLabel="Add Transaction"
        />
      </DialogContent>
    </Dialog>
  )
}
