---
id: "12-savings-goals"
title: "Savings Goals"
status: planned
priority: high
scope: full-stack
effort: M
depends_on:
  - "09-wire-chat"
  - "03-prisma-schema"
  - "04-app-shell"
---

## Overview

Lets users create named savings goals with a target amount and track contributions toward them via chat. The Goals page shows all goals with progress bars. The AI parser handles chat messages like "added $50 to PS5 fund" and "create a goal: vacation fund $1500".

## User Story

As a **user**, I want **to save toward specific goals and track progress by talking to BudgBot**, so that **I can stay motivated and see exactly how far I am from buying what I'm saving for**.

## Implementation Steps

### Backend

1. Create `POST /api/goals` — accepts `{ name, targetAmount, emoji? }`. Creates a `SavingsGoal` record. Returns the goal.
2. Create `GET /api/goals` — returns all goals for the user with `currentAmount` and calculated `percentage`.
3. Create `POST /api/goals/[id]/contribute` — accepts `{ amount }`. Creates a `SavingsContribution` record, increments `SavingsGoal.currentAmount`. Marks goal as `isCompleted = true` if `currentAmount >= targetAmount`. Returns updated goal.
4. Create `DELETE /api/goals/[id]` — deletes the goal and all its contributions.
5. Create `lib/goals.ts` — `contributeToGoal(userId, goalName, amount)` — finds goal by fuzzy name match, calls contribute endpoint logic.

### Frontend

1. Replace `app/(dashboard)/goals/page.tsx` with a real Server Component listing all goals.
2. Create `components/goals/goal-card.tsx` — card per goal. Shows emoji, name, `$currentAmount / $targetAmount`, percentage, `Progress` bar. Completed goals show a ✅ badge. Amber accent color for the progress fill.
3. Create `components/goals/new-goal-dialog.tsx` — `"use client"`. Dialog to create a new goal: name input, emoji picker (just text input), target amount. Submits to `POST /api/goals`.
4. Create `components/goals/goal-empty.tsx` — empty state with "Create your first goal" button.

### AI Parser update

5. Update `trigger/parse-message.ts` — handle `intent: "savings_contribution"`. Call `contributeToGoal`. If the goal name doesn't match any existing goal, suggest creating it. If goal is now complete, add a celebratory reply: "🎉 You've reached your {name} goal!"

## Scope Limits

- Do NOT add a deadline/target date for goals in v1.
- Do NOT add goal category types (emergency fund vs. purchase) — all goals are generic.
- Do NOT support partial goal names in the AI — require a clear match or ask the user to clarify.

## Acceptance Criteria

- [ ] Goals page lists all savings goals with progress bars
- [ ] New goal dialog creates a goal and it appears in the list
- [ ] Typing "added $50 to PS5 fund" in chat contributes to the matching goal
- [ ] Progress bar updates after a contribution
- [ ] Completing a goal (reaching 100%) shows a celebration message in chat
- [ ] Empty state shows for users with no goals
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/12-savings-goals.spec.ts`

- **goal creation via dialog**: Verifies creating a goal via the dialog adds it to the goals page
- **chat contribution updates progress**: Verifies "added $50 to [goal name]" increases the goal's `currentAmount`
- **completion celebration**: Verifies filling a goal to 100% triggers a celebratory chat message
- **empty state renders**: Verifies a user with no goals sees the empty state

## Rollback

Delete `app/api/goals/`, `lib/goals.ts`, `components/goals/`. Revert `app/(dashboard)/goals/page.tsx` to placeholder. Remove savings contribution handling from `trigger/parse-message.ts`.
