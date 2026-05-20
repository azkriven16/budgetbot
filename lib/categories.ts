import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  Heart,
  Briefcase,
  RefreshCw,
  TrendingUp,
  PiggyBank,
  MoreHorizontal,
} from 'lucide-react'

interface CategoryConfig {
  icon: LucideIcon
  color: string
  dim: string
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  Food:          { icon: UtensilsCrossed, color: 'var(--cat-food)',          dim: 'var(--cat-food-dim)' },
  Transport:     { icon: Car,            color: 'var(--cat-transport)',      dim: 'var(--cat-transport-dim)' },
  Shopping:      { icon: ShoppingBag,    color: 'var(--cat-shopping)',       dim: 'var(--cat-shopping-dim)' },
  Entertainment: { icon: Tv,             color: 'var(--cat-entertainment)',  dim: 'var(--cat-entertainment-dim)' },
  Health:        { icon: Heart,          color: 'var(--cat-health)',         dim: 'var(--cat-health-dim)' },
  Salary:        { icon: Briefcase,      color: 'var(--cat-salary)',         dim: 'var(--cat-salary-dim)' },
  Subscriptions: { icon: RefreshCw,      color: 'var(--cat-subscriptions)', dim: 'var(--cat-subscriptions-dim)' },
  Investments:   { icon: TrendingUp,     color: 'var(--cat-investments)',    dim: 'var(--cat-investments-dim)' },
  Savings:       { icon: PiggyBank,      color: 'var(--cat-savings)',        dim: 'var(--cat-savings-dim)' },
  Other:         { icon: MoreHorizontal, color: 'var(--cat-other)',          dim: 'var(--cat-other-dim)' },
}

export function getCategory(name: string): CategoryConfig {
  return CATEGORIES[name] ?? CATEGORIES.Other!
}
