# Code Standards

## General

- Keep modules small and single-purpose — one responsibility per file.
- Fix root causes — never layer workarounds over broken behavior.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.
- No AI calls or long-running work in route handlers — delegate to Trigger.dev tasks.

## TypeScript

- Strict mode is required throughout the project (`"strict": true` in `tsconfig.json`).
- Avoid `any` — use explicit interfaces or Zod-inferred types.
- Validate all unknown external input at system boundaries (API routes, Trigger.dev task payloads) using Zod before trusting it.
- Use `interface` for object contracts; use `type` for unions and aliases.
- Derive types from Prisma's generated client where possible — do not duplicate model shapes manually.

## Next.js

- Default to React Server Components. Add `"use client"` only when the component needs browser interactivity, hooks, or state.
- Route groups: `app/(dashboard)/` for protected pages, `app/(auth)/` for public auth pages.
- Data fetching in Server Components — fetch directly in the component, do not pass everything through props chains.
- Keep route handlers in `app/api/` thin — push logic into `lib/` helpers or Trigger.dev tasks.
- Use `next/font/google` to load fonts — never link to Google Fonts CDN directly.
- Middleware lives in `proxy.ts` at the project root (Next.js 16 convention — not `middleware.ts`).

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw hex values or Tailwind color utilities like `amber-500`, `zinc-*`, `rose-*`.
- Reference tokens through their Tailwind utility names: `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `bg-accent`, `text-income`, `text-expense`, `border-default`, etc.
- Maintain the border radius scale from `ui-context.md`.
- Mobile-first: write base styles for mobile, use `md:` and `lg:` prefixes for wider breakpoints.
- Do not use inline `style` props for colors or spacing — use token utilities.

## API Routes

- Parse and validate all request bodies with Zod before any logic runs.
- Call `auth()` from `@clerk/nextjs/server` at the top of every route handler — return 401 immediately if unauthenticated.
- All DB queries filter by `clerkId` (or the user's `id` after lookup) — never return another user's data.
- Return consistent response shapes: `{ data: ... }` for success, `{ error: string }` for failure.
- Keep handlers thin: one DB operation or one task trigger per handler.

## Data and Storage

- All data lives in PostgreSQL via Prisma — no blob storage, no local file writes.
- The Prisma client is a singleton in `lib/prisma.ts` — import it from there everywhere.
- Never instantiate `PrismaClient` outside of `lib/prisma.ts`.
- Prisma 7 uses `provider = "prisma-client"` (not `"prisma-client-js"`) in the generator block.
- Model files go in `prisma/models/*.prisma` — the main `prisma/schema.prisma` holds only generator and datasource blocks.
- User balance must always reflect the sum of all transactions — never update `balance` without creating a corresponding transaction record.

## AI / Trigger.dev

- Use `schemaTask` for all Trigger.dev tasks that accept structured payloads — validates input automatically.
- The AI parsing task uses `generateObject` with a Zod schema — always check the result before writing to DB.
- Use `gemini-2.0-flash` model — fast and cheap for structured extraction.
- Handle AI parse failures gracefully — return a chat message indicating the message was not understood.
- Always wrap user message content in `<user_input>` XML tags in the Gemini prompt — never interpolate raw user strings into the instruction portion of the prompt.
- AI SDK v6 token usage fields are `usage.inputTokens` and `usage.outputTokens` — `promptTokens` and `completionTokens` do not exist in v6 and silently return `undefined`. Always use `inputTokens`/`outputTokens`.

## Security

- Call `auth()` at the top of every route handler — resolve `userId` from there, never from the request body.
- Call `assertOwnership(record.userId, authenticatedUserId)` from `lib/validators.ts` in every DELETE and PATCH handler before executing.
- Call `validateAmount(value)` from `lib/validators.ts` on every AI-parsed monetary amount before writing to the database.
- All chat message inputs must be validated with `z.string().min(1).max(2000)` — no unbounded strings reach the AI.
- Import `lib/env.ts` in any file that makes an external call (DB, AI, Trigger.dev) — ensures startup validation runs before the call.
- See `context/security-context.md` for the full threat model, defense layers, and code review checklist.

## File Organization

| Directory | What belongs here | Naming |
|-----------|------------------|--------|
| `lib/` | Prisma singleton, auth helpers, category constants, utils | `kebab-case.ts` |
| `components/` | UI components only — no business logic | `PascalCase.tsx` |
| `components/ui/` | shadcn/ui generated — do not modify | (generated) |
| `components/dashboard/` | Dashboard-specific components | `PascalCase.tsx` |
| `components/chat/` | Chat interface components | `PascalCase.tsx` |
| `app/api/` | Route handlers | `route.ts` |
| `app/(dashboard)/` | Protected pages | `page.tsx` |
| `app/(auth)/` | Auth pages | `page.tsx` |
| `trigger/` | Background tasks | `kebab-case.ts` |
| `prisma/models/` | Prisma model files | `kebab-case.prisma` |
| `types/` | Shared TypeScript types and interfaces | `kebab-case.ts` |
