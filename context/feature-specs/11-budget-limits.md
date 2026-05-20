---
id: "11-budget-limits"
title: "Budget Limits"
status: planned
priority: medium
scope: full-stack
effort: M
depends_on:
  - "06-transaction-api"
  - "05-dashboard"
  - "08-ai-parser"
---

## Overview

Lets users set a monthly spend cap per category and see their progress. Budget progress bars appear on the dashboard. The AI parser warns the user via chat when they go over 80% of a budget after logging an expense.

## User Story

As a **user**, I want **to set spending limits per category and be warned when I'm close to the limit**, so that **I can stay within my budget without manually tracking it**.

## Implementation Steps

### Backend

1. Create `POST /api/budgets` — accepts `{ category, limitAmount }`. Upserts a `Budget` record (unique: userId + category). Returns the updated budget.
2. Create `GET /api/budgets` — returns all budgets for the user, joined with current month's spend per category.
3. Create `DELETE /api/budgets/[id]` — removes a budget limit.
4. Create `lib/budgets.ts` — `getBudgetStatus(userId)` returns array of `{ category, limitAmount, spentAmount, percentage }` for all active budgets.

### Frontend

1. Add budget progress bars to `app/(dashboard)/dashboard/page.tsx` — new section below recent transactions. Each bar: category icon, label, `{spent} / {limit}`, progress bar. Bar color: green < 80%, amber 80–99%, red ≥ 100%.
2. Create `components/dashboard/budget-progress.tsx` — renders one progress bar using shadcn `Progress` component. Uses `--state-warning` color when close, `--state-error` when over.
3. Create a budget settings flow — simple modal accessible from the dashboard. List of categories with optional limit inputs. Save triggers `POST /api/budgets`.

### Background Task update

4. Update `trigger/parse-message.ts` — after creating an EXPENSE transaction, call `getBudgetStatus` for that category. If `percentage >= 80`, append a warning to the `replyMessage`: "⚠️ Heads up — you're at {percentage}% of your {category} budget this month."

## Scope Limits

- Do NOT build a dedicated budgets page — settings via dashboard modal only.
- Do NOT send external notifications — warning appears in chat reply only.
- Do NOT support weekly or annual budget periods — monthly only.

## Acceptance Criteria

- [ ] `POST /api/budgets` creates or updates a budget limit for a category
- [ ] Dashboard shows progress bars for all categories with active budgets
- [ ] Progress bar turns amber at 80% and red at 100%
- [ ] After logging an expense that pushes a category to ≥80%, the chat reply includes a warning
- [ ] Budget settings modal lets users add, update, and remove limits
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/11-budget-limits.spec.ts`

- **budget progress bar renders**: Verifies a category with a budget shows a progress bar on the dashboard
- **over-budget bar turns red**: Verifies a category at 100%+ shows a red progress bar
- **chat warning on overspend**: Verifies logging an expense past 80% adds a warning to the assistant reply

## Rollback

Delete `app/api/budgets/`, `lib/budgets.ts`, `components/dashboard/budget-progress.tsx`. Remove budget section from dashboard and warning logic from `trigger/parse-message.ts`.
