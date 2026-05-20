---
id: "04-app-shell"
title: "App Shell & Navigation"
status: planned
priority: high
scope: frontend
effort: M
depends_on:
  - "02-auth"
  - "01-design-system"
---

## Overview

Builds the persistent app shell that wraps all authenticated pages. Includes a mobile bottom navigation bar (4 tabs: Home, Transactions, Goals, Portfolio) and a desktop left sidebar. Sets up the `app/(dashboard)/layout.tsx` route group with the shell, and creates placeholder pages for each nav tab.

## User Story

As a **user**, I want **a clear navigation structure on both mobile and desktop**, so that **I can move between the dashboard, transactions, goals, and portfolio without confusion**.

## Implementation Steps

### Frontend

1. Create `app/(dashboard)/layout.tsx` — wraps all authenticated pages with the app shell. Calls `getOrCreateUser` server-side to ensure the user record exists in the DB. Renders `<BottomNav />` on mobile and `<Sidebar />` on desktop.
2. Create `components/shell/bottom-nav.tsx` — fixed bottom bar (`fixed bottom-0`), full width, `bg-surface border-t border-default`. Four nav items with Lucide icons and labels:
   - Home (`LayoutDashboard`) → `/dashboard`
   - Transactions (`ArrowLeftRight`) → `/transactions`
   - Goals (`Target`) → `/goals`
   - Portfolio (`TrendingUp`) → `/portfolio`
   - Active item uses `text-accent` color.
3. Create `components/shell/sidebar.tsx` — `hidden md:flex` fixed left sidebar, `w-64`, `bg-surface border-r border-default`. Same 4 nav items as vertical list. BudgBot wordmark at top. `UserButton` from Clerk at bottom.
4. Create `components/shell/header.tsx` — mobile-only top bar with BudgBot wordmark and `UserButton`. Hidden on `md:`.
5. Create placeholder pages:
   - `app/(dashboard)/dashboard/page.tsx` — "Dashboard coming soon"
   - `app/(dashboard)/transactions/page.tsx` — "Transactions coming soon"
   - `app/(dashboard)/goals/page.tsx` — "Goals coming soon"
   - `app/(dashboard)/portfolio/page.tsx` — "Portfolio coming soon"
6. Update `app/page.tsx` root redirect to point to `/dashboard`.

## Scope Limits

- Do NOT build actual page content — placeholders only.
- Do NOT add chat interface yet.
- Do NOT add any data fetching in this spec.

## Acceptance Criteria

- [ ] Bottom nav renders on mobile (≤768px) with all 4 tabs
- [ ] Sidebar renders on desktop (≥768px), bottom nav is hidden
- [ ] Active nav item highlights with accent color
- [ ] Navigating between tabs works without full page reload
- [ ] `UserButton` renders and shows the signed-in user's avatar
- [ ] All 4 placeholder pages render without errors
- [ ] Layout has correct padding to avoid content overlapping bottom nav on mobile
- [ ] `pnpm build` exits 0 with zero TypeScript errors

## Automated Tests

### E2E — `tests/features/04-app-shell.spec.ts`

- **bottom nav visible on mobile**: Verifies bottom nav renders at 375px viewport width
- **sidebar visible on desktop**: Verifies sidebar renders and bottom nav is hidden at 1280px
- **nav links work**: Verifies clicking each nav tab navigates to the correct route
- **active state highlights**: Verifies the current route's nav item has the accent color applied

## Rollback

Delete `app/(dashboard)/layout.tsx`, `components/shell/`, and all placeholder pages under `app/(dashboard)/`.
