'use client'

import { useEffect, useState } from 'react'
import { Bell, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Reminder {
  id: string
  message: string
  recurrence: string
  nextDueAt: string
}

export function RemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/reminders')
      .then((r) => r.json())
      .then((j) => setReminders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  async function handleDelete(id: string) {
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="border-b border-default shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Bell size={13} />
          Reminders
          {open && reminders.length > 0 ? ` (${reminders.length})` : ''}
        </span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="px-4 pb-3">
          {loading && <p className="text-xs text-muted py-1">Loading…</p>}
          {!loading && reminders.length === 0 && (
            <p className="text-xs text-muted py-1">
              No active reminders. Try "remind me to invest $100 on the 1st".
            </p>
          )}
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-2 py-1.5 border-t border-default first:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary truncate">{r.message}</p>
                <p className="text-[10px] text-muted">
                  Next:{' '}
                  {new Date(r.nextDueAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="shrink-0 text-muted hover:text-expense transition-colors"
                title="Delete reminder"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
