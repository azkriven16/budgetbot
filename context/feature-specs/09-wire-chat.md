---
id: "09-wire-chat"
title: "Wire Chat to Transactions"
status: planned
priority: critical
scope: full-stack
effort: M
depends_on:
  - "07-chat-ui"
  - "08-ai-parser"
---

## Overview

Connects the chat UI to the AI parser API. Sends user messages to `POST /api/chat`, polls for the result, renders the assistant reply, and shows a transaction confirmation card when a transaction was parsed. Also loads chat history from the database on page mount and updates the dashboard balance without a full page reload.

## User Story

As a **user**, I want **the chat to actually process my messages and log my transactions**, so that **typing "spent $50 on lunch" immediately updates my balance and shows me a confirmation**.

## Implementation Steps

### Frontend

1. Update `components/chat/chat-window.tsx`:
   - On mount: fetch `GET /api/chat/history` and populate message list with saved messages.
   - On send: call `POST /api/chat`, immediately add user bubble to local state.
   - Show `<TypingIndicator />` while polling.
   - Poll `GET /api/chat/result/[runId]` every 1.5s until status is `COMPLETED` or `FAILED`.
   - On completion: add assistant bubble with the reply text.
   - If the result includes a transaction, render `<TransactionCard />` inside the assistant bubble.
2. Update `components/chat/transaction-card.tsx` — wire up to show real data from the parsed result: category icon, description, formatted amount, and updated balance.
3. Create `app/api/chat/history/route.ts` — `GET /api/chat/history`. Returns last 50 `ChatMessage` records for the authenticated user, ordered by `createdAt` ascending.

### Frontend (dashboard refresh)

4. After a successful transaction parse, trigger a router refresh (`router.refresh()`) so the Server Component dashboard re-fetches the updated balance and recent transactions.

## Scope Limits

- Do NOT implement optimistic updates — wait for the confirmed parse result before updating.
- Do NOT add retry logic for failed AI parses — show a friendly error message and let the user re-type.
- Do NOT stream the AI response — poll for completion.

## Acceptance Criteria

- [ ] Typing "spent $30 on coffee" and sending creates a transaction in the DB and shows a confirmation card
- [ ] Chat history loads from the database when the page opens
- [ ] Typing indicator shows while the AI is processing
- [ ] Assistant reply with transaction card appears after processing completes
- [ ] Dashboard balance updates after a transaction is confirmed (no full page reload required)
- [ ] A failed parse shows a friendly error message in the chat
- [ ] `pnpm build` exits 0 with zero TypeScript errors
- [ ] No console errors in the browser

## Automated Tests

### E2E — `tests/features/09-wire-chat.spec.ts`

- **end-to-end expense flow**: Sends "spent $30 on coffee", verifies transaction card appears and balance decreases
- **chat history loads on mount**: Verifies previous messages load when navigating to the chat page
- **typing indicator shows**: Verifies the typing indicator is visible after sending a message
- **failed parse shows error**: Verifies sending gibberish shows a friendly error reply

## Rollback

Revert `components/chat/chat-window.tsx` to local-only state echo, delete `app/api/chat/history/route.ts`, revert `components/chat/transaction-card.tsx` to placeholder.
