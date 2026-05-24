import { LayoutDashboard, MessageCircle, ArrowLeftRight, CalendarDays, Settings } from 'lucide-react'

export const navItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/chat',         label: 'Chat',         icon: MessageCircle },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/calendar',     label: 'Calendar',     icon: CalendarDays },
  { href: '/preferences',  label: 'Preferences',  icon: Settings },
] as const
