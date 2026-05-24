'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { SessionItem } from './session-item'

interface Session {
  id: string
  title: string
  updatedAt: string
}

interface Props {
  currentSessionId: string
  onClose?: () => void
}

export function SessionSidebar({ currentSessionId, onClose }: Props) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (!res.ok) return
      const json = await res.json()
      setSessions(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions, currentSessionId])

  async function handleNew() {
    const res = await fetch('/api/chat/sessions', { method: 'POST' })
    if (!res.ok) return
    const json = await res.json()
    router.push(`/chat/${json.data.id}`)
    onClose?.()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
    const remaining = sessions.filter((s) => s.id !== id)
    setSessions(remaining)
    if (id === currentSessionId) {
      if (remaining.length > 0) {
        router.push(`/chat/${remaining[0].id}`)
      } else {
        const res = await fetch('/api/chat/sessions', { method: 'POST' })
        const json = await res.json()
        router.push(`/chat/${json.data.id}`)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-elevated">
      <div className="flex items-center justify-between px-3 py-3 border-b border-default shrink-0">
        <span className="text-sm font-semibold text-primary">Chats</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNew}
            title="New chat"
            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors"
          >
            <Plus size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors md:hidden"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex flex-col gap-1 px-2 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-subtle animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-muted px-4 py-4">No chats yet.</p>
        ) : (
          sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              active={s.id === currentSessionId}
              onDelete={handleDelete}
              onNavigate={() => {
                router.push(`/chat/${s.id}`)
                onClose?.()
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
