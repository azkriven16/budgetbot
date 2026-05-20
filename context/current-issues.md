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

## [Open] Clerk env keys required in Trigger.dev worker environment
**Spec:** Feature 08
**Severity:** Major
**File:** lib/env.ts:3-4
`lib/env.ts` validates `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` at module load time. The `trigger/parse-message.ts` task imports `lib/env.ts`, meaning these Clerk keys must be provisioned in the Trigger.dev cloud environment even though the task never calls Clerk (userId is already resolved before the task is triggered). Configure these env vars in the Trigger.dev dashboard, or split env.ts into separate Next.js and Trigger.dev validation files.
