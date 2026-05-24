'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { MessageCircle, ShieldCheck, PieChart } from 'lucide-react'

const SLIDES = [
  {
    bg: '#FDE8D8',
    iconBg: '#F59E0B',
    Icon: MessageCircle,
    headline: 'Track\nSpending',
    body: 'Just chat to log expenses — no forms, no friction.',
  },
  {
    bg: '#D1FAE5',
    iconBg: '#10B981',
    Icon: ShieldCheck,
    headline: 'Stay on\nBudget',
    body: 'Set category limits and get nudged before you overspend.',
  },
  {
    bg: '#FEF3C7',
    iconBg: '#F59E0B',
    Icon: PieChart,
    headline: 'Know Your\nMoney',
    body: 'See exactly where every dollar goes, at a glance.',
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1
  const { Icon } = slide

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
    /* Full-page backdrop — matches slide color on mobile, neutral on desktop */
    <div
      className="min-h-dvh flex items-center justify-center transition-colors duration-500"
      style={{ backgroundColor: slide.bg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Card — full screen on mobile, constrained on desktop */}
      <div
        className="relative flex flex-col w-full max-w-sm min-h-dvh md:min-h-0 md:h-160 md:rounded-3xl md:shadow-2xl overflow-hidden transition-colors duration-500 select-none"
        style={{ backgroundColor: slide.bg }}
      >
        {/* Skip */}
        <div className="flex justify-end px-6 pt-6 pb-0">
          {!isLast ? (
            <button
              onClick={skip}
              className="text-sm font-semibold opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: '#18181B' }}
            >
              Skip
            </button>
          ) : (
            <div className="h-5" />
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 px-8 pt-6 pb-10 justify-between">
          <div className="flex flex-col gap-10">
            {/* Headline */}
            <h1
              className="text-5xl font-bold leading-tight tracking-tight whitespace-pre-line"
              style={{ color: '#18181B', fontFamily: 'var(--font-jakarta)' }}
            >
              {slide.headline}
            </h1>

            {/* Illustration */}
            <div className="flex justify-center">
              <div
                className="w-44 h-44 rounded-3xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}
              >
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: slide.iconBg }}
                >
                  <Icon size={44} color="white" strokeWidth={1.75} />
                </div>
              </div>
            </div>

            {/* Body */}
            <p
              className="text-base leading-relaxed"
              style={{ color: '#52525B' }}
            >
              {slide.body}
            </p>
          </div>

          {/* Bottom */}
          <div className="flex flex-col items-center gap-5 pt-6">
            {/* Progress dots */}
            <div className="flex gap-2 items-center">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 28 : 8,
                    height: 8,
                    backgroundColor: i === index ? '#18181B' : 'rgba(24,24,27,0.2)',
                  }}
                />
              ))}
            </div>

            {/* Button — full width */}
            <button
              onClick={next}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#18181B' }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>

            {/* Sub-link */}
            <Link
              href="/sign-up"
              onClick={() => localStorage.setItem('budgbot_onboarded', '1')}
              className="text-sm text-center"
              style={{ color: '#52525B' }}
            >
              Don&apos;t have an account?{' '}
              <span className="font-semibold" style={{ color: '#18181B' }}>
                Create now
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
