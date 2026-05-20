---
id: "16-parse-correction"
title: "Parse Correction (HITL)"
status: planned
priority: medium
scope: full-stack
effort: S
depends_on:
  - "09-wire-chat"
  - "15-ai-eval-harness"
---

## Overview

Lets users correct the AI's most recent parse by typing a natural language correction in chat. "Wait, that was $25 not $45" or "undo that" patches or reverses the last logged transaction without requiring the user to navigate to a separate screen.

## User Story

As a **user**, I want **to fix a wrong parse by just typing a correction in chat**, so that **I don't have to hunt through the transactions page to manually edit a mistake the AI made**.

## Implementation Steps

### Backend

1. Update `lib/ai/parse.ts` — `parseMessage` already handles `intent: "correction"`. Verify `correction.field` and `correction.newValue` are populated.
2. Create `lib/corrections.ts` — `applyCorrection(userId, field, newValue)`:
   - Queries the most recent `ChatMessage` where `role = ASSISTANT` and `metadata.transactionId` is set, for this user.
   - Loads the referenced `Transaction`. Calls `assertOwnership(transaction.userId, userId)` to confirm it belongs to the requesting user before patching.
   - If `field = "amount"`: parse `newValue` as `parseFloat(newValue)`, call `validateAmount()` from `lib/validators.ts` — reject with a friendly error if out of bounds. Update `amount` and recompute the balance delta inside a Prisma `$transaction` block.
   - If `field = "category"`: verify `newValue` is a valid `CATEGORY_ID`, then update `category`.
   - If `field = "description"`: update `description` (no special validation needed).
   - Returns the updated transaction.
3. Create `lib/corrections.ts` — `undoLastTransaction(userId)`:
   - Same lookup as above — finds the most recent assistant message with a `transactionId`.
   - Deletes the referenced `Transaction` and reverses its effect on the user's balance.
   - Returns the deleted transaction for the reply message.
4. Update `trigger/parse-message.ts` — wire `intent: "correction"` to call `applyCorrection` or `undoLastTransaction` based on `correction.field` value (field = "undo" triggers the delete path).
5. Reply message for correction: "Updated: {category} · ${newAmount} (was ${oldAmount})."
6. Reply message for undo: "Removed: {description} · ${amount}. Your balance has been adjusted."

### Frontend

7. No new UI components needed — corrections surface as normal assistant messages in the chat feed.
8. After a correction, call `router.refresh()` so the dashboard and transaction page reflect the change immediately.

## Scope Limits

- Do NOT support correcting savings contributions, investments, or reminders yet — transactions only.
- Do NOT support correcting messages older than the most recent one — "last transaction" only.
- Do NOT add an "edit" button to chat bubbles — natural language correction only.
- Do NOT add a separate undo history UI.

## Acceptance Criteria

- [ ] "wait that was $25 not $45" patches the most recent transaction's amount and adjusts the balance
- [ ] "undo that" deletes the most recent transaction and reverses the balance change
- [ ] The chat reply confirms what changed and what the old value was
- [ ] Dashboard balance updates after a correction (via `router.refresh()`)
- [ ] Correction on a message with no prior transaction returns a friendly "nothing to correct" reply
- [ ] `applyCorrection` with `field: "amount"` and `newValue: "0"` returns a validation error — never writes $0 to the DB
- [ ] `applyCorrection` with `field: "amount"` and `newValue: "9999999"` returns a validation error
- [ ] `assertOwnership` is called before patching — a correction cannot patch a transaction belonging to a different user
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/16-parse-correction.spec.ts`

- **amount correction**: Verifies "wait that was $25 not $45" patches the transaction amount
- **undo deletes transaction**: Verifies "undo that" removes the transaction and reverses the balance
- **correction reply confirms change**: Verifies the assistant message shows old and new values
- **no prior transaction**: Verifies a correction with no recent transaction returns a helpful reply

## Rollback

Delete `lib/corrections.ts`. Remove `intent: "correction"` handling from `trigger/parse-message.ts`. The `correction` field in the Zod schema can stay — it just won't be acted on.
