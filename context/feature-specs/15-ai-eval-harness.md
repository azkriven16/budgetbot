---
id: "15-ai-eval-harness"
title: "AI Parser Eval Harness"
status: planned
priority: medium
scope: backend
effort: S
depends_on:
  - "08-ai-parser"
---

## Overview

A Vitest behavioral test suite that scores the AI parser against a fixed set of golden test cases. Gives a pass/fail signal whenever the system prompt, model, or Zod schema changes — catching regressions before they reach users.

## User Story

As a **developer**, I want **a deterministic benchmark that tells me if the AI parser still works after I change the prompt or model**, so that **I catch regressions before they silently break the chat experience**.

## Implementation Steps

### Test Infrastructure

1. Install Vitest: `pnpm add -D vitest`. Add `"test:ai": "vitest run tests/ai"` to `package.json` scripts.
2. Create `tests/ai/parser.test.ts` — imports `parseMessage` logic extracted from the Trigger.dev task (see step 3), defines 10 golden test cases, asserts on `intent` and key fields.
3. Extract the Gemini call into a standalone async function in `lib/ai/parse.ts`:
   ```ts
   export async function parseMessage(message: string): Promise<ParseResult>
   ```
   The Trigger.dev task calls this function. The test suite calls it directly.
4. Golden test cases (minimum 10 — implement all):
   - "spent $45 on groceries" → `intent: "transaction"`, `type: EXPENSE`, `amount: 45`
   - "got paid $3000" → `intent: "transaction"`, `type: INCOME`, `amount: 3000`
   - "added $200 to vacation fund" → `intent: "savings_contribution"`, `amount: 200`
   - "bought 5 shares of AAPL at $190" → `intent: "investment"`, `action: BUY`, `shares: 5`
   - "sold 2 NVDA at $500" → `intent: "investment"`, `action: SELL`, `shares: 2`
   - "remind me to pay rent on the 1st of every month" → `intent: "reminder"`
   - "wait that was $25 not $45" → `intent: "correction"`, `field: "amount"`
   - "uber eats $32" → `intent: "transaction"`, `type: EXPENSE`, `amount: 32`
   - "what's my balance?" → `intent: "question"`
   - "asdf qwerty 12345" → `intent: "unknown"`
5. Pass threshold: ≥ 8 out of 10 test cases must match the expected intent and key fields. Log which cases failed.
6. Each test is independent — no shared DB state. The function only calls Gemini, it does not write to the database.

## Scope Limits

- Do NOT mock Gemini — these are live AI calls. The test suite costs real tokens (~$0.01 per full run).
- Do NOT assert on `replyMessage` content — only on structured fields (`intent`, `amount`, `type`, etc.).
- Do NOT run in CI on every commit — add a note in the script: run manually before deploying a prompt change.

## Acceptance Criteria

- [ ] `lib/ai/parse.ts` exports `parseMessage(message: string): Promise<ParseResult>`
- [ ] `trigger/parse-message.ts` calls `parseMessage` from `lib/ai/parse.ts` — no duplicate Gemini call logic
- [ ] `tests/ai/parser.test.ts` contains all 10 golden test cases
- [ ] `pnpm test:ai` runs and outputs a pass/fail score
- [ ] At least 8/10 cases pass on the first run against the v1 prompt
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### Unit — `tests/ai/parser.test.ts`

- **expense message**: "spent $45 on groceries" → intent transaction, EXPENSE, $45
- **income message**: "got paid $3000" → intent transaction, INCOME, $3000
- **savings contribution**: "added $200 to vacation fund" → intent savings_contribution, $200
- **stock buy**: "bought 5 shares of AAPL at $190" → intent investment, BUY, 5 shares
- **stock sell**: "sold 2 NVDA at $500" → intent investment, SELL, 2 shares
- **reminder**: "remind me to pay rent on the 1st" → intent reminder
- **correction**: "wait that was $25 not $45" → intent correction, field amount
- **shorthand expense**: "uber eats $32" → intent transaction, EXPENSE, $32
- **question**: "what's my balance?" → intent question
- **garbage input**: "asdf qwerty 12345" → intent unknown

## Rollback

Delete `lib/ai/parse.ts`, `tests/ai/parser.test.ts`. Inline the `generateObject` call back into `trigger/parse-message.ts`. Remove `test:ai` script from `package.json`.
