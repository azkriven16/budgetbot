'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import dynamic from 'next/dynamic'
import { setWasmUrl } from '@lottiefiles/dotlottie-react'

setWasmUrl('/dotlottie-player.wasm')

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then(m => m.DotLottieReact),
  { ssr: false, loading: () => <div className="w-full h-full" /> },
)

const SLIDES = [
  {
    bg: '#FDE8D8',
    lottie: '/lottie/Revenue.lottie',
    headline: 'Track Your\nSpending',
    body: 'Just chat to log expenses — no forms, no friction.',
  },
  {
    bg: '#D1FAE5',
    lottie: '/lottie/Finance guru.lottie',
    headline: 'Stay on\nBudget',
    body: 'Set category limits and get nudged before you overspend.',
  },
  {
    bg: '#FEF3C7',
    lottie: '/lottie/Money.lottie',
    headline: 'Know Your\nMoney',
    body: 'See exactly where every dollar goes, at a glance.',
  },
]

const springConfig = { type: 'spring' as const, stiffness: 260, damping: 22 }

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springConfig },
}

const illustrationVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: springConfig },
}

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const dragX = useMotionValue(0)

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  // Interpolate background color across all slides as user drags
  const bgColor = useTransform(
    dragX,
    [-200, 0, 200],
    index > 0 ? [SLIDES[index - 1].bg, slide.bg, index < SLIDES.length - 1 ? SLIDES[index + 1].bg : slide.bg]
              : [slide.bg, slide.bg, index < SLIDES.length - 1 ? SLIDES[index + 1].bg : slide.bg],
  )

  function goTo(next: number) {
    if (next < 0 || next >= SLIDES.length) return
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  function next() {
    if (isLast) { localStorage.setItem('budgbot_onboarded', '1'); onDone() }
    else goTo(index + 1)
  }

  function skip() { localStorage.setItem('budgbot_onboarded', '1'); onDone() }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = Math.abs(info.velocity.x) > 300 || Math.abs(info.offset.x) > 80
    if (!threshold) return
    if (info.offset.x < 0 && index < SLIDES.length - 1) goTo(index + 1)
    if (info.offset.x > 0 && index > 0) goTo(index - 1)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: '0%', opacity: 1, transition: { x: { type: 'spring' as const, stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } } },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, transition: { x: { type: 'spring' as const, stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } } }),
  }

  return (
    <motion.div
      className="min-h-dvh w-full flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {/* Phone card */}
      <div
        className="relative flex flex-col w-full max-w-sm min-h-dvh md:min-h-0 md:h-195 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden"
      >
        {/* Top bar — fixed height */}
        <div className="flex items-center justify-between px-7 pt-10 pb-0 h-16 flex-none">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
              <span className="text-xs font-bold text-white">B</span>
            </div>
            <span className="text-sm font-semibold text-primary">BudgBot</span>
          </div>
          {!isLast ? (
            <button onClick={skip} className="text-sm font-semibold text-muted hover:text-primary transition-colors">
              Skip
            </button>
          ) : <div className="w-8" />}
        </div>

        {/* Slide area — fills remaining space */}
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            onDrag={(_, info) => dragX.set(info.offset.x)}
            onDragStart={() => dragX.set(0)}
            className="flex flex-col flex-1 px-7 pb-10 cursor-grab active:cursor-grabbing"
            style={{ x: dragX }}
          >
            <motion.div
              className="flex flex-col flex-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Illustration — flex-1 so it absorbs all spare vertical space */}
              <motion.div
                variants={illustrationVariants}
                className="flex-1 flex items-center justify-center py-4"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-72 h-72 sm:w-56 sm:h-56"
                >
                  <DotLottieReact src={slide.lottie} autoplay loop className="w-full h-full" />
                </motion.div>
              </motion.div>

              {/* Text block — fixed bottom portion */}
              <div className="flex flex-col gap-2 pb-6">
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-bold leading-tight tracking-tight whitespace-pre-line text-primary"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  {slide.headline}
                </motion.h1>
                <motion.p variants={itemVariants} className="text-sm leading-relaxed text-secondary">
                  {slide.body}
                </motion.p>
              </div>

              {/* Bottom controls */}
              <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                {/* Progress dots */}
                <div className="flex gap-2 items-center">
                  {SLIDES.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => goTo(i)}
                      animate={{ width: i === index ? 28 : 8, backgroundColor: i === index ? '#18181B' : 'rgba(24,24,27,0.2)' }}
                      transition={springConfig}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                {/* Button */}
                <motion.button
                  onClick={next}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl font-semibold text-white text-base"
                  style={{ backgroundColor: '#18181B' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isLast ? 'start' : 'next'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      {isLast ? "Let's Start!" : 'Next'}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                {/* Sub-link */}
                <Link
                  href="/sign-up"
                  onClick={() => localStorage.setItem('budgbot_onboarded', '1')}
                  className="text-sm text-center text-secondary"
                >
                  No account?{' '}
                  <span className="font-semibold text-primary">Create now</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
