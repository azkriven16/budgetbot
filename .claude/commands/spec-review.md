You are running the mandatory post-spec code review for BudgBot. This review must happen after every feature spec before the spec can be marked ✅ Done.

## Your task

$ARGUMENTS contains the spec number and name (e.g. "06 Transaction API"). If empty, infer from `context/progress-tracker.md` — look for the most recent spec marked 🔄 In Progress.

### Step 1 — Identify scope

Read `context/progress-tracker.md` to confirm which spec is under review. List every file that was created or modified during this spec's implementation. If you are unsure, run:

```
git diff --name-only HEAD~1
```

or check the spec file at `context/feature-specs/` for the expected file list.

### Step 2 — Read each touched file in full

Do not skim. Read every file. You are looking for issues the implementer missed because they were focused on making it work, not on making it right.

### Step 3 — Run the review

Apply the full checklist from `context/ai-workflow-rules.md` (Post-Spec Code Review section). Use this severity model:

**🚨 Critical — fix before moving on**
- Unguarded runtime panics (missing null checks on env vars, network calls without error handling)
- Security violations (auth bypass, unscoped queries, raw user input reaching AI/DB)
- Data correctness bugs (wrong field, type coercion that silently changes value)
- Duplicate DB calls in the same request lifecycle eliminable with `React.cache()`

**⚠️ Major — fix in same session or log in current-issues.md**
- Violations of `code-standards.md` (raw hex in components, inline style for colors, `any` types)
- DRY violations where two files own the same constant that will diverge
- Missing empty states for data-dependent UI
- Dead exported functions (defined but never called)
- Unnecessary `'use client'` on components that need no hooks

**💡 Minor / Nitpick — note in output, fix when convenient**
- Confusing variable names, shadowed identifiers
- Self-referential CSS vars that work by accident
- Redundant auth checks the middleware already covers
- Locale-sensitive formatting on the server (use `'en-US'`, not `'default'`)

### Step 4 — Write the review report

Format every finding as:

```
**[SEVERITY] path/to/file.ts:line — Short title**
What the code does, why it's wrong, what to do instead.
```

Group findings by severity. Be direct — this is an internal roast, not a polite PR comment. If the code is fine, say so explicitly ("No findings" per category).

### Step 5 — Fix all 🚨 Critical items immediately

Do not ask for permission. Fix them now, in the same response after the report. Show the diffs.

### Step 6 — Fix ⚠️ Major items

Fix as many as possible in the same session. For any that require significant refactoring or a new spec, log them in `context/current-issues.md` with this format:

```markdown
## [Open] Short title
**Spec:** Feature XX
**Severity:** Major
**File:** path/to/file.ts:line
Description of the issue and what the fix should be.
```

### Step 7 — Update progress-tracker.md

- Move the spec status to ✅ Done
- Add a milestone entry under "Completed Milestones" with today's date and a one-line summary of what was built + what the review fixed

### Step 8 — Confirm the build passes

Run `pnpm build` and confirm it exits 0 before declaring the spec done. If it fails, fix it before marking done.
