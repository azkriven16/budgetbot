'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Session {
  id: string
  title: string
  updatedAt: string
}

interface Props {
  session: Session
  active: boolean
  onDelete: (id: string) => Promise<void>
  onNavigate: () => void
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function SessionItem({ session, active, onDelete, onNavigate }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (deleting) return
    setDeleting(true)
    try {
      await onDelete(session.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate()}
      className={`group flex items-center gap-2 px-2 py-2 mx-1 rounded-md cursor-pointer transition-colors ${
        active
          ? 'bg-accent-dim text-primary'
          : 'text-muted hover:bg-subtle hover:text-primary'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-tight">{session.title}</p>
        <p className="text-[10px] text-muted mt-0.5">{relativeTime(session.updatedAt)}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete chat"
        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-muted hover:text-expense transition-all disabled:opacity-40"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
