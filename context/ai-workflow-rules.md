# Development Workflow

## Approach

Build BudgBot incrementally using a spec-driven workflow. Context files define what to build, how to build it, and what the current state of progress is. Always implement against these specs — do not infer or invent behavior from scratch.

## Scoping Rules

- Work on one feature spec at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.
- Do not add features not listed in a spec — if you think of something useful, add it to `project-overview.md` first.

## When To Split a Spec

Split a feature into two specs if it combines:

- UI changes AND background task changes
- Database schema changes AND API route changes (acceptable to combine when tightly coupled)
- Multiple unrelated API endpoints
- Behavior that is not clearly defined in the spec

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Foundation Components

Do not modify generated or third-party foundation files unless explicitly instructed:

- `components/ui/*` — shadcn/ui generated components
- `app/generated/` — Prisma generated client output
- `lib/prisma.ts` — only change this if the DB connection model changes

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- System architecture, storage model, or invariants → `architecture-context.md`
- Color tokens, typography, layout patterns → `ui-context.md`
- Code conventions or file organization rules → `code-standards.md`
- Feature scope → `project-overview.md`
- Progress → `progress-tracker.md` (always, after every spec)
- Active bugs → `current-issues.md` (add immediately when found)

## Before Moving To The Next Spec

1. The current spec works end to end within its defined scope.
2. No invariant from `architecture-context.md` was violated.
3. The feature works on a 375px mobile screen (no layout breaks).
4. `/spec-review` has been run and all 🚨 Critical findings are fixed.
5. `progress-tracker.md` is updated — status moved to ✅ Done.
6. If a bug was found during implementation, it is logged in `current-issues.md`.

## Post-Spec Code Review

Run `/spec-review [spec number and name]` after every spec. The full review checklist and severity model live in `.claude/commands/spec-review.md`. Summary:

After marking a spec ✅ Done, run a full code review on every file touched by that spec. Follow the CodeRabbit severity model:

### Review checklist

**🚨 Critical — fix before moving on**
- Unguarded runtime panics (missing null checks on env vars, network calls without error handling)
- Security violations (auth bypass, unscoped queries, raw user input reaching AI/DB)
- Data correctness bugs (wrong field used, type coercion that silently changes value)
- Duplicate DB calls in the same request lifecycle that can be eliminated with `React.cache()`

**⚠️ Major — fix in same session or log in current-issues.md**
- Violations of the standards in `code-standards.md` (raw hex in components, inline style for colors, `any` types)
- DRY violations where two files own the same constant/logic that will diverge (nav items, category colors)
- Missing empty states for data-dependent UI
- Dead exported functions (defined but never called)
- Unnecessary client components (`'use client'` on a component that needs no hooks)

**💡 Minor / Nitpick — note in review output, fix when convenient**
- Confusing variable names, shadowed identifiers
- Self-referential CSS vars that work by accident
- Redundant auth checks the middleware already covers
- Locale-sensitive formatting on the server (use explicit locale, not `'default'`)

### Output format

Write the review as a structured markdown report. For every finding:
```
**[SEVERITY] File:Line — Short title**
What the code does, why it's wrong, what to do instead.
```

After the report, immediately fix all 🚨 Critical items and as many ⚠️ Major items as possible in the same response. Log anything not fixed in `context/current-issues.md`.
