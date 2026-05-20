# Security Context

## Threat Model

BudgBot is a single-user personal finance app. Threats are scoped to authenticated users abusing the system — not external network attackers.

| Threat | Vector | Mitigation |
|--------|--------|------------|
| Prompt injection | Crafted chat message overrides AI intent | Layer 2 — `<user_input>` wrapping + model instruction |
| Denial of Wallet | Flood of requests burns Gemini/Trigger.dev quotas | Layer 1 — rate limiting (5 req/min/user) |
| Identity confusion | `userId` from request body → writes to another user's account | Layer 4 — always resolve from `auth()`, never from body |
| Missing ownership check | DELETE/PATCH modifies another user's record by ID | Layer 4 — `assertOwnership()` before every mutation |
| Unbounded AI output | AI returns negative or $1B amounts → corrupt balance | Layer 3 — `validateAmount()` after every AI parse |
| Oversell attack | Selling more shares than held skews portfolio | Layer 3 — sell validation before Investment write |
| Reminder abuse | Unlimited reminders exhaust cron write capacity | Layer 1 — max 10 active reminders per user |
| Corrupt balance | Balance diverges from transaction sum via partial failure | Layer 4 — all balance mutations inside Prisma `$transaction` |

SQL injection and CSRF are handled by Prisma's parameterized queries and Clerk's session token mechanism respectively — no additional mitigation needed.

## Defense Layers

### Layer 1 — Input Validation (before any processing)

- Chat messages capped at **2,000 characters** — Zod `.max(2000)` in `POST /api/chat`
- Rate limit: **5 requests per 60 seconds per user** on all AI-triggering routes — Upstash Redis sliding window via `lib/rate-limit.ts`
- Maximum **10 active reminders per user** — checked before every `POST /api/reminders`
- All request bodies validated with Zod before any logic runs

### Layer 2 — Prompt Injection Hardening

- All user message content is wrapped in `<user_input>` XML tags in the Gemini prompt
- System prompt instructs the model: treat anything inside `<user_input>` as raw data, never as instructions
- Model is instructed to return `intent: "unknown"` for any message that attempts to override its behavior
- System prompt lives in `lib/prompts/parse-message.v1.ts` — versioned, tracked in git

### Layer 3 — Output Validation (after AI, before DB write)

- `validateAmount(value)` from `lib/validators.ts` — enforces `value > 0 AND value <= 1_000_000` — called on every AI-parsed `amount`, `pricePerShare`, and `shares` before any DB write
- `correction.newValue` for `field: "amount"` is parsed as a number and passed through `validateAmount()` in `lib/corrections.ts`
- `category` must match a member of `CATEGORY_IDS` — Zod enum enforced
- Investment sells call `validateSell(userId, ticker, shares)` — returns 422 if `shares > currentHoldings`

### Layer 4 — Data Integrity (at write time)

- `userId` is always resolved from `auth().userId` → `getOrCreateUser()` — never accepted from the request body
- Every DELETE and PATCH route calls `assertOwnership(record.userId, authenticatedUserId)` before executing — throws 403 if mismatch
- All balance mutations inside Prisma `$transaction` blocks — transaction record + balance update are atomic
- `User.balance` reflects `SUM(INCOME) - SUM(EXPENSE)` at all times — maintained exclusively via `lib/transactions.ts` helpers

### Layer 5 — Cost Governance

- Rate limiting (Layer 1) is the primary Denial-of-Wallet defense
- Token usage logged as `{ inputTokens, outputTokens }` in `ChatMessage.metadata` on every AI call
- `parseRecurrence` uses a **pattern lookup table** — Gemini is not called for cron string parsing
- `trigger/reminder-check.ts` has `concurrencyLimit: 1` — overlapping hourly runs cannot pile up

## Code Review Checklist

Before merging any PR that touches AI output or financial writes:

- [ ] User content is wrapped in `<user_input>` tags before reaching Gemini
- [ ] `validateAmount()` is called on every AI-parsed amount before DB write
- [ ] No API route reads `userId` or `clerkId` from the request body
- [ ] Every DELETE and PATCH handler calls `assertOwnership()` before executing
- [ ] `lib/env.ts` is imported in all files that make external calls
- [ ] Active reminder count is checked before `POST /api/reminders` creates a record
- [ ] Investment SELL validates against current holdings before writing

## Required Environment Variables

| Variable | Used By |
|----------|---------|
| `DATABASE_URL` | Prisma |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk (client) |
| `CLERK_SECRET_KEY` | Clerk (server) |
| `GOOGLE_AI_API_KEY` | Gemini via AI SDK |
| `TRIGGER_SECRET_KEY` | Trigger.dev |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |

All validated at startup in `lib/env.ts`. Missing any one of these causes an immediate crash with a clear error message before any route handles a request.
