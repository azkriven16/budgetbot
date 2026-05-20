---
id: "07-chat-ui"
title: "Chat Interface UI"
status: planned
priority: high
scope: frontend
effort: M
depends_on:
  - "04-app-shell"
  - "01-design-system"
---

## Overview

Builds the chat interface UI — the primary way users interact with BudgBot. A full-height scrollable message list with user and assistant bubbles, a fixed bottom input bar, and a loading state while the AI is processing. At this stage the chat is UI-only with no AI wiring — messages echo locally.

## User Story

As a **user**, I want **a friendly chat interface where I can type my financial updates**, so that **logging expenses feels as easy as sending a text message**.

## Implementation Steps

### Frontend

1. Create `app/(dashboard)/chat/page.tsx` — full-height page (`h-[calc(100vh-4rem)]` on mobile accounting for bottom nav). Renders `<ChatWindow />`.
2. Add "Chat" as a 5th nav item in `bottom-nav.tsx` and `sidebar.tsx` using `MessageCircle` icon → `/chat`. Update both nav components.
3. Create `components/chat/chat-window.tsx` — `"use client"`. Manages local message state (array of `{ id, role, content, createdAt }`). Renders `<MessageList />` and `<ChatInput />`.
4. Create `components/chat/message-list.tsx` — scrollable list of messages. Auto-scrolls to bottom on new messages (`useEffect` + `ref`). Shows date separators between messages from different days.
5. Create `components/chat/message-bubble.tsx` — renders a single message. User messages: right-aligned, `bg-accent-dim`, `rounded-2xl rounded-tr-sm`. Assistant messages: left-aligned, `bg-surface border border-default`, `rounded-2xl rounded-tl-sm`. Shows timestamp below.
6. Create `components/chat/chat-input.tsx` — fixed bottom input bar. `Textarea` (auto-resize, max 4 rows). Send button (`ArrowUp` icon, `bg-accent`). Submits on Enter (Shift+Enter for newline). Disabled while loading.
7. Create `components/chat/typing-indicator.tsx` — 3 animated dots shown in an assistant bubble while AI is processing.
8. Create `components/chat/transaction-card.tsx` — a compact card shown inside assistant messages after a transaction is parsed. Shows: category icon, description, amount (colored), "Added to your balance" label. Placeholder for now — wired in spec 09.
9. Add a welcome message from the assistant on first load: "Hey! 👋 I'm BudgBot. Tell me what you spent or earned today — like 'spent $45 on groceries' or 'got paid $2000'."

## Scope Limits

- Do NOT connect to the AI or API in this spec — local state echo only.
- Do NOT fetch chat history from the database yet.
- Do NOT add the floating chat button on the dashboard — the chat is a dedicated page.

## Acceptance Criteria

- [ ] Chat page renders with message list and input bar
- [ ] Typing a message and pressing Enter adds it to the message list as a user bubble
- [ ] Assistant typing indicator appears after sending (briefly, then a local echo reply)
- [ ] Message list auto-scrolls to the latest message
- [ ] Shift+Enter creates a newline, Enter sends
- [ ] Input is disabled while a message is pending
- [ ] Chat is usable on 375px mobile — input is accessible above the keyboard
- [ ] Welcome message shows on first render
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/07-chat-ui.spec.ts`

- **message sends on enter**: Verifies typing a message and pressing Enter adds a user bubble
- **input disables while pending**: Verifies the send button and input are disabled after submit
- **auto-scroll on new message**: Verifies the message list scrolls to the bottom when a new message appears
- **welcome message visible**: Verifies the welcome message is shown on first load

## Rollback

Delete `app/(dashboard)/chat/`, `components/chat/`. Remove chat nav item from `bottom-nav.tsx` and `sidebar.tsx`.
