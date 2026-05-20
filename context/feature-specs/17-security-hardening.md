---
id: "17-security-hardening"
title: "Security Hardening"
status: planned
priority: critical
scope: backend
effort: S
depends_on:
  - "06-transaction-api"
  - "08-ai-parser"
---

## Overview

Implements the foundational security mitigations from `context/security-context.md`: rate limiting on AI-triggering routes, startup environment validation, shared validators for AI output bounds, and ownership enforcement helpers. These are shared modules — every other spec depends on them.

## User Story

As a **developer**, I want **security guardrails implemented as shared modules**, so that **every route and task that handles user input or AI output is protected without having to remember the rules independently**.

## Implementation Steps

### Environment Validation

1. Create `lib/env.ts` — validates all required environment variables at module load time using Zod. Export a typed `env` object:
   ```ts
   import { z } from "zod";
   const schema = z.object({
     DATABASE_URL: z.string().url(),
     CLERK_SECRET_KEY: z.string().min(1),
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
     GOOGLE_AI_API_KEY: z.string().min(1),
     TRIGGER_SECRET_KEY: z.string().min(1),
     UPSTASH_REDIS_REST_URL: z.string().url(),
     UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
   });
   export const env = schema.parse(process.env);
   ```
2. Import `lib/env.ts` at the top of `lib/prisma.ts` and `lib/ai/parse.ts` — ensures the check runs before any external call is made.

### Rate Limiting

3. Install `@upstash/ratelimit` and `@upstash/redis`. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`.
4. Create `lib/rate-limit.ts` — exports a pre-configured sliding window limiter:
   ```ts
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";
   export const chatRateLimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, "60 s"),
     prefix: "budgbot:chat",
   });
   ```
5. Apply `chatRateLimit` in `POST /api/chat` — call `chatRateLimit.limit(userId)` immediately after `auth()`. Return HTTP 429 with `{ error: "Too many requests. Try again in a moment." }` if the limit is hit.

### Shared Validators

6. Create `lib/validators.ts` — exports two helpers:
   ```ts
   export function validateAmount(value: number): number {
     if (!isFinite(value) || value <= 0 || value > 1_000_000) {
       throw new ValidationError(`Amount out of bounds: ${value}`);
     }
     return value;
   }

   export function assertOwnership(recordUserId: string, authenticatedUserId: string): void {
     if (recordUserId !== authenticatedUserId) {
       throw new ForbiddenError("You do not have permission to modify this record");
     }
   }
   ```
   Export typed error classes `ValidationError` and `ForbiddenError` so route handlers can catch and map to the correct HTTP status code (400 and 403 respectively).

7. Call `validateAmount()` in `lib/ai/parse.ts` on `transaction.amount`, `investment.pricePerShare`, and `investment.shares` before returning the parsed result.
8. Call `validateAmount()` in `lib/corrections.ts` when `field === "amount"` — parse `newValue` as `parseFloat` first, then validate.
9. Call `assertOwnership()` in `DELETE /api/transactions/[id]`, `DELETE /api/reminders/[id]`, `DELETE /api/goals/[id]`, and `lib/corrections.ts` before any record mutation.

### Input Length Guard

10. Update the Zod schema in `POST /api/chat` to: `z.object({ message: z.string().min(1).max(2000) })`.

### Reminder Cap

11. Update `POST /api/reminders` — before creating a record, count active reminders for the user with `prisma.reminder.count({ where: { userId, isActive: true } })`. If the count is >= 10, return HTTP 422 with `{ error: "Maximum 10 active reminders allowed" }`.

## Scope Limits

- Do NOT implement IP-based rate limiting — per-user is sufficient for an authenticated app.
- Do NOT add a token spend alert UI — logging (spec 08) is enough for v1.
- Do NOT implement GDPR data deletion — out of scope.
- Do NOT block the Upstash call from returning a hard error if Redis is down — fail open (allow the request) so a Redis outage doesn't take down the app. Log the failure.

## Acceptance Criteria

- [ ] `lib/env.ts` exists and throws a descriptive error at module load if any required env var is missing
- [ ] `lib/prisma.ts` imports `lib/env.ts` at the top
- [ ] `lib/ai/parse.ts` imports `lib/env.ts` at the top
- [ ] `POST /api/chat` returns 429 after 5 requests within 60 seconds from the same user
- [ ] `POST /api/chat` returns 400 for messages longer than 2,000 characters
- [ ] `lib/validators.ts` exports `validateAmount` and `assertOwnership`
- [ ] `validateAmount(0)`, `validateAmount(-1)`, `validateAmount(2_000_000)` all throw `ValidationError`
- [ ] `validateAmount(50)` returns `50`
- [ ] `assertOwnership("user-a", "user-b")` throws `ForbiddenError`
- [ ] `DELETE /api/transactions/[id]` returns 403 when the transaction belongs to a different user
- [ ] `DELETE /api/reminders/[id]` returns 403 when the reminder belongs to a different user
- [ ] `POST /api/reminders` returns 422 when the user already has 10 active reminders
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/17-security-hardening.spec.ts`

- **rate limit triggers on 6th request**: Verifies the 6th chat message within 60s returns 429
- **oversized message rejected**: Verifies a 2,001-character message returns 400
- **ownership enforced on transaction delete**: Verifies deleting another user's transaction returns 403
- **ownership enforced on reminder delete**: Verifies deleting another user's reminder returns 403
- **reminder cap enforced**: Verifies creating an 11th active reminder returns 422

### Unit — `tests/unit/validators.test.ts`

- **validateAmount rejects zero**: `validateAmount(0)` throws `ValidationError`
- **validateAmount rejects negative**: `validateAmount(-5)` throws `ValidationError`
- **validateAmount rejects over limit**: `validateAmount(1_500_000)` throws `ValidationError`
- **validateAmount accepts valid**: `validateAmount(250)` returns `250`
- **assertOwnership rejects mismatch**: throws `ForbiddenError` when IDs differ
- **assertOwnership passes matching**: does not throw when IDs match

## Rollback

Delete `lib/env.ts`, `lib/rate-limit.ts`, `lib/validators.ts`. Remove rate limit and length check from `POST /api/chat`. Remove reminder cap from `POST /api/reminders`. Remove `assertOwnership` calls from delete routes. Uninstall `@upstash/ratelimit` and `@upstash/redis`.
