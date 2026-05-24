'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Server-side redirect from an async server component triggers a Next.js 16
// Turbopack performance.measure() bug (negative timestamp). Using a client
// component with router.replace() avoids the server profiler entirely.
export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    async function go() {
      // Try to find the most recent session
      const res = await fetch('/api/chat/sessions')
      if (res.ok) {
        const { data } = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          router.replace(`/chat/${data[0].id}`)
          return
        }
      }
      // No sessions yet — create one
      const create = await fetch('/api/chat/sessions', { method: 'POST' })
      if (create.ok) {
        const { data } = await create.json()
        router.replace(`/chat/${data.id}`)
      }
    }
    go()
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
    </div>
  )
}
