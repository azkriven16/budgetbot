'use client'

import { useUser } from '@clerk/nextjs'
import { Bot } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { TransactionCard } from './transaction-card'

interface MessageBubbleProps {
  message: ChatMessage
  onUndo?: (messageId: string, transactionId: string) => Promise<void>
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function BotAvatar() {
  return (
    <div className="shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
  )
}

function UserAvatar() {
  const { user } = useUser()
  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?'

  if (user?.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt="You"
        className="shrink-0 w-7 h-7 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="shrink-0 w-7 h-7 rounded-full bg-subtle flex items-center justify-center">
      <span className="text-xs font-semibold text-primary uppercase">{initials}</span>
    </div>
  )
}

export function MessageBubble({ message, onUndo }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2 mb-1">
        <div className="max-w-[78%] flex flex-col gap-1 items-end">
          <div className="px-4 py-2.5 text-sm text-primary leading-relaxed whitespace-pre-wrap bg-accent-dim rounded-2xl rounded-tr-sm">
            {message.content}
          </div>
          <span className="text-xs text-muted px-1">{formatTime(message.createdAt)}</span>
        </div>
        <UserAvatar />
      </div>
    )
  }

  return (
    <div className="flex justify-start items-end gap-2 mb-1">
      <BotAvatar />
      <div className="max-w-[78%] flex flex-col gap-1 items-start">
        <div className="px-4 py-2.5 text-sm text-primary leading-relaxed whitespace-pre-wrap bg-surface border border-default rounded-2xl rounded-tl-sm">
          {message.content}
          {message.transaction && (
            <TransactionCard
              {...message.transaction}
              onUndo={
                message.transaction.transactionId && onUndo
                  ? () => onUndo(message.id, message.transaction!.transactionId!)
                  : undefined
              }
            />
          )}
        </div>
        <span className="text-xs text-muted px-1">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
