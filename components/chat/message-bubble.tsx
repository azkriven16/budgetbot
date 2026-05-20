'use client'

import type { ChatMessage } from '@/types/chat'

interface MessageBubbleProps {
  message: ChatMessage
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`px-4 py-2.5 text-sm text-primary leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent-dim rounded-2xl rounded-tr-sm'
              : 'bg-surface border border-default rounded-2xl rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted px-1">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
