'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PanelLeft } from 'lucide-react'
import type { ChatMessage, TransactionData } from '@/types/chat'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { RemindersPanel } from './RemindersPanel'

function makeWelcome(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hey! 👋 I'm BudgBot. Tell me what you spent or earned today — like 'spent $45 on groceries' or 'got paid $2000'.",
    createdAt: new Date(),
  }
}

interface HistoryItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: { transactionId?: string } | null
  createdAt: string
}

type SseEvent =
  | { type: 'status'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'reply'; content: string; intent: string; transaction?: TransactionData }
  | { type: 'error'; message: string }

interface Props {
  sessionId: string
  onOpenSessions?: () => void
}

export function ChatWindow({ sessionId, onOpenSessions }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeWelcome()])
  const [pending, setPending] = useState(false)
  const [statusText, setStatusText] = useState<string | undefined>(undefined)
  const [streamingContent, setStreamingContent] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMessages([makeWelcome()])
    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat/sessions/${sessionId}/messages`)
        if (!res.ok) return
        const json = await res.json()
        const history: ChatMessage[] = (json.data as HistoryItem[]).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(m.createdAt),
          transaction:
            m.metadata?.transactionId
              ? { transactionId: m.metadata.transactionId } as TransactionData
              : undefined,
        }))
        if (history.length > 0) setMessages(history)
      } catch {
        // keep welcome message on error
      }
    }
    loadHistory()
  }, [sessionId])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function handleUndo(messageId: string, transactionId: string) {
    const res = await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('undo failed')
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, transaction: undefined } : m)),
    )
    router.refresh()
  }

  async function handleSend(content: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setPending(true)
    setStatusText(undefined)
    setStreamingContent('')

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) throw new Error('stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue

          let event: SseEvent
          try {
            event = JSON.parse(line.slice('data: '.length))
          } catch {
            continue
          }

          if (event.type === 'status') {
            setStatusText(event.text)
            setStreamingContent('')
          } else if (event.type === 'chunk') {
            setStatusText(undefined)
            setStreamingContent(event.text)
          } else if (event.type === 'reply') {
            const needsRefresh =
              event.intent === 'transaction' || event.intent === 'correction'
            setStreamingContent('')
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: event.content,
                createdAt: new Date(),
                transaction: event.transaction as TransactionData | undefined,
              },
            ])
            if (needsRefresh) router.refresh()
          } else if (event.type === 'error') {
            setStreamingContent('')
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: event.message,
                createdAt: new Date(),
              },
            ])
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setStreamingContent('')
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          createdAt: new Date(),
        },
      ])
    } finally {
      setPending(false)
      setStatusText(undefined)
      setStreamingContent('')
      abortRef.current = null
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-default shrink-0">
        {onOpenSessions && (
          <button
            onClick={onOpenSessions}
            title="Chat sessions"
            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-subtle transition-colors md:hidden"
          >
            <PanelLeft size={16} />
          </button>
        )}
        <span className="text-sm font-semibold text-primary">BudgBot</span>
      </div>
      <RemindersPanel />
      <MessageList
        messages={messages}
        pending={pending}
        statusText={statusText}
        streamingContent={streamingContent}
        onUndo={handleUndo}
      />
      <ChatInput onSend={handleSend} disabled={pending} pending={pending} />
    </div>
  )
}
