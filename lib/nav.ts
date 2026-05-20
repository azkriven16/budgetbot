import { LayoutDashboard, ArrowLeftRight, MessageCircle, Target, TrendingUp } from 'lucide-react'

export const navItems = [
  { href: '/dashboard',    label: 'Home',         icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/chat',         label: 'Chat',         icon: MessageCircle },
  { href: '/goals',        label: 'Goals',        icon: Target },
  { href: '/portfolio',    label: 'Portfolio',    icon: TrendingUp },
] as const
