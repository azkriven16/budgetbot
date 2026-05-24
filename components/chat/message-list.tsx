'use client'

import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: ChatMessage[]
  pending: boolean
  statusText?: string
  streamingContent?: string
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

function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-start items-end gap-2 mb-1">
      <div className="shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[78%] flex flex-col gap-1 items-start">
        <div className="px-4 py-2.5 text-sm text-primary leading-relaxed whitespace-pre-wrap bg-surface border border-default rounded-2xl rounded-tl-sm">
          {content}
          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-middle animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function MessageList({ messages, pending, statusText, streamingContent, onUndo }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending, streamingContent])

  const isStreaming = pending && !!streamingContent

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

      {/* Live streaming bubble — replaces TypingIndicator once text starts arriving */}
      {isStreaming && <StreamingBubble content={streamingContent} />}

      {/* Rotating indicator — shown only before any text has streamed in */}
      {pending && !isStreaming && (
        <div className="flex justify-start items-end gap-2 pt-1">
          <div className="shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <TypingIndicator status={statusText} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
