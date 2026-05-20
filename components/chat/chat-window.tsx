'use client'

import { useState, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hey! 👋 I'm BudgBot. Tell me what you spent or earned today — like 'spent $45 on groceries' or 'got paid $2000'.",
        createdAt: new Date(),
      },
    ])
  }, [])

  function handleSend(content: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setPending(true)

    setTimeout(() => {
      const echoMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Got it! You said: "${content}"`,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, echoMsg])
      setPending(false)
    }, 1200)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8.5rem)] md:h-dvh overflow-hidden">
      <MessageList messages={messages} pending={pending} />
      <ChatInput onSend={handleSend} disabled={pending} />
    </div>
  )
}
