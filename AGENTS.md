<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture-context.md` — system structure, boundaries, storage model, and invariants
3. `context/security-context.md` — threat model, defense layers, and code review checklist
4. `context/ui-context.md` — theme, colors, typography, and component conventions
5. `context/code-standards.md` — implementation rules and conventions
6. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
7. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps
8. `context/current-issues.md` — active bugs and regressions

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Security Rules (non-negotiable)

Before implementing any route or task that touches user input or AI output:

- Wrap user chat content in `<user_input>` XML tags before passing to Gemini
- Call `validateAmount()` from `lib/validators.ts` on every AI-parsed monetary amount before DB write
- Call `assertOwnership()` from `lib/validators.ts` in every DELETE and PATCH handler before executing
- Resolve `userId` from `auth()` + `getOrCreateUser()` only — never from the request body
- Import `lib/env.ts` in any file that makes an external call
- Check active reminder count before creating a new Reminder record (max 10)
