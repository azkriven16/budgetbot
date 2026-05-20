---
id: "06-transaction-api"
title: "Transaction API"
status: planned
priority: critical
scope: backend
effort: M
depends_on:
  - "03-prisma-schema"
  - "02-auth"
---

## Overview

Creates the REST API routes for managing transactions. Handles creating, listing, and deleting transactions, and keeps the user's balance in sync atomically. These routes are called by the chat AI task after parsing a message, and by the transactions page UI.

## User Story

As a **backend system**, I want **typed API routes for transaction CRUD with auth and balance sync**, so that **the chat AI task and the UI can reliably create and read transaction data**.

## Implementation Steps

### Backend

1. Create `POST /api/transactions` — accepts `{ amount, type, category, description?, date? }`. Validates with Zod. Calls `auth()`, resolves `userId` via `getOrCreateUser()` (never from request body), calls `validateAmount(amount)` from `lib/validators.ts` before any DB write. Creates transaction and updates user balance atomically in a Prisma `$transaction` block. Returns `{ transaction, newBalance }`.
2. Create `GET /api/transactions` — accepts query params `?page=1&limit=20&category=&type=&month=`. Returns paginated list of transactions for the authenticated user.
3. Create `DELETE /api/transactions/[id]` — calls `assertOwnership(transaction.userId, authenticatedUserId)` from `lib/validators.ts` before deleting. Reverses balance update inside a Prisma `$transaction`. Returns `{ success: true }`.
4. Create `lib/transactions.ts` — shared helpers: `createTransaction(userId, data)`, `deleteTransaction(userId, transactionId)`, `getUserTransactions(userId, filters)`. Both `createTransaction` and `deleteTransaction` update user balance inside a Prisma `$transaction`. `createTransaction` calls `validateAmount` on the amount before proceeding.
5. Define category constants in `lib/categories.ts` — array of `{ id, label, icon, color }` matching `ui-context.md`. Export as `CATEGORIES` and a `getCategoryById` helper.

## Scope Limits

- Do NOT build the transactions list UI in this spec.
- Do NOT handle investment or savings transactions here — those have dedicated routes.
- Do NOT implement pagination UI — just ensure the API supports it.

## Acceptance Criteria

- [ ] `POST /api/transactions` creates a transaction and returns 201 with `{ transaction, newBalance }`
- [ ] `POST /api/transactions` returns 400 for invalid input (missing amount, invalid type)
- [ ] `POST /api/transactions` returns 400 for `amount: 0`, `amount: -50`, `amount: 2000000`
- [ ] `POST /api/transactions` returns 401 for unauthenticated requests
- [ ] `GET /api/transactions` returns paginated list scoped to the authenticated user
- [ ] `DELETE /api/transactions/[id]` returns 403 when trying to delete another user's transaction
- [ ] `userId` in transaction records always comes from `auth()` + DB lookup — never from the request body
- [ ] User balance updates correctly (+amount for INCOME, -amount for EXPENSE)
- [ ] Balance update and transaction creation happen atomically (Prisma `$transaction`)
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/06-transaction-api.spec.ts`

- **create transaction updates balance**: Verifies POST creates a record and the balance changes correctly
- **unauthenticated request rejected**: Verifies POST returns 401 without Clerk auth
- **delete reverses balance**: Verifies DELETE removes the transaction and reverts the balance
- **list returns user-scoped data**: Verifies GET returns only the authenticated user's transactions

## Rollback

Delete `app/api/transactions/`, `lib/transactions.ts`, `lib/categories.ts`.
