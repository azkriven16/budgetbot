'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FormState {
  name: string
  targetAmount: string
  emoji: string
}

const EMPTY: FormState = { name: '', targetAmount: '', emoji: '' }

interface Props {
  label?: string
}

export function NewGoalDialog({ label = 'New Goal' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = form.name.trim()
    const amount = parseFloat(form.targetAmount)
    if (!name) { setError('Name is required'); return }
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid target amount'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, targetAmount: amount, emoji: form.emoji.trim() || undefined }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to create goal')
        return
      }
      setOpen(false)
      setForm(EMPTY)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="rounded-xl" />}>
        {label}
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle>New Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="🎯"
              value={form.emoji}
              onChange={field('emoji')}
              className="w-16 text-center text-lg rounded-xl shrink-0"
              maxLength={8}
              disabled={loading}
            />
            <Input
              placeholder="Goal name"
              value={form.name}
              onChange={field('name')}
              className="rounded-xl flex-1"
              maxLength={100}
              disabled={loading}
              autoFocus
            />
          </div>
          <Input
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            placeholder="Target amount ($)"
            value={form.targetAmount}
            onChange={field('targetAmount')}
            className="rounded-xl"
            disabled={loading}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <Button type="submit" disabled={loading} className="rounded-xl w-full mt-1">
            {loading ? 'Creating…' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
