---
id: "02-auth"
title: "Authentication"
status: planned
priority: critical
scope: infra
effort: S
depends_on:
  - "01-design-system"
---

## Overview

Sets up Clerk authentication for BudgBot. Protects all routes except sign-in and sign-up, wraps the root layout with `ClerkProvider`, and creates the auth pages styled with the BudgBot light theme.

## User Story

As a **user**, I want **to sign up and sign in securely**, so that **my financial data is private and only accessible to me**.

## Implementation Steps

### Backend

1. Install `@clerk/nextjs`. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`.
2. Create `proxy.ts` at the project root (Next.js 16 middleware file). Export `clerkMiddleware` as `proxy` and a `config` matcher that protects all routes except `/sign-in(.*)` and `/sign-up(.*)`.

### Frontend

1. Wrap `app/layout.tsx` with `ClerkProvider`. Apply light theme appearance variables matching BudgBot tokens.
2. Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx` — render `<SignIn />` centered on a warm `bg-base` background.
3. Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx` — render `<SignUp />` centered on a warm `bg-base` background.
4. Create `app/page.tsx` — auth-aware redirect: authenticated → `/dashboard`, unauthenticated → `/sign-in`.

## Scope Limits

- Do NOT build any custom auth UI — use Clerk's prebuilt `<SignIn />` and `<SignUp />` components.
- Do NOT create the dashboard page in this spec — just the redirect.
- Do NOT sync Clerk users to the database yet — that happens in spec 03.

## Acceptance Criteria

- [ ] Visiting any protected route while unauthenticated redirects to `/sign-in`
- [ ] Visiting `/sign-in` while authenticated redirects to `/dashboard`
- [ ] `proxy.ts` exists at project root and exports `proxy` (not `middleware`)
- [ ] `ClerkProvider` wraps the root layout
- [ ] Sign-in and sign-up pages render without errors
- [ ] `pnpm build` exits 0 with zero TypeScript errors
- [ ] No console errors in the browser

## Automated Tests

### E2E — `tests/features/02-auth.spec.ts`

- **unauthenticated redirect**: Verifies visiting `/dashboard` redirects to `/sign-in`
- **authenticated redirect**: Verifies a signed-in user visiting `/sign-in` is redirected to `/dashboard`
- **sign-in page renders**: Verifies the Clerk sign-in component renders on `/sign-in`

## Rollback

Remove `proxy.ts`, remove `ClerkProvider` from `app/layout.tsx`, delete `app/(auth)/`, remove Clerk env vars from `.env.local`, uninstall `@clerk/nextjs`.
