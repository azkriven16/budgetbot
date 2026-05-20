# BudgBot

## Overview

BudgBot is a chat-first personal finance tracker for individuals. You describe your spending and income in plain English — "spent $200 on a new phone", "got paid $3000 today" — and the AI automatically logs the transaction, categorizes it, and updates your balance and dashboard. No forms, no manual entry — just talk to it.

## Goals

1. Let a user sign up and immediately start logging finances via a chat interface with zero setup friction.
2. Parse natural language messages into structured transaction records (amount, type, category) with high accuracy using Gemini.
3. Display a dashboard that makes a user's financial picture immediately understandable at a glance.
4. Let users set budget limits per category and see warnings when they are close to or over the limit.
5. Let users create savings goals and track progress toward them via the chat interface.
6. Let users manually log investments (buys/sells) via chat and see a portfolio summary.
7. Let users set recurring reminders (e.g. "invest $100 on the 1st") that trigger notifications when due.
8. Work well on mobile — the primary use case is quick expense entry on the go.

## Core User Flow

1. User signs in or creates an account.
2. User lands on the dashboard — shows current balance, spending by category, recent transactions.
3. User types a message in the chat input: "spent $45 on groceries".
4. AI parses the message, creates a transaction record, and updates the balance.
5. Dashboard reflects the new transaction and updated balance immediately.
6. User can also type: "save $50 toward PS5 fund" → updates savings goal progress.
7. User can type: "bought 3 shares of NVDA at $120" → logs investment.
8. User can type: "remind me to pay rent on the 28th" → creates a recurring reminder.

## Features

### Authentication & Account
- Sign-up and sign-in via Clerk
- Route protection — dashboard and API routes require authentication
- User balance stored and updated per account

### Dashboard
- Current balance — large, front and center
- Spending by category — donut chart
- Monthly income vs spending — bar chart
- Recent transactions list — last 10 with amount, category, date

### Chat Interface
- Natural language input — type anything about money
- AI parses: amount, type (income/expense), category, description
- Message history — full conversation log per user
- Handles corrections: "wait, that was $25 not $45"

### Transactions
- Full transaction log with filtering by date, category, type
- Auto-categorization into: Food, Transport, Shopping, Entertainment, Health, Salary, Subscriptions, Investments, Savings, Other
- Income and expense tracking

### Budget Limits
- Set a monthly spend cap per category (e.g. $500 on Food)
- Dashboard shows budget progress bars
- Chat warns the user when they are over 80% of a budget

### Savings Goals
- Create a named goal with a target amount and optional emoji (e.g. "🎮 PS5 · $500")
- Log contributions via chat: "added $50 to PS5 fund"
- Progress bar per goal on the dashboard

### Investment Tracking (Manual)
- Log buys and sells via chat: "bought 2 shares of Apple at $180"
- Portfolio summary: ticker, shares held, total cost basis
- No live price feed — manual entry only

### Reminders
- Create recurring reminders via chat: "remind me to invest $100 on the 1st of every month"
- Trigger.dev scheduled tasks fire when reminders are due
- Reminder notification shown in the chat feed when triggered

## Scope

### In Scope
- Clerk authentication and route protection
- Natural language transaction parsing via Gemini
- Transaction CRUD and full transaction log
- Dashboard with balance, charts, recent transactions
- Budget limits per category with progress indicators
- Savings goals with chat-driven contributions
- Manual investment log with portfolio summary
- Recurring reminders via Trigger.dev scheduled tasks
- Mobile-first responsive design

### Out of Scope
- Bank account linking or Plaid integration
- Live stock/crypto price feeds
- Multi-currency support
- Shared/joint accounts
- Export to CSV or PDF
- Push notifications (reminders are in-app/email only for now)
- Social features, sharing, or public profiles
- Billing or subscription tiers

## Success Criteria

1. A signed-in user can type "spent $50 on Uber" and see the transaction appear in the log and balance decrease.
2. The dashboard correctly shows spending by category using real transaction data.
3. A user can create a savings goal and track contributions to it via the chat.
4. A user can log a manual investment and see it in the portfolio summary.
5. Budget warnings appear when a category spend exceeds 80% of its limit.
6. A reminder set via chat triggers a notification on the correct date.
7. The app is fully usable on a 375px mobile screen with no layout breaks.
