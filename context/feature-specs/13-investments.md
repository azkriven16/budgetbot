---
id: "13-investments"
title: "Investment Tracking"
status: planned
priority: medium
scope: full-stack
effort: M
depends_on:
  - "09-wire-chat"
  - "03-prisma-schema"
  - "04-app-shell"
---

## Overview

Lets users manually log stock and crypto buys and sells via chat, and view a portfolio summary on the Portfolio page. No live price feeds — cost basis only. The AI parser handles messages like "bought 3 shares of NVDA at $120" and "sold 1 Apple share at $200".

## User Story

As a **user**, I want **to log my investment buys and sells via chat and see a portfolio summary**, so that **I can track what I've invested and at what cost without switching to another app**.

## Implementation Steps

### Backend

1. Create `POST /api/investments` — accepts `{ ticker, companyName?, action, shares, pricePerShare, date? }`. Validates with Zod. Calls `validateAmount(shares)` and `validateAmount(pricePerShare)` from `lib/validators.ts`. For `action: "SELL"`, calls `validateSell(userId, ticker, shares)` — returns 422 with `{ error: "Insufficient shares" }` if `shares > currentHoldings`. Creates an `Investment` record. Returns it.
2. Create `GET /api/investments` — returns all investment records grouped by ticker with aggregated: `totalShares`, `totalCost`, `averageCostPerShare`. Only shows positions with net shares > 0 (sells reduce holdings).
3. Create `lib/investments.ts`:
   - `getPortfolioSummary(userId)` — aggregates investment records into holdings per ticker.
   - `validateSell(userId, ticker, shares)` — queries current net holdings for the ticker and throws `ValidationError` if the sell would result in negative holdings.

### Frontend

1. Replace `app/(dashboard)/portfolio/page.tsx` with a real Server Component that fetches portfolio holdings.
2. Create `components/portfolio/portfolio-summary.tsx` — summary card: total invested amount (sum of all buy costs).
3. Create `components/portfolio/holding-card.tsx` — one card per ticker. Shows: ticker (bold, large), company name, shares held, average cost per share, total cost. Uses `TrendingUp` icon in accent color.
4. Create `components/portfolio/investment-history.tsx` — list of all individual buy/sell records. Each entry shows action (BUY/SELL badge), ticker, shares, price, date.
5. Create `components/portfolio/portfolio-empty.tsx` — empty state: "Log your first investment — try 'bought 5 shares of AAPL at $190'"

### AI Parser update

6. Update `trigger/parse-message.ts` — handle `intent: "investment"`. Call `POST /api/investments`. Reply with: "📈 Logged: {action} {shares} {ticker} @ ${pricePerShare}. Total cost: ${totalCost}."

## Scope Limits

- Do NOT fetch live prices — cost basis only, no P&L.
- Do NOT support crypto differently from stocks — same model.
- Do NOT add portfolio charts in v1 — text summary only.
- Do NOT allow selling more shares than currently held — return a 422 and a friendly chat reply.

## Acceptance Criteria

- [ ] "bought 3 shares of NVDA at $120" creates an Investment record and replies with confirmation
- [ ] Portfolio page shows aggregated holdings per ticker
- [ ] Selling shares reduces the net position displayed
- [ ] Selling more shares than currently held returns 422 and a friendly chat message ("You only hold X shares of TICKER")
- [ ] `validateAmount` is called on `shares` and `pricePerShare` — `shares: 0` or `pricePerShare: -1` are rejected
- [ ] Total invested amount is shown in the summary card
- [ ] Investment history list shows all individual buy/sell records
- [ ] Empty state shows for users with no investments
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/13-investments.spec.ts`

- **buy logged via chat**: Verifies "bought 3 shares of NVDA at $120" creates an investment record
- **portfolio page shows holdings**: Verifies the Portfolio page shows the ticker and share count
- **sell reduces position**: Verifies selling shares reduces the net holding displayed
- **empty state renders**: Verifies a user with no investments sees the empty state

## Rollback

Delete `app/api/investments/`, `lib/investments.ts`, `components/portfolio/`. Revert `app/(dashboard)/portfolio/page.tsx` to placeholder. Remove investment handling from `trigger/parse-message.ts`.
