'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionItem } from './transaction-item'
import { EditTransactionDialog } from './edit-transaction-dialog'
import type { SerializedTransaction } from './transaction-item'

interface Group {
  label: string
  items: SerializedTransaction[]
}

function groupByDate(transactions: SerializedTransaction[]): Group[] {
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const map = new Map<string, SerializedTransaction[]>()

  for (const t of transactions) {
    const d = new Date(t.date)
    const dateStr = d.toDateString()
    let label: string
    if (dateStr === todayStr) label = 'Today'
    else if (dateStr === yesterdayStr) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(t)
  }

  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
}

interface TransactionListProps {
  transactions: SerializedTransaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter()
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<SerializedTransaction | null>(null)

  const visible = transactions.filter(t => !deletingIds.has(t.id))
  const groups = groupByDate(visible)

  async function handleDelete(id: string) {
    setDeletingIds(prev => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setDeletingIds(prev => {
          const s = new Set(prev)
          s.delete(id)
          return s
        })
      } else {
        router.refresh()
      }
    } catch {
      setDeletingIds(prev => {
        const s = new Set(prev)
        s.delete(id)
        return s
      })
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {groups.map(group => (
          <div key={group.label} className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide px-1">
              {group.label}
            </p>
            <div className="flex flex-col gap-2">
              {group.items.map(t => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onDelete={handleDelete}
                  onEdit={setEditing}
                  isDeleting={deletingIds.has(t.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditTransactionDialog
          transaction={editing}
          open={true}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
