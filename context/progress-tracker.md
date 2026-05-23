# Progress Tracker

## Current Phase

Foundation

## Current Goal

Feature 13: Investment Tracking

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
| 08 | AI Message Parser (Trigger.dev) | ✅ Done | Trigger.dev v4 schemaTask, Gemini generateObject, 7 intents, all security layers applied, ChatMessage save with token metadata |
| 09 | Wire Chat to Transactions | ✅ Done | GET /api/chat/history, ChatWindow polls POST /api/chat + GET /api/chat/result/[runId], real TransactionCard with category icon + balance |
| 10 | Transactions Page | ✅ Done | Server Component page, TransactionFilters (month/category/type via URL params), TransactionList (grouped by date, optimistic delete), TransactionItem, TransactionEmpty |
| 11 | Budget Limits | ✅ Done | POST/GET /api/budgets + DELETE /api/budgets/[id], lib/budgets.ts (getBudgetStatus), BudgetProgress bars (green/amber/red), BudgetSettingsModal (upsert + remove), dashboard budget section, chat warning at ≥80% spend |
| 12 | Savings Goals | ✅ Done | POST/GET /api/goals + DELETE /api/goals/[id] + POST /api/goals/[id]/contribute. lib/goals.ts (getUserGoals, contributeToGoal, contributeToGoalById). GoalCard, NewGoalDialog, GoalEmpty. Goals page with grid + empty state. Chat contribution with 🎉 completion message |
| 13 | Investment Tracking | 🔲 Planned | |
| 14 | Reminders | 🔲 Planned | |
| 15 | AI Parser Eval Harness | 🔲 Planned | ADLC: behavioral tests for AI parser |
| 16 | Parse Correction (HITL) | 🔲 Planned | ADLC: "wait that was $25 not $45" correction flow |
| 17 | Security Hardening | 🔲 Planned | Rate limiting, env validation, amount bounds, ownership checks |

Status key: ✅ Done · 🔄 In Progress · 🔲 Planned · 🚧 Blocked

- **2026-05-23** — Feature 12 (Savings Goals): POST/GET /api/goals + DELETE /api/goals/[id] + POST /api/goals/[id]/contribute. lib/goals.ts (getUserGoals, contributeToGoal by name with insensitive match, contributeToGoalById, shared applyContribution helper). GoalCard Server Component (amber progress bar, ✅ badge when complete). NewGoalDialog client component (emoji + name + target amount). GoalEmpty with CTA. Goals page grid layout. trigger/parse-message.ts savings_contribution updated: calls contributeToGoal, appends 🎉 on justCompleted. Review fixed: extracted applyContribution to eliminate 12-line duplication between contribute functions. pnpm build exits 0.
- **2026-05-23** — Feature 11 (Budget Limits): POST/GET /api/budgets + DELETE /api/budgets/[id]. lib/budgets.ts (getBudgetStatus — parallel budget + spend queries, current-month window). BudgetProgress Server Component (green/amber/red bar via bg-income/bg-warning/bg-error tokens). BudgetSettingsModal (upsert via POST, remove via DELETE, per-category input + error display). Dashboard budget section below recent transactions with empty state. trigger/parse-message.ts updated to append ≥80% warning after EXPENSE. Review fixed: lib/budgets.ts relative env import → @/lib/env alias. pnpm build exits 0.
- **2026-05-20** — Feature 10 (Transactions Page): Server Component page reads month/category/type from URL searchParams (month validated with regex guard). TransactionFilters updates URL params on change. TransactionList groups by date (Today/Yesterday/date), optimistic delete with error restore, router.refresh() after success. TransactionItem shows category icon+color, income green / expense red, delete button. TransactionEmpty for zero results. Review fixed: unvalidated month param → 500 (added regex guard); raw params.category passed to filter display (now passes validated value). pnpm build exits 0.
- **2026-05-20** — Feature 09 (Wire Chat to Transactions): types/chat.ts (TransactionData + optional transaction field), GET /api/chat/history (last 50 msgs, desc→reverse), ChatWindow polls POST /api/chat + GET /api/chat/result/[runId] every 1.5s, history replaces welcome on mount, router.refresh() after transaction parse. TransactionCard wired with real category icon, formatted amount, and updated balance. Review fixed: WELCOME date frozen at module scope → moved to makeWelcome() factory so createdAt is fresh per mount; poll had no timeout → added 20-tick / 30s cap with friendly error message; empty description falls back to category name. pnpm build exits 0.
- **2026-05-20** — Feature 08 (AI Message Parser): trigger/parse-message.ts (schemaTask, 7 intents, generateObject with gemini-2.0-flash, <user_input> injection hardening), lib/prompts/parse-message.v1.ts, trigger.config.ts (modern Prisma mode), POST /api/chat + GET /api/chat/result/[runId]. Review fixed: NaN bypass in validateAmount (isNaN guard added), correction intent now scans 10 recent messages for one with transactionId (not just the last), invalid reminder dates guarded with isNaN check, DB errors re-thrown instead of swallowed, tasks.trigger wrapped with 503 fallback. Two issues logged: run ownership check and Clerk keys in Trigger.dev env. pnpm build exits 0.
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
