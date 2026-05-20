---
id: "01-design-system"
title: "Design System"
status: planned
priority: critical
scope: frontend
effort: S
depends_on: []
---

## Overview

Establishes the foundational UI components, design tokens, and typography for the entire app. Installs shadcn/ui, sets up the warm light-mode theme with amber accent, loads Plus Jakarta Sans and Geist Mono fonts, and creates the `cn()` utility. Every other feature depends on this.

## User Story

As a **developer**, I want **a consistent set of UI primitives, design tokens, and fonts**, so that **every screen shares the same warm, friendly visual language without duplicating styling logic**.

## Implementation Steps

### Frontend

1. Install and configure `shadcn/ui` — run `npx shadcn@latest init`, set style to `default`, base color to `neutral`, CSS variables enabled.
2. Add these shadcn components via `npx shadcn@latest add <component>`: `Button`, `Card`, `Dialog`, `Input`, `Textarea`, `ScrollArea`, `Badge`, `Progress`, `Separator`, `Skeleton`, `Tooltip`.
3. Replace `globals.css` with the full BudgBot token system — all CSS custom properties from `ui-context.md`, mapped to Tailwind utilities via `@theme inline`.
4. Load fonts in `app/layout.tsx` via `next/font/google`: `Plus_Jakarta_Sans` (weights 400, 500, 600, 700) and `Geist_Mono` (weight 400, 600). Apply as CSS variables `--font-jakarta` and `--font-mono` on `<html>`.
5. Set `font-family: var(--font-jakarta)` as the base body font in `globals.css`.
6. Create `lib/utils.ts` with a `cn()` helper using `clsx` + `tailwind-merge`.
7. Install `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.

## Scope Limits

- Do NOT modify generated `components/ui/*` files after installation.
- Do NOT add dark mode styles or `@media (prefers-color-scheme)` blocks — light mode only.
- Do NOT create custom component variants in this spec — only install the base shadcn components.

## Acceptance Criteria

- [ ] All shadcn components import and render without errors
- [ ] `cn()` in `lib/utils.ts` correctly merges and deduplicates Tailwind classes
- [ ] Plus Jakarta Sans loads and applies to all body text
- [ ] Geist Mono loads and is available via `font-mono` utility
- [ ] Page background renders as `#FAFAF8` (warm off-white), not pure white
- [ ] Amber accent color `#F59E0B` is available as `bg-accent` and `text-accent`
- [ ] `text-income` and `text-expense` tokens render green and red respectively
- [ ] `pnpm build` exits 0 with zero TypeScript errors
- [ ] No console errors in the browser

## Automated Tests

### E2E — `tests/features/01-design-system.spec.ts`

- **tokens render correctly**: Verifies page background is warm off-white and not default browser white
- **fonts load**: Verifies Plus Jakarta Sans is applied to body text (not system default)
- **income and expense colors**: Verifies `text-income` renders green and `text-expense` renders red

## Rollback

Delete `components/ui/`, `lib/utils.ts`, revert `globals.css` and `app/layout.tsx` to remove fonts and tokens, run `pnpm install` to clean packages.
