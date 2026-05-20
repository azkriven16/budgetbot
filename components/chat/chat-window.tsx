'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatMessage, TransactionData } from '@/types/chat'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'

function makeWelcome(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hey! 👋 I'm BudgBot. Tell me what you spent or earned today — like 'spent $45 on groceries' or 'got paid $2000'.",
    createdAt: new Date(),
  }
}

const TERMINAL_STATUSES = new Set([
  'COMPLETED',
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

interface HistoryItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface RunOutput {
  intent: string
  reply: string
  record: {
    transaction?: {
      amount: string | number
      type: 'INCOME' | 'EXPENSE'
      category: string
      description?: string
    }
    newBalance?: number
  } | null
}

export function ChatWindow() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeWelcome()])
  const [pending, setPending] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/chat/history')
        if (!res.ok) return
        const json = await res.json()
        const history: ChatMessage[] = (json.data as HistoryItem[]).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(m.createdAt),
        }))
        if (history.length > 0) {
          setMessages(history)
        }
      } catch {
        // Keep welcome message on error
      }
    }
    loadHistory()
  }, [])

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  async function handleSend(content: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setPending(true)

    let runId: string | null = null

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      if (!res.ok) throw new Error('send failed')
      const json = await res.json()
      runId = json.data.runId as string
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          createdAt: new Date(),
        },
      ])
      setPending(false)
      return
    }

    let pollTicks = 0
    const MAX_POLL_TICKS = 20 // 30s at 1.5s interval

    pollRef.current = setInterval(async () => {
      pollTicks++
      if (pollTicks > MAX_POLL_TICKS) {
        stopPolling()
        setPending(false)
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "That took too long. Please try again.",
            createdAt: new Date(),
          },
        ])
        return
      }

      try {
        const res = await fetch(`/api/chat/result/${runId}`)
        if (!res.ok) return
        const json = await res.json()
        const run = json.data as { status: string; output?: RunOutput }

        if (!TERMINAL_STATUSES.has(run.status)) return

        stopPolling()
        setPending(false)

        if (run.status === 'COMPLETED' && run.output) {
          const { intent, reply, record } = run.output

          let transaction: TransactionData | undefined
          if (intent === 'transaction' && record?.transaction) {
            transaction = {
              amount: Number(record.transaction.amount),
              type: record.transaction.type,
              category: record.transaction.category,
              description: record.transaction.description ?? '',
              newBalance: record.newBalance ?? 0,
            }
            router.refresh()
          }

          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: reply,
              createdAt: new Date(),
              transaction,
            },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: "I had trouble processing that. Could you try rephrasing?",
              createdAt: new Date(),
            },
          ])
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 1500)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8.5rem)] md:h-dvh overflow-hidden">
      <MessageList messages={messages} pending={pending} />
      <ChatInput onSend={handleSend} disabled={pending} />
    </div>
  )
}
