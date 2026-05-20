'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '@/lib/nav'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 md:hidden h-16 bg-surface border-t border-default flex items-center z-40">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              active ? 'text-accent' : 'text-secondary'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
