'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { navItems } from '@/lib/nav'
import { SessionItem } from '@/components/chat/session-item'

interface Session {
  id: string
  title: string
  updatedAt: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const currentSessionId = pathname.startsWith('/chat')
    ? pathname.split('/chat/')[1]?.split('/')[0]
    : undefined

  const [sessions, setSessions] = useState<Session[]>([])

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (res.ok) {
        const json = await res.json()
        setSessions(json.data)
      }
    } catch { /* fail silently */ }
  }, [])

  // Load on mount and whenever we navigate (session title updates after first message)
  useEffect(() => {
    loadSessions()
  }, [loadSessions, pathname])

  async function handleNew() {
    const res = await fetch('/api/chat/sessions', { method: 'POST' })
    if (!res.ok) return
    const json = await res.json()
    router.push(`/chat/${json.data.id}`)
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
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-default z-40">
      <div className="flex items-center h-16 px-6 border-b border-default shrink-0">
        <span className="text-xl font-bold text-primary tracking-tight">BudgBot</span>
      </div>

      <nav className="flex flex-col gap-1 p-3 shrink-0">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent-dim text-accent'
                  : 'text-secondary hover:bg-elevated hover:text-primary'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Chat history — always visible */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-default">
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">History</span>
          <button
            onClick={handleNew}
            title="New chat"
            className="p-1 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted px-4 py-2">No chats yet.</p>
          ) : (
            sessions.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                active={s.id === currentSessionId}
                onDelete={handleDelete}
                onNavigate={() => router.push(`/chat/${s.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-default shrink-0">
        <UserButton />
      </div>
    </aside>
  )
}
