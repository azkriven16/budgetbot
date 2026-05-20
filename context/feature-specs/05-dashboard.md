---
id: "05-dashboard"
title: "Dashboard Page"
status: planned
priority: high
scope: frontend
effort: M
depends_on:
  - "04-app-shell"
  - "03-prisma-schema"
---

## Overview

Builds the dashboard page with real data from the database. Shows the current balance as a hero number, a donut chart of spending by category, a bar chart of monthly income vs spending, and a recent transactions list. All data is fetched server-side. Uses placeholder/empty states when no data exists yet.

## User Story

As a **user**, I want **to see my financial summary at a glance when I open the app**, so that **I immediately know my current balance, where my money is going, and what I've spent recently**.

## Implementation Steps

### Backend

1. Create `lib/dashboard.ts` — server-side data helpers:
   - `getBalance(userId)` — returns user's current balance.
   - `getSpendingByCategory(userId, month)` — returns array of `{ category, total }` for the given month.
   - `getMonthlyTotals(userId, months)` — returns array of `{ month, income, expenses }` for the last N months.
   - `getRecentTransactions(userId, limit)` — returns the last N transactions.

### Frontend

1. Replace `app/(dashboard)/dashboard/page.tsx` with a real Server Component that calls all 4 data helpers and passes results to child components.
2. Create `components/dashboard/balance-card.tsx` — hero card showing current balance in large mono font. Positive: `text-primary`, negative: `text-expense`. Subtitle shows "Current Balance".
3. Create `components/dashboard/spending-chart.tsx` — donut chart using Recharts (`PieChart`). Uses category colors from `ui-context.md`. Shows total spent in center. `"use client"` — Recharts requires it.
4. Create `components/dashboard/monthly-chart.tsx` — bar chart using Recharts (`BarChart`). Income bars in `--state-income`, expense bars in `--state-expense`. Shows last 6 months. `"use client"`.
5. Create `components/dashboard/recent-transactions.tsx` — list of last 10 transactions. Each item: category icon + color, description, amount (green for income, red for expense), date.
6. Create `components/dashboard/empty-state.tsx` — shown when a user has no transactions yet. Friendly message: "Start by telling BudgBot what you spent today 💛"
7. Install `recharts` for charts.
8. Dashboard layout: single column on mobile, two-column grid on `md:` (balance + charts left, transactions + goals right).

## Scope Limits

- Do NOT build the chat interface in this spec.
- Do NOT add budget progress bars yet — that is spec 11.
- Do NOT add savings goals section yet — that is spec 12.
- Recharts components need `"use client"` — keep chart wrapper components as the only client components on this page.

## Acceptance Criteria

- [ ] Balance card renders the correct balance from the database
- [ ] Spending donut chart renders with correct category colors (empty state if no data)
- [ ] Monthly bar chart renders last 6 months (empty state if no data)
- [ ] Recent transactions list shows last 10 transactions with correct amounts and colors
- [ ] Empty state message shows for a new user with no transactions
- [ ] Dashboard is two-column on desktop, single-column on mobile
- [ ] All data is fetched server-side (no client-side fetch on page load)
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/05-dashboard.spec.ts`

- **balance card renders**: Verifies the balance card is visible on the dashboard
- **empty state for new user**: Verifies a user with no transactions sees the empty state message
- **charts render**: Verifies spending donut chart and monthly bar chart containers are present in the DOM
- **recent transactions list**: Verifies the transactions section renders (empty or populated)

## Rollback

Revert `app/(dashboard)/dashboard/page.tsx` to the placeholder, delete `components/dashboard/`, delete `lib/dashboard.ts`, uninstall `recharts`.
