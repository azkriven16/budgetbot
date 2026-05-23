'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: ChatMessage[]
  pending: boolean
  onUndo?: (messageId: string, transactionId: string) => Promise<void>
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDateLabel(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MessageList({ messages, pending, onUndo }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((message, index) => {
        const showDateSep =
          index === 0 || !isSameDay(message.createdAt, messages[index - 1].createdAt)
        return (
          <div key={message.id}>
            {showDateSep && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-subtle" />
                <span className="text-xs text-muted">
                  {formatDateLabel(message.createdAt)}
                </span>
                <div className="flex-1 h-px bg-subtle" />
              </div>
            )}
            <MessageBubble message={message} onUndo={onUndo} />
          </div>
        )
      })}
      {pending && (
        <div className="flex justify-start pt-1">
          <TypingIndicator />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
