'use client'

import { useState, useEffect } from 'react'

const THINKING_PHRASES = [
  'Thinking really hard…',
  'Crunching your numbers…',
  'Consulting the budget oracle…',
  'Doing the math…',
  'Checking your ledger…',
  'Reading between the lines…',
  'Tallying it all up…',
  'Summoning financial wisdom…',
  'Running the calculations…',
  'Parsing your finances…',
  'Connecting the dots…',
  'Cross-referencing the books…',
]

interface Props {
  status?: string
}

export function TypingIndicator({ status }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * THINKING_PHRASES.length),
  )

  useEffect(() => {
    if (status) return
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [status])

  const label = status ?? THINKING_PHRASES[phraseIndex]

  return (
    <div className="bg-surface border border-default rounded-2xl rounded-tl-sm px-3 py-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span key={label} className="text-xs text-muted ml-0.5">
          {label}
        </span>
      </div>
    </div>
  )
}
