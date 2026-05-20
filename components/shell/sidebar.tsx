'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { navItems } from '@/lib/nav'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-default z-40">
      <div className="flex items-center h-16 px-6 border-b border-default shrink-0">
        <span className="text-xl font-bold text-primary tracking-tight">BudgBot</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent-dim text-accent'
                  : 'text-secondary hover:bg-elevated hover:text-primary'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-default shrink-0">
        <UserButton />
      </div>
    </aside>
  )
}
