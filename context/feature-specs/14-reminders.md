---
id: "14-reminders"
title: "Reminders"
status: planned
priority: medium
scope: full-stack
effort: L
depends_on:
  - "09-wire-chat"
  - "03-prisma-schema"
---

## Overview

Lets users set recurring financial reminders via chat — "remind me to invest $100 on the 1st of every month". A Trigger.dev scheduled task checks for due reminders, posts them as assistant messages in the user's chat feed, and reschedules the next occurrence.

## User Story

As a **user**, I want **recurring reminders for financial tasks**, so that **I never forget to invest, pay a bill, or review my budget**.

## Implementation Steps

### Backend

1. Create `POST /api/reminders` — accepts `{ message, recurrence, nextDueAt }`. Before creating, count active reminders for the user (`prisma.reminder.count({ where: { userId, isActive: true } })`). If count >= 10, return 422 `{ error: "Maximum 10 active reminders allowed" }`. Creates a `Reminder` record. Returns it.
2. Create `GET /api/reminders` — returns all active reminders for the user.
3. Create `DELETE /api/reminders/[id]` — calls `assertOwnership(reminder.userId, authenticatedUserId)` from `lib/validators.ts` before proceeding. Deactivates (soft deletes) the reminder. Returns `{ success: true }`.
4. Create `lib/reminders.ts`:
   - `parseRecurrence(description: string): { nextDueAt: Date, recurrenceCron: string }` — converts human description to a next date and cron string using a **pattern lookup table** (see step 4a). Do NOT call Gemini for this.
   - `getNextOccurrence(cronString: string, from: Date): Date` — uses `croner` package (`npm install croner`). API: `new Cron(cronString, { timezone: "UTC" }).nextRun(from)` returns `Date | null` — assert non-null since recurring crons always have a next occurrence: `new Cron(cronString, { timezone: "UTC" }).nextRun(from)!`. Do NOT use `cron-parser` — it has been unmaintained since mid-2025.

   4a. Pattern lookup table for `parseRecurrence` — match against common phrases before anything else:
   ```ts
   const PATTERNS = [
     { match: /1st of every month|monthly/i, cron: "0 9 1 * *" },
     { match: /every week|weekly/i,           cron: "0 9 * * 1" },
     { match: /every day|daily/i,             cron: "0 9 * * *" },
     { match: /every friday/i,                cron: "0 9 * * 5" },
     { match: /every monday/i,                cron: "0 9 * * 1" },
     // add common patterns here
   ];
   ```
   If no pattern matches, return a default monthly cron (`0 9 1 * *`) and include a note in the reply: "I'll remind you monthly — you can create a new reminder with more specific timing if needed."

### Background Task

5. Create `trigger/reminder-check.ts` — `schedules.task` running every hour (cron: `0 * * * *`). Add `queue: { concurrencyLimit: 1 }` to prevent overlapping runs if a previous hour's run is still executing.
   - Queries all `Reminder` records where `nextDueAt <= now` and `isActive = true`.
   - For each: creates a `ChatMessage` (role: ASSISTANT) with the reminder content and a "⏰ Reminder:" prefix.
   - Computes and saves the next `nextDueAt` using `getNextOccurrence`.
6. Register the scheduled task in `trigger.config.ts`.

### AI Parser update

7. Update `trigger/parse-message.ts` — handle `intent: "reminder"`. Call `parseRecurrence` to get `nextDueAt` and cron. Call `POST /api/reminders`. Reply with: "⏰ Got it! I'll remind you to {message} — next reminder: {nextDueAt formatted}."

### Frontend

8. Add a "Reminders" section to the chat page or a settings modal — lists active reminders with a delete button. Simple list, no dedicated page.

## Scope Limits

- Do NOT send email or push notifications — reminders surface in the chat feed only.
- Do NOT support one-time (non-recurring) reminders in v1 — all reminders recur.
- Do NOT build a cron editor UI — reminders are set via natural language chat only.
- Do NOT call Gemini to parse cron strings — use the pattern lookup table in `parseRecurrence`.
- Do NOT allow more than 10 active reminders per user — enforce at creation time.

## Acceptance Criteria

- [ ] "remind me to invest $100 on the 1st of every month" creates a Reminder record with correct `nextDueAt`
- [ ] `parseRecurrence` uses the pattern lookup table — no Gemini call is made for cron parsing
- [ ] The scheduled task runs hourly and posts due reminders as assistant messages in chat
- [ ] The scheduled task has `concurrencyLimit: 1` — confirmed in `trigger.config.ts`
- [ ] After a reminder fires, `nextDueAt` is updated to the next occurrence
- [ ] Active reminders can be viewed and deleted from the chat page
- [ ] `DELETE /api/reminders/[id]` returns 403 when the reminder belongs to a different user
- [ ] `POST /api/reminders` returns 422 when the user already has 10 active reminders
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/14-reminders.spec.ts`

- **reminder created via chat**: Verifies "remind me to invest $100 on the 1st" creates a Reminder record
- **due reminder appears in chat**: Verifies when `nextDueAt` is in the past, the reminder fires as an assistant message
- **reminder reschedules**: Verifies `nextDueAt` advances to the next occurrence after firing
- **delete deactivates reminder**: Verifies deleting a reminder sets `isActive = false`

## Rollback

Delete `trigger/reminder-check.ts`, `app/api/reminders/`, `lib/reminders.ts`. Remove reminders section from chat page. Remove reminder handling from `trigger/parse-message.ts`. Uninstall `croner`.
