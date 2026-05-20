# UI Context

## Theme

Light mode only. The visual language is a warm, friendly personal finance app — clean white surfaces, warm off-white backgrounds, and a bold amber accent color. Approachable and personality-driven, not cold or corporate.

## Color Tokens

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind utilities via `@theme inline`. Components must use token names — never raw hex values or utility classes like `amber-500` or `zinc-*`.

| Role | CSS Variable | Hex | Tailwind Utility |
|------|-------------|-----|-----------------|
| Page background | `--bg-base` | `#FAFAF8` | `bg-base` |
| Surface (cards) | `--bg-surface` | `#FFFFFF` | `bg-surface` |
| Elevated surface | `--bg-elevated` | `#F5F4EF` | `bg-elevated` |
| Subtle surface | `--bg-subtle` | `#EEEDE8` | `bg-subtle` |
| Default border | `--border-default` | `#E4E3DC` | `border-default` |
| Subtle border | `--border-subtle` | `#D0CFC8` | `border-subtle` |
| Primary text | `--text-primary` | `#18181B` | `text-primary` |
| Secondary text | `--text-secondary` | `#52525B` | `text-secondary` |
| Muted text | `--text-muted` | `#A1A1AA` | `text-muted` |
| Faint text | `--text-faint` | `#D4D4D8` | `text-faint` |
| Accent (amber) | `--accent-primary` | `#F59E0B` | `bg-accent`, `text-accent` |
| Accent dim | `--accent-dim` | `rgba(245,158,11,0.12)` | `bg-accent-dim` |
| Accent text | `--accent-text` | `#B45309` | `text-accent-text` |
| Income (green) | `--state-income` | `#10B981` | `text-income`, `bg-income` |
| Income dim | `--state-income-dim` | `rgba(16,185,129,0.12)` | `bg-income-dim` |
| Expense (red) | `--state-expense` | `#F43F5E` | `text-expense`, `bg-expense` |
| Expense dim | `--state-expense-dim` | `rgba(244,63,94,0.12)` | `bg-expense-dim` |
| Error | `--state-error` | `#EF4444` | `text-error` |
| Success | `--state-success` | `#10B981` | `text-success` |
| Warning | `--state-warning` | `#F59E0B` | `text-warning` |

## Typography

| Role | Font | Variable | Notes |
|------|------|----------|-------|
| All UI text | Plus Jakarta Sans | `--font-jakarta` | Rounded, friendly — loaded via `next/font/google` |
| Numbers / mono | Geist Mono | `--font-mono` | Used for balance amounts and transaction values |

Plus Jakarta Sans is the primary font across all headings, body text, and UI labels. Its rounded terminals give the app a friendly, approachable personality.

Large balance numbers use `font-mono` with a bold weight so they read as precise financial figures.

Both fonts are loaded in `app/layout.tsx` via `next/font/google` and applied as CSS variables on `<html>`.

## Border Radius Scale

Radius increases with surface depth — smaller for inner elements, larger for containers.

| Context | Class |
|---------|-------|
| Badges, tags, small chips | `rounded-lg` |
| Inputs, buttons | `rounded-xl` |
| Cards, panels | `rounded-2xl` |
| Modals, bottom sheets | `rounded-3xl` |
| Chat bubbles | `rounded-2xl` (with one corner `rounded-sm` for tail effect) |

## Component Library

shadcn/ui on top of Tailwind. Components live in `components/ui/`. Use the `shadcn` CLI (`npx shadcn add [component]`) to add new components — never write them from scratch. Do not modify generated files in `components/ui/` after installation.

## Layout Patterns

**Mobile-first shell** — the primary layout. A fixed bottom navigation bar on mobile (≤768px) with 4 icons: Home, Transactions, Goals, Portfolio. On desktop (≥768px), a fixed left sidebar replaces the bottom nav.

**Dashboard page** — scrollable single-column on mobile. Two-column grid on desktop: left column has balance + charts, right column has recent transactions + goals.

**Chat page** — full-height chat interface. Fixed input bar at the bottom, scrollable message list above. On mobile this is a dedicated page. On desktop it appears as a persistent right panel.

**Card** — the primary surface unit. White background, `rounded-2xl`, subtle shadow (`shadow-sm`), `border border-default`. Used for balance display, charts, transaction items, goal cards.

**Modal / bottom sheet** — centered dialog on desktop (`rounded-3xl`). Slides up from bottom on mobile (`rounded-t-3xl`) with a drag handle.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Standard sizes:

| Context | Size |
|---------|------|
| Inline text / labels | `h-4 w-4` |
| Buttons / nav items | `h-5 w-5` |
| Empty states | `h-8 w-8` |
| Category icons | `h-5 w-5` |

## Dashboard-specific UI

### Category Color System

Each transaction category has a consistent icon and accent color used in charts, badges, and transaction list items.

| Category | Icon (Lucide) | Color |
|----------|--------------|-------|
| Food | `UtensilsCrossed` | `#F97316` (orange) |
| Transport | `Car` | `#3B82F6` (blue) |
| Shopping | `ShoppingBag` | `#A855F7` (purple) |
| Entertainment | `Tv` | `#EC4899` (pink) |
| Health | `Heart` | `#EF4444` (red) |
| Salary | `Briefcase` | `#10B981` (green) |
| Subscriptions | `RefreshCw` | `#6366F1` (indigo) |
| Investments | `TrendingUp` | `#F59E0B` (amber) |
| Savings | `PiggyBank` | `#14B8A6` (teal) |
| Other | `MoreHorizontal` | `#A1A1AA` (muted) |

### Balance Display

The current balance is the hero element of the dashboard — displayed as a large mono number (`text-5xl font-bold font-mono`) with a smaller secondary label. Positive balance uses `text-primary`, negative uses `text-expense`.

### Chart Conventions

- Donut chart (spending by category): uses category colors from the table above. Center label shows total spent this month.
- Bar chart (monthly income vs spending): income bars use `--state-income`, expense bars use `--state-expense`. Recharts library.

### Chat Bubbles

- User messages: right-aligned, `bg-accent-dim` background, `text-primary`.
- Assistant messages: left-aligned, `bg-surface` with `border-default`, `text-primary`.
- Transaction confirmation cards: appear inside assistant messages — shows amount, category icon, and updated balance.
