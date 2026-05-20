---
id: "03-prisma-schema"
title: "Prisma Schema & Data Layer"
status: planned
priority: critical
scope: data
effort: M
depends_on:
  - "02-auth"
---

## Overview

Defines the full PostgreSQL schema for BudgBot using Prisma 7 multi-file schema. Creates all models: User, Transaction, Budget, SavingsGoal, SavingsContribution, Investment, Reminder, and ChatMessage. Sets up the Prisma client singleton and a user upsert helper called on first authenticated request.

## User Story

As a **developer**, I want **a fully typed database schema with a singleton Prisma client**, so that **every feature can read and write financial data safely and consistently**.

## Implementation Steps

### Backend

1. Install Prisma 7: `pnpm add prisma @prisma/client`, `pnpm add -D prisma`. Run `npx prisma init`.
2. Create `prisma/schema.prisma` with generator and datasource blocks only:
   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../app/generated/prisma"
   }
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Create `prisma/models/user.prisma` — `User` model with: `id` (cuid), `clerkId` (unique string), `balance` (Decimal default 0), `createdAt`, `updatedAt`. Relations to all other models.
4. Create `prisma/models/transaction.prisma` — `Transaction` model with: `id`, `userId`, `amount` (Decimal), `type` (enum: INCOME, EXPENSE), `category` (string), `description` (string?), `date` (DateTime). Index on `userId + date`.
5. Create `prisma/models/budget.prisma` — `Budget` model with: `id`, `userId`, `category` (string), `limitAmount` (Decimal), `period` (enum: MONTHLY). Unique constraint on `userId + category`.
6. Create `prisma/models/savings-goal.prisma` — `SavingsGoal` model with: `id`, `userId`, `name` (string), `emoji` (string?), `targetAmount` (Decimal), `currentAmount` (Decimal default 0), `isCompleted` (bool default false), `createdAt`.
7. Create `prisma/models/investment.prisma` — `Investment` model with: `id`, `userId`, `ticker` (string), `companyName` (string?), `action` (enum: BUY, SELL), `shares` (Decimal), `pricePerShare` (Decimal), `date` (DateTime), `createdAt`.
8. Create `prisma/models/reminder.prisma` — `Reminder` model with: `id`, `userId`, `message` (string), `recurrence` (string — cron or human description), `nextDueAt` (DateTime), `isActive` (bool default true), `createdAt`.
9. Create `prisma/models/chat-message.prisma` — `ChatMessage` model with: `id`, `userId`, `role` (enum: USER, ASSISTANT), `content` (string), `metadata` (Json?) for storing parsed transaction IDs and token usage (`inputTokens`, `outputTokens`), `createdAt`. Index on `userId + createdAt`.
10. Run `npx prisma migrate dev --name init` to create the initial migration.
11. Create `lib/prisma.ts` — Prisma client singleton using global cache pattern for Next.js dev mode hot reload.
12. Create `lib/user.ts` — `getOrCreateUser(clerkId: string)` helper that upserts a User record.

## Scope Limits

- Do NOT seed any data.
- Do NOT create API routes in this spec — schema and client only.
- Do NOT add Prisma Accelerate or connection pooling yet.

## Acceptance Criteria

- [ ] All 8 model files exist in `prisma/models/`
- [ ] `npx prisma migrate dev` runs without errors
- [ ] Prisma client generates into `app/generated/prisma/`
- [ ] `lib/prisma.ts` exports a singleton Prisma client
- [ ] `lib/user.ts` exports `getOrCreateUser` that creates a user if not exists
- [ ] All models have correct indexes (userId, userId+date, userId+category)
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/03-prisma-schema.spec.ts`

- **user upsert creates record**: Verifies `getOrCreateUser` creates a new user on first call and returns the same user on subsequent calls

### Unit — `tests/unit/user.test.ts`

- **getOrCreateUser is idempotent**: Verifies calling with the same clerkId twice returns the same user record

## Rollback

Run `npx prisma migrate reset`, delete all files in `prisma/models/`, delete `lib/prisma.ts` and `lib/user.ts`, delete `app/generated/`.
