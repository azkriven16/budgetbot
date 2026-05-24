'use client'

import { useState, KeyboardEvent } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled: boolean
  pending: boolean
}

export function ChatInput({ onSend, disabled, pending }: ChatInputProps) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="shrink-0 px-4 py-3 border-t border-default bg-surface">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pending ? 'BudgBot is thinking…' : 'Tell me what you spent or earned…'}
          disabled={disabled}
          className="flex-1 min-h-10 max-h-30 resize-none overflow-y-auto text-sm rounded-xl border-default bg-elevated py-2.5 px-3"
        />
        <Button
          onClick={submit}
          disabled={disabled || !value.trim()}
          size="icon"
          className="shrink-0 bg-accent text-white rounded-xl h-10 w-10"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
