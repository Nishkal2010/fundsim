---
name: feature
description: Run a new FundSim feature through the software factory — spec, failing tests, minimal implementation, full verification, self-review, report. Enforces the spec→test→ship path so a cold agent ships correctly by default.
argument-hint: "<feature description>"
---

# /feature — the FundSim software factory

You are building the feature described in `$ARGUMENTS`. Do not skip steps and do not
reorder them. This command exists because FundSim's finance engines are
numerically sensitive: a feature that ships without a failing-test-first discipline
can silently break IRR, waterfall, or LBO math. Follow the sequence below exactly.

The spec template, the closed-loop instrumentation playbook, and the architecture map
this command depends on:

- Spec template: `docs/templates/feature-spec-template.md`
- Architecture / schema / routes: `.claude/context/architecture.md`
- Event taxonomy + metrics: `docs/INSTRUMENTATION_PLAYBOOK.md`
- Founder coding rules: `~/.claude/CLAUDE.md` (edit don't rewrite, no speculative
  abstractions, validate at boundaries, no emojis in code/commits)

## Boundaries

`api/*`, `src/*` only where the feature lives, `vercel.json`, and CI config are
founder-owned for deploy-critical edits. You may edit `src/*` to implement the
feature, but do not touch `api/*`, `vercel.json`, or CI without surfacing it as a
recommendation in the final report first.

## The enforced sequence

### 1. Spec

Copy `docs/templates/feature-spec-template.md` and fill every section for this
feature: problem, hypothesis, the PostHog event + feature flag it ships behind, the
metric it must move, the test plan, and the rollback. Write it to
`docs/specs/<feature-slug>.md`. Do not proceed until the hypothesis and the metric
are concrete — "improve UX" is not a metric; "lifts `simulator_completed` rate" is.

### 2. Failing tests first

Write the tests before the implementation. Put engine tests next to the existing
suites (`src/test/` or `src/utils/__tests__/`) and follow their golden-value style —
a new finance-engine function gets a numeric test with hand-checked expected outputs,
not a smoke test. Run `npm test` and confirm the new tests FAIL for the right reason.
If they pass before you write any code, the test is wrong — fix it.

### 3. Implement minimally

Write the least code that makes the failing tests pass. Edit existing files; reach
for new files only when the feature is genuinely new. No speculative abstractions, no
fallback handlers for impossible cases — validate at the boundary and trust internal
code. Gate the feature behind the flag named in the spec.

### 4. Verify

Run all four, in order, and do not declare done until each is clean:

```
npm run lint     # eslint src/
npm test         # vitest run — the new tests now pass, nothing else regressed
npm run build    # tsc -b && vite build — types compile, prod bundle builds
npm run dev      # vite on port 5200 — exercise the feature in the running app
```

"Build passes" is not "feature works." Open the app on port 5200 and exercise the
actual feature path before claiming it works.

### 5. Self-review the diff

Run `git diff` and review your own change as a reviewer would: dead code, leftover
debug logs, unhandled edge cases on the numeric path, comments that explain WHAT
instead of WHY, anything touching `api/*`/`vercel.json`/CI that should have been a
recommendation. Fix what you find.

### 6. Report

Report back, concisely:

- The spec path (`docs/specs/<feature-slug>.md`) and the hypothesis + metric.
- The tests added and that they failed first, then passed.
- The lint/test/build/dev verification results — actual outcomes, not assumptions.
- What you verified by hand in the app on port 5200.
- Any founder-owned change (`api/*`, `vercel.json`, CI, new env var, schema, or
  flag to create in PostHog) as an explicit recommendation, not a silent edit.
- Honest gaps: anything you did not test or had to guess.
