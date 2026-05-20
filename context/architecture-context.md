# Architecture Context

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 16 App Router + TypeScript | Full-stack app, server/client boundary, routing |
| Auth | Clerk (`@clerk/nextjs`) | User identity, session management, route protection |
| Database | Prisma 7 + PostgreSQL | Relational data: transactions, budgets, goals, investments, reminders |
| UI | Tailwind CSS + shadcn/ui | Component composition, design tokens, styling |
| AI | Vercel AI SDK + `@ai-sdk/google` (Gemini) | Natural language parsing via `generateObject` |
| Background tasks | Trigger.dev v4 | AI parsing jobs, scheduled reminder tasks |
| Icons | Lucide React | Stroke-based icon library |
| Deployment | Vercel | Hosting, edge functions, environment variables |

## System Boundaries

- `app/api/` — Route handlers only: auth checks, input validation, DB reads/writes, triggering background tasks. No AI work, no long-running logic.
- `lib/` — Shared infrastructure: Prisma client singleton, auth helpers, category constants, utility functions.
- `components/` — UI composition only. No direct DB calls, no business logic, no AI calls.
- `trigger/` — All background tasks: AI message parsing task, scheduled reminder tasks.
- `prisma/` — Schema files and generated client output. Multi-file schema: `prisma/schema.prisma` holds generator + datasource; models in `prisma/models/*.prisma`.
- `app/(dashboard)/` — Protected route group for all authenticated pages.
- `app/(auth)/` — Public route group: sign-in and sign-up pages.

## Storage Model

All data lives in PostgreSQL via Prisma. There is no file or blob storage.

- **User balance**: stored on the `User` record, updated atomically with every transaction write.
- **Transactions**: each record stores `amount`, `type` (INCOME/EXPENSE), `category`, `description`, `date`.
- **Budget limits**: `Budget` records link a user to a category + monthly spend cap.
- **Savings goals**: `SavingsGoal` records store `targetAmount` and `currentAmount`, updated via chat contributions.
- **Investments**: `Investment` records store each buy/sell action — ticker, shares, price per share, date.
- **Reminders**: `Reminder` records store the message, recurrence schedule, and `nextDueAt` timestamp.
- **Chat messages**: `ChatMessage` records store the full message history per user (role: USER or ASSISTANT).

No generated artifacts, uploaded files, or blobs are stored anywhere.

## Auth and Access Model

- Authentication is handled by Clerk. Every user has a Clerk `userId` (string).
- The `User` table mirrors Clerk's identity with `clerkId` as the unique key.
- `proxy.ts` at the project root (Next.js 16 renames `middleware.ts` → `proxy.ts`) uses `clerkMiddleware` to protect all routes except `/sign-in` and `/sign-up`.
- All API routes call `auth()` from `@clerk/nextjs/server` and return 401 if unauthenticated.
- All data is scoped to the authenticated user's `clerkId` — users can only read and write their own records.

## AI Parsing Model

- **Input**: raw chat message string from the user.
- **Execution**: Trigger.dev background task (`trigger/parse-message.ts`) calls `generateObject` with a Zod schema.
- **Output**: structured object — `{ type, amount, category, description, targetGoal?, investmentDetails? }`.
- The task writes the resulting transaction (or goal contribution, or investment) to the database and returns the result to the API route.
- Gemini model: `gemini-2.0-flash` via `@ai-sdk/google`.

## Reminder Model

- `Reminder` records are created via the chat AI parser when it detects a reminder intent.
- A Trigger.dev scheduled task (`trigger/reminder-check.ts`) runs on a cron schedule, queries reminders where `nextDueAt <= now`, and:
  1. Creates a `ChatMessage` of role ASSISTANT with the reminder content.
  2. Updates `nextDueAt` to the next occurrence.
- No external email or push service in v1 — reminders surface in the chat feed only.

## Invariants

1. Route handlers never run AI or long-lived work — that belongs in Trigger.dev tasks.
2. Every API route authenticates the request before any DB read or write.
3. All data is user-scoped — queries always filter by the authenticated user's ID.
4. User balance is always derived from transactions or updated atomically — never manually patched without a corresponding transaction record.
5. Client components are only used where browser interactivity, hooks, or state is required — default to Server Components.
6. The Prisma client is instantiated once as a singleton in `lib/prisma.ts` — never instantiated inline in components or routes.
7. `userId` is always resolved server-side from `auth()` → `getOrCreateUser()` — never read from the request body.
8. Every DELETE and PATCH route calls `assertOwnership()` from `lib/validators.ts` before executing any mutation.
9. Every AI-parsed `amount` field passes `validateAmount()` from `lib/validators.ts` before being written to the database.
10. All user chat message content is wrapped in `<user_input>` tags before being sent to Gemini.

See `context/security-context.md` for the full threat model and defense layer breakdown.
