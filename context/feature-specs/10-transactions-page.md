---
id: "10-transactions-page"
title: "Transactions Page"
status: planned
priority: high
scope: frontend
effort: M
depends_on:
  - "06-transaction-api"
  - "04-app-shell"
---

## Overview

Builds the full transactions list page. Shows all transactions with filtering by category, type (income/expense), and month. Each transaction shows its category icon, description, amount, and date. Users can delete a transaction from this page.

## User Story

As a **user**, I want **to see and manage my full transaction history**, so that **I can review my spending and remove any incorrectly logged entries**.

## Implementation Steps

### Frontend

1. Replace `app/(dashboard)/transactions/page.tsx` with a real Server Component that fetches transactions from `GET /api/transactions` with default filters.
2. Create `components/transactions/transaction-list.tsx` — `"use client"`. Renders a list of `<TransactionItem />` components. Handles delete confirmation.
3. Create `components/transactions/transaction-item.tsx` — single transaction row. Category icon (colored), description, date on left. Amount (green/red) and delete button on right. Delete triggers a `DELETE /api/transactions/[id]` call with optimistic removal.
4. Create `components/transactions/transaction-filters.tsx` — `"use client"`. Filter bar with: month selector (current month default), category dropdown, type toggle (All / Income / Expense). Updates URL search params on change.
5. Create `components/transactions/transaction-empty.tsx` — empty state when no transactions match filters.
6. Group transactions by date — show a date header above each group (e.g. "Today", "Yesterday", "May 14").

## Scope Limits

- Do NOT add editing of existing transactions — delete only.
- Do NOT add manual transaction creation from this page — that's via chat only.
- Do NOT add pagination UI yet — load all transactions for the selected month (reasonable limit).

## Acceptance Criteria

- [ ] Transactions page lists all transactions for the current month by default
- [ ] Transactions are grouped by date with date headers
- [ ] Category icon and color matches the category system from `ui-context.md`
- [ ] Income amounts show in green, expenses in red
- [ ] Filtering by category updates the list correctly
- [ ] Filtering by type (income/expense) updates the list correctly
- [ ] Delete removes the transaction from the list and updates the balance
- [ ] Empty state shows when no transactions match the filters
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/10-transactions-page.spec.ts`

- **transactions list renders**: Verifies the transactions page shows a list of transactions
- **filter by type works**: Verifies switching to "Expense" filter shows only expense transactions
- **delete removes item**: Verifies clicking delete removes the transaction from the list
- **empty state shown**: Verifies empty state appears when no transactions match the selected filters

## Rollback

Revert `app/(dashboard)/transactions/page.tsx` to placeholder, delete `components/transactions/`.
