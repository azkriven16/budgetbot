# Progress Tracker

## Current Phase

Foundation

## Current Goal

Feature 08: AI Message Parser (Trigger.dev)

## Feature Status

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 01 | Design System | ✅ Done | Next.js 16 scaffolded, shadcn/ui installed, BudgBot tokens in globals.css, fonts loaded |
| 02 | Authentication | 🔲 Planned | |
| 03 | Prisma Schema & Data Layer | ✅ Done | Prisma 7.8.0 + pg adapter, Neon PostgreSQL, 8 models, migration applied, lib/prisma.ts + lib/user.ts |
| 04 | App Shell & Navigation | ✅ Done | Mobile bottom nav + desktop sidebar, 4 placeholder pages, getOrCreateUser in layout |
| 05 | Dashboard Page | ✅ Done | Balance card, spending donut, monthly bar chart (Recharts), recent transactions list, empty state |
| 06 | Transaction API | ✅ Done | POST/GET /api/transactions + DELETE /api/transactions/[id]. lib/validators.ts, lib/transactions.ts, lib/env.ts, lib/categories.ts updated |
| 07 | Chat Interface UI | ✅ Done | Full-height chat page, 7 components, Chat nav item, local echo, typing indicator, welcome message |
| 08 | AI Message Parser (Trigger.dev) | 🔲 Planned | |
| 09 | Wire Chat to Transactions | 🔲 Planned | |
| 10 | Categories & Auto-categorization | 🔲 Planned | |
| 11 | Budget Limits | 🔲 Planned | |
| 12 | Savings Goals | 🔲 Planned | |
| 13 | Investment Tracking | 🔲 Planned | |
| 14 | Reminders | 🔲 Planned | |
| 15 | AI Parser Eval Harness | 🔲 Planned | ADLC: behavioral tests for AI parser |
| 16 | Parse Correction (HITL) | 🔲 Planned | ADLC: "wait that was $25 not $45" correction flow |
| 17 | Security Hardening | 🔲 Planned | Rate limiting, env validation, amount bounds, ownership checks |

Status key: ✅ Done · 🔄 In Progress · 🔲 Planned · 🚧 Blocked

- **2026-05-20** — Feature 07 (Chat Interface UI): app/(dashboard)/chat/page.tsx + 7 components (ChatWindow, MessageList, MessageBubble, ChatInput, TypingIndicator, TransactionCard placeholder, types/chat.ts). Chat nav item added to lib/nav.ts. Local echo with 1.2s typing indicator, welcome message via useEffect, Enter-to-send, Shift+Enter newline, date separators. Review fixed: typing-indicator dots `bg-muted` → `bg-[--text-muted]` (near-invisible → medium gray); `message-bubble.tsx` gained `'use client'` to lock in client-only rendering intent. pnpm build exits 0.
- **2026-05-20** — Feature 06 (Transaction API): POST/GET /api/transactions + DELETE /api/transactions/[id]. lib/validators.ts (validateAmount, assertOwnership), lib/transactions.ts (createTransaction, deleteTransaction, getUserTransactions — all atomic via Prisma $transaction), lib/env.ts (startup env validation), lib/categories.ts (CATEGORY_IDS const tuple + getCategoryById). Review fixed: double DB fetch in DELETE collapsed to single fetch, date string validation added with Zod refine. pnpm build exits 0.

## Open Questions

- [ ] Should the initial balance be set by the user on first sign-in, or start at $0?
- [ ] Should chat history persist across sessions, or start fresh each login?
- [ ] For reminders v1 — in-app chat feed only, or also send an email?

## Known Blockers

None yet.

## Completed Milestones

- **2026-05-19** — Feature 01 (Design System): Next.js 16 app scaffolded, shadcn/ui initialized, 11 components installed, BudgBot design tokens in globals.css, Plus Jakarta Sans + Geist Mono fonts loaded, cn() helper in lib/utils.ts. `pnpm build` exits 0.
- **2026-05-20** — Feature 05 (Dashboard): lib/dashboard.ts (getSpendingByCategory via groupBy, getMonthlyTotals via in-memory grouping, getRecentTransactions). components/dashboard/{balance-card,spending-chart,monthly-chart,recent-transactions}. Two-column grid on md:. Recharts 3.8.1. pnpm build exits 0.
- **2026-05-20** — Post-spec code review (features 01–05): extracted shared navItems to lib/nav.ts; extracted category config + icon mapping to lib/categories.ts; moved all category hex values to CSS variables in globals.css (--cat-food etc.); removed dead getBalance export; added empty states to MonthlyChart and RecentTransactions; fixed locale from 'default' to 'en-US'; removed unnecessary 'use client' from header.tsx; wrapped getOrCreateUser with React.cache(). pnpm build exits 0.
- **2026-05-20** — Feature 03 (Prisma Schema): Prisma 7.8.0 installed with @prisma/adapter-pg. Multi-file schema in prisma/models/ (8 models). Neon PostgreSQL connected via pooler + direct URLs. Migration `20260519111528_init` applied. lib/prisma.ts singleton + lib/user.ts getOrCreateUser helper. `pnpm build` exits 0.
