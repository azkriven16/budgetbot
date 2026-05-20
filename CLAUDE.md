# BudgBot — Claude Code Instructions

## Read first

Before implementing anything, read these files in order:

1. `context/project-overview.md` — what we're building and why
2. `context/architecture-context.md` — system boundaries and invariants
3. `context/security-context.md` — threat model and defense requirements
4. `context/ui-context.md` — design system, tokens, component conventions
5. `context/code-standards.md` — code rules (follow these exactly)
6. `context/ai-workflow-rules.md` — workflow, scoping, and review process
7. `context/progress-tracker.md` — current feature, done work, open questions
8. `context/current-issues.md` — active bugs to avoid reintroducing

## Workflow rule (non-negotiable)

**After implementing every feature spec, run `/spec-review` before marking it ✅ Done or starting the next spec.**

The review is mandatory. Do not skip it. Do not move on without it. If the user says "implement spec 07", your response sequence is:

1. Implement the spec
2. Run `/spec-review 07 Chat Interface UI`
3. Fix all 🚨 Critical findings
4. Fix ⚠️ Major findings or log them in `context/current-issues.md`
5. Run `pnpm build` — must exit 0
6. Mark the spec ✅ Done in `context/progress-tracker.md`

## Security rules (non-negotiable)

These apply to every route and background task that touches user input or AI output:

- Wrap user chat content in `<user_input>` XML tags before passing to Gemini
- Call `validateAmount()` from `lib/validators.ts` on every AI-parsed monetary amount before DB write
- Call `assertOwnership()` from `lib/validators.ts` in every DELETE and PATCH handler
- Resolve `userId` from `auth()` + `getOrCreateUser()` only — never from the request body
- Import `lib/env.ts` in any file that makes an external call (DB, AI, Trigger.dev)
- Check active reminder count before creating a Reminder (max 10 per user)

## Next.js version note

This project uses **Next.js 16** with breaking changes from what you know. Read `node_modules/next/dist/docs/` for any API you're unsure about. Middleware lives in `proxy.ts` (not `middleware.ts`) with a named export `proxy`.
