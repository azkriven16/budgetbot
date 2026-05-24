'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const SLIDES = [
  {
    bg: '#FDE8D8',
    headline: 'Track\nSpending',
    body: 'Just chat to log expenses — no forms, no friction.',
    icon: (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40">
        <rect x="20" y="30" width="100" height="72" rx="16" fill="white" />
        <polygon points="40,102 28,122 60,102" fill="white" />
        <text x="70" y="76" textAnchor="middle" fontSize="32" fontWeight="700" fill="#F59E0B" fontFamily="sans-serif">$</text>
        <circle cx="48" cy="60" r="6" fill="#F59E0B" opacity="0.3" />
        <circle cx="70" cy="60" r="6" fill="#F59E0B" opacity="0.3" />
        <circle cx="92" cy="60" r="6" fill="#F59E0B" opacity="0.3" />
      </svg>
    ),
  },
  {
    bg: '#D1FAE5',
    headline: 'Stay on\nBudget',
    body: 'Set category limits and get nudged before you overspend.',
    icon: (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40">
        <rect x="16" y="90" width="128" height="36" rx="18" fill="white" />
        <rect x="16" y="90" width="92" height="36" rx="18" fill="#10B981" />
        <circle cx="108" cy="108" r="14" fill="white" stroke="#10B981" strokeWidth="3" />
        <text x="108" y="113" textAnchor="middle" fontSize="11" fontWeight="700" fill="#10B981" fontFamily="sans-serif">80%</text>
        <text x="80" y="78" textAnchor="middle" fontSize="13" fontWeight="600" fill="#18181B" fontFamily="sans-serif" opacity="0.6">Food · $80 / $100</text>
        <rect x="30" y="44" width="100" height="8" rx="4" fill="white" opacity="0.6" />
        <rect x="30" y="44" width="60" height="8" rx="4" fill="#10B981" opacity="0.4" />
        <rect x="30" y="58" width="100" height="8" rx="4" fill="white" opacity="0.6" />
        <rect x="30" y="58" width="80" height="8" rx="4" fill="#10B981" opacity="0.4" />
      </svg>
    ),
  },
  {
    bg: '#FEF3C7',
    headline: 'Know Your\nMoney',
    body: 'See exactly where every dollar goes, at a glance.',
    icon: (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40">
        <circle cx="80" cy="80" r="52" fill="white" />
        <path d="M80 28 A52 52 0 0 1 132 80 L80 80 Z" fill="#F59E0B" />
        <path d="M132 80 A52 52 0 0 1 54 126 L80 80 Z" fill="#10B981" />
        <path d="M54 126 A52 52 0 0 1 28 80 L80 80 Z" fill="#F43F5E" opacity="0.7" />
        <path d="M28 80 A52 52 0 0 1 80 28 L80 80 Z" fill="#F59E0B" opacity="0.35" />
        <circle cx="80" cy="80" r="28" fill="white" />
        <text x="80" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#18181B" fontFamily="sans-serif">$2,400</text>
      </svg>
    ),
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  function next() {
    if (isLast) {
      localStorage.setItem('budgbot_onboarded', '1')
      onDone()
    } else {
      setIndex(index + 1)
    }
  }

  function skip() {
    localStorage.setItem('budgbot_onboarded', '1')
    onDone()
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 50 && index < SLIDES.length - 1) setIndex(index + 1)
    if (dx < -50 && index > 0) setIndex(index - 1)
    touchStartX.current = null
  }

  return (
    <div
      className="flex flex-col min-h-dvh transition-colors duration-500 select-none"
      style={{ backgroundColor: slide.bg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Skip */}
      <div className="flex justify-end p-5">
        {!isLast && (
          <button
            onClick={skip}
            className="text-sm font-medium text-primary opacity-50 hover:opacity-80 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-8 pt-2 pb-10 justify-between">
        <div className="flex flex-col gap-8">
          {/* Headline */}
          <h1
            className="text-5xl font-bold text-primary leading-tight tracking-tight whitespace-pre-line"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {slide.headline}
          </h1>

          {/* Illustration */}
          <div className="flex justify-center py-4">
            {slide.icon}
          </div>

          {/* Body */}
          <p className="text-base text-secondary leading-relaxed max-w-xs">
            {slide.body}
          </p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-5 pt-8">
          {/* Progress dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  backgroundColor: i === index ? '#18181B' : '#18181B33',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <button
              onClick={next}
              className="px-7 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#18181B' }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>

            <Link
              href="/sign-up"
              onClick={() => localStorage.setItem('budgbot_onboarded', '1')}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
