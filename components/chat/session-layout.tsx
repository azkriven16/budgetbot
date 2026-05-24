'use client'

import { useState } from 'react'
import { SessionSidebar } from './session-sidebar'
import { ChatWindow } from './chat-window'

interface Props {
  sessionId: string
}

export function SessionLayout({ sessionId }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] md:h-dvh overflow-hidden">
      {/* Desktop sessions sidebar */}
      <div className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-default">
        <SessionSidebar currentSessionId={sessionId} />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl">
            <SessionSidebar
              currentSessionId={sessionId}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 min-w-0">
        <ChatWindow
          sessionId={sessionId}
          onOpenSessions={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  )
}
