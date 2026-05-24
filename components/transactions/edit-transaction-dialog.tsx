'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TransactionForm, TransactionFormState } from './transaction-form'
import type { SerializedTransaction } from './transaction-item'

interface Props {
  transaction: SerializedTransaction
  open: boolean
  onClose: () => void
}

function toFormState(t: SerializedTransaction): TransactionFormState {
  return {
    amount: String(t.amount),
    type: t.type,
    category: t.category,
    description: t.description ?? '',
    date: new Date(t.date).toISOString().slice(0, 10),
  }
}

export function EditTransactionDialog({ transaction, open, onClose }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<TransactionFormState>(() => toFormState(transaction))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(next: TransactionFormState) {
    setForm(next)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount'); return }
    if (!form.date) { setError('Select a date'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
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
        setError(json.error ?? 'Failed to update transaction')
        return
      }
      onClose()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          form={form}
          error={error}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  )
}
