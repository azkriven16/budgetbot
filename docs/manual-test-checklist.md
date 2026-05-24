# BudgBot — Manual Test Checklist

Run `pnpm dev` and open `http://localhost:3000` before starting.
Check each box as you go. A ❌ means something is broken — note it below the item.

---

## 0. Pre-flight

- [x] `pnpm dev` starts without errors in the terminal
- [x] Both processes start: `next` (yellow) and `trigger` (blue)
- [x] Browser opens `http://localhost:3000` — redirects to `/sign-in`

---

## 1. Authentication

### Sign-up (new account)

- [x] Navigate to `/sign-up`
- [x] Sign up with email + password (or social)
- [x] **Expected:** Clerk sign-up form renders, no layout breaks
- [x] After sign-up, redirected to `/dashboard`
- [x] **Expected:** Dashboard loads with $0.00 balance and empty states on all charts

### Sign-in (returning account)

- [x] Sign out (use the user menu or navigate to `/sign-in` directly)
- [x] Sign back in
- [x] **Expected:** Redirected to `/dashboard`, previous data still intact

### Route protection

- [x] Sign out, then manually visit `/dashboard`
- [x] **Expected:** Redirected to `/sign-in`, not a blank page or error
- [x] Try `/chat`, `/transactions`, `/goals`, `/portfolio` while signed out
- [x] **Expected:** All redirect to `/sign-in`

---

## 2. App Shell & Navigation

### Desktop (≥ 1024px)

- [ ] Sidebar visible on the left
- [ ] Nav items: Dashboard, Chat, Transactions, Goals, Portfolio
- [ ] Active page is highlighted in the sidebar
- [ ] Clicking each nav item navigates correctly

### Mobile (375px — shrink browser window or use DevTools)

- [ ] Sidebar is hidden
- [ ] Bottom navigation bar visible with the same 5 items
- [ ] **Expected:** No overflow, no items cut off, touch targets are large enough
- [ ] Active page icon is highlighted

---

## 3. Dashboard (`/dashboard`)

### Empty state (fresh account)

- [ ] Balance card shows **$0.00**
- [ ] Spending donut chart shows empty state message
- [ ] Monthly bar chart shows empty state message
- [ ] Recent transactions shows empty state message
- [ ] Budget section shows empty state (no limits set yet)

### After adding data (come back here after Chat tests)

- [ ] Balance card reflects current balance
- [ ] Spending donut shows categories with real percentages
- [ ] Monthly chart shows bars for the current month
- [ ] Recent transactions lists last 10 entries with amount, category icon, and date
- [ ] Budget progress bars appear if limits are set (green < 50%, amber 50–80%, red > 80%)

---

## 4. Chat (`/chat`)

> The chat tests are the core of the app. Run them in order — each builds on the previous balance.

### Welcome message

- [ ] Open `/chat`
- [ ] **Expected:** Welcome message appears with today's date
- [ ] Reminders panel is visible (collapsible, shows "No active reminders" if empty)

### 4a. Log an expense

- [ ] Type: **"spent $50 on groceries"** → press Enter
- [ ] **Expected:** Typing indicator appears briefly (3 animated dots)
- [ ] **Expected:** AI reply appears with a transaction card showing:
  - Amount: **$50.00**
  - Category: **Food** (or similar)
  - Type: **Expense**
  - Balance decreases by $50
- [ ] Navigate to `/dashboard` — recent transactions shows this entry
- [ ] Navigate back to `/chat`

### 4b. Log income

- [ ] Type: **"received $3000 salary"**
- [ ] **Expected:** Transaction card — Type: **Income**, Category: **Salary**, Amount: **$3000**
- [ ] Balance increases by $3000

### 4c. Log another expense

- [ ] Type: **"paid $80 for Uber"**
- [ ] **Expected:** Category: **Transport**, Amount: **$80**, balance decreases

### 4d. Correction — change amount

- [ ] Type: **"wait, that was $60 not $80"**
- [ ] **Expected:** AI confirms the correction, transaction updates to $60
- [ ] Balance difference: +$20 (restores the $20 overcharge)

### 4e. Correction — change category

- [ ] Type: **"actually that was food not transport"**
- [ ] **Expected:** AI confirms category changed to Food

### 4f. Undo last transaction

- [ ] Type: **"undo that"**
- [ ] **Expected:** AI confirms the transaction was deleted, balance reverses

### 4g. Ask a question (unknown intent)

- [ ] Type: **"how much did I spend this month?"**
- [ ] **Expected:** AI replies with a helpful message (does not create a transaction)

### 4h. Budget warning

> First set a budget limit (see Section 6), then come back here.

- [ ] Set a $60 Food budget in Section 6
- [ ] Type: **"spent $50 on food"**
- [ ] **Expected:** Transaction created AND reply includes a warning: "⚠️ You're at X% of your Food budget"

### 4i. Savings contribution

> Requires a goal to exist (see Section 7).

- [ ] Type: **"add $100 to my PS5 fund"**
- [ ] **Expected:** AI confirms contribution, shows progress toward goal
- [ ] If goal is completed: reply includes 🎉

### 4j. Investment — buy

- [ ] Type: **"bought 5 shares of AAPL at $180"**
- [ ] **Expected:** AI confirms purchase — ticker: AAPL, shares: 5, price: $180

### 4k. Investment — sell

- [ ] Type: **"sold 2 shares of AAPL at $200"**
- [ ] **Expected:** AI confirms sale with profit/loss note

### 4l. Investment — oversell guard

- [ ] Type: **"sold 100 shares of AAPL at $200"**
- [ ] **Expected:** AI returns an error — not enough shares to sell

### 4m. Reminder

- [ ] Type: **"remind me to pay rent every month"**
- [ ] **Expected:** AI confirms reminder created
- [ ] Reminders panel updates — new reminder appears in the list
- [ ] Delete the reminder from the panel — it disappears

### 4n. Input length guard

- [ ] Paste a message longer than 2000 characters and send
- [ ] **Expected:** Error response (400) — message too long

### 4o. Rate limit (optional — resets after 60s)

- [ ] Send 6 messages within 60 seconds
- [ ] **Expected:** 6th message returns "Too many requests" error

---

## 5. Transactions (`/transactions`)

### Page loads

- [ ] Navigate to `/transactions`
- [ ] **Expected:** All transactions listed, grouped by date (Today / Yesterday / date)
- [ ] Each row shows: category icon + color, description, amount (green for income, red for expense), date

### Filters

- [ ] Change the **month** filter to a previous month
- [ ] **Expected:** Only that month's transactions shown (or empty state if none)
- [ ] Change **category** filter to "Food"
- [ ] **Expected:** Only food transactions shown
- [ ] Change **type** filter to "Income"
- [ ] **Expected:** Only income transactions shown
- [ ] Clear all filters
- [ ] **Expected:** Full list returns

### Delete

- [ ] Click the delete (trash) icon on a transaction
- [ ] **Expected:** Row disappears immediately (optimistic UI)
- [ ] Refresh the page — **Expected:** Transaction is gone from the DB too
- [ ] Dashboard balance reflects the deletion

### Empty state

- [ ] Filter to a month with no transactions
- [ ] **Expected:** Empty state illustration/message, not a blank page or error

---

## 6. Budgets (Dashboard modal)

- [ ] On `/dashboard`, click **"Set Limits"** or budget settings button
- [ ] **Expected:** Budget settings modal opens
- [ ] Enter **$60** for Food → save
- [ ] **Expected:** Food budget progress bar appears on dashboard
- [ ] Enter a budget for a second category → save
- [ ] **Expected:** Two progress bars visible
- [ ] Remove a budget (click remove/delete in the modal)
- [ ] **Expected:** That bar disappears from dashboard

---

## 7. Goals (`/goals`)

### Empty state

- [ ] Navigate to `/goals`
- [ ] **Expected:** Empty state with a "Create Goal" call-to-action (if no goals exist)

### Create a goal

- [ ] Click **"New Goal"** button
- [ ] Enter: emoji 🎮, name **PS5 fund**, target **$500**
- [ ] **Expected:** Goal card appears with 0% progress bar

### Goal card

- [ ] **Expected:** Shows emoji, name, target amount, amount saved, progress bar
- [ ] Progress bar is amber-colored

### Contribute via chat (cross-test with 4i)

- [ ] After contributing $100 via chat, return to `/goals`
- [ ] **Expected:** PS5 fund card shows $100/$500, progress bar at 20%

### Goal completion

- [ ] Contribute enough to reach $500 total
- [ ] **Expected:** Goal card shows ✅ badge and 100% progress

### Delete a goal

- [ ] Delete the goal from the Goals page
- [ ] **Expected:** Card disappears, empty state returns

---

## 8. Portfolio (`/portfolio`)

### Empty state

- [ ] Navigate to `/portfolio` before any investments
- [ ] **Expected:** Empty state with a prompt to log a buy via chat

### After buying (cross-test with 4j/4k)

- [ ] After chat investment in Section 4j, navigate to `/portfolio`
- [ ] **Expected:** Portfolio summary card shows total invested amount
- [ ] Holding card for AAPL shows: ticker, shares held, average cost, total cost
- [ ] Investment history shows BUY/SELL rows with date badges

### Sell reflected

- [ ] After selling 2 shares (Section 4k), return to `/portfolio`
- [ ] **Expected:** AAPL holding shows 3 shares (not 5), updated cost basis
- [ ] History shows the SELL entry

---

## 9. Reminders panel (`/chat`)

- [ ] Open `/chat`
- [ ] Click the Reminders panel header to expand/collapse it
- [ ] **Expected:** Animates open/closed smoothly
- [ ] With a reminder created (Section 4m):
  - Shows reminder message and recurrence pattern
  - Delete button removes it from the list
- [ ] With no reminders: **Expected:** "No active reminders" message

---

## 10. Responsive / Mobile (375px)

Set browser to 375px wide (DevTools → device toolbar).

- [ ] `/dashboard` — balance card, charts, budget bars all fit without horizontal scroll
- [ ] `/chat` — input bar pinned to bottom, messages scroll above it, no overflow
- [ ] `/transactions` — filter controls wrap cleanly, each row readable
- [ ] `/goals` — cards stack vertically, no truncation
- [ ] `/portfolio` — summary card and holding cards stack cleanly
- [ ] Bottom nav visible and usable, icons not overlapping

---

## 11. Error states

- [ ] Disconnect internet → type a chat message
- [ ] **Expected:** Error message appears, app doesn't hang or crash
- [ ] Reconnect — app recovers without refresh

---

## Sign-off

| Section | Pass | Notes |
|---|---|---|
| 1. Auth | | |
| 2. Shell & Nav | | |
| 3. Dashboard | | |
| 4. Chat | | |
| 5. Transactions | | |
| 6. Budgets | | |
| 7. Goals | | |
| 8. Portfolio | | |
| 9. Reminders panel | | |
| 10. Mobile | | |
| 11. Error states | | |
