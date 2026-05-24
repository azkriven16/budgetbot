import { LayoutDashboard, MessageCircle, ArrowLeftRight } from 'lucide-react'

export const navItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/chat',         label: 'Chat',         icon: MessageCircle },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
] as const
