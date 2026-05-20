# Current Issues

Active bugs and regressions. Remove an entry when the fix ships.

## Format

**[ISSUE-ID] Short title**
- **Spec:** `context/feature-specs/NN-name.md`
- **Severity:** critical | high | medium | low
- **Status:** open | investigating | fix-in-progress
- **Repro:** [exact steps]
- **Root cause:** [known or suspected]
- **Fix:** [approach or PR]

---

## [Open] Run retrieval has no ownership check
**Spec:** Feature 08
**Severity:** Major
**File:** app/api/chat/result/[runId]/route.ts:14
`runs.retrieve(runId)` returns task output for any runId without verifying the caller owns that run. An authenticated user who guesses another user's runId can read their parsed financial data. Full fix requires storing `runId → userId` in the ChatMessage or a separate table. Spec 09 (Wire Chat) should either add this storage or at minimum note it as a known limitation. Low practical risk given BudgBot's single-user threat model and the opacity of Trigger.dev run IDs.

## [Open] Clerk env keys required in Trigger.dev cloud worker (production)
**Spec:** Feature 08
**Severity:** Major
**File:** lib/env.ts:3-4
`lib/env.ts` validates `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` at module load time. The `trigger/parse-message.ts` task imports `lib/env.ts`. **Local dev**: resolved — `pnpm trigger:dev` passes `--env-file .env.local` so all keys are available to the worker. **Production**: these Clerk keys must also be added to the Trigger.dev dashboard environment variables, or `lib/env.ts` must be split into separate Next.js and Trigger.dev validation files so the worker only validates the vars it actually uses.
