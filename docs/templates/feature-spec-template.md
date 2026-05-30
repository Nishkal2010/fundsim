# Feature Spec + Test Template (spec → test → ship)

This is the copy-pasteable template for the FundSim software factory: the path of least
resistance for taking any feature from idea to shipped, runnable by a cold agent with no
prior context on the task. It implements Deliverable C1 of
[`docs/AI-NATIVE-OPERATING-SYSTEM.md`](../AI-NATIVE-OPERATING-SYSTEM.md) (principle 3, "the
factory is repeatable", and principle 5, "decisions are instrumented").

**How to use it.** Copy everything under the `--- COPY BELOW ---` line into a new file
(suggested: `docs/specs/<feature-slug>.md`), fill every `<…>` placeholder, and work the
sections top to bottom. The `/feature` slash command
([`.claude/commands/feature.md`](../../.claude/commands/feature.md), Deliverable C2) drives
this same path when present. Do not skip the Test plan or the Verification gate — a feature
is not shipped until `npm run lint && npm test` are green and `npm run build` produces a
bundle.

**Why each section exists.**

- **Problem / Hypothesis / Metric** — every ship must carry a falsifiable bet and a number
  it moves, so the loop can be closed later by the telemetry review
  ([`docs/AI-NATIVE-OPERATING-SYSTEM.md`](../AI-NATIVE-OPERATING-SYSTEM.md) principle 2).
- **Scope (touch / do-not-touch)** — the founder owns `api/*`, `src/*` business logic edits,
  `vercel.json`, and CI config; a feature spec names exactly what it will edit so review is
  bounded.
- **Test plan** — FundSim's hard core is the numeric finance engines in `src/utils/`. The
  rule is: no engine math ships without a golden-file numeric test with hand-checked expected
  values. UI/flow features ship with component or integration tests.
- **Verification / Rollback** — the ship is gated on the real commands, and every behavioral
  change hides behind a feature flag so rollback is a flag flip, not a redeploy.

**Repo facts this template is grounded in (verified this pass):**

- Test scripts (`package.json`): `test` = `vitest run`, `test:watch` = `vitest`,
  `test:coverage` = `vitest run --coverage`, `lint` = `eslint src/`, `build` = `tsc -b && vite build`.
- Vitest config (`vitest.config.ts`): `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`
  (which imports `@testing-library/jest-dom`), test glob `src/**/*.{test,spec}.{ts,tsx}`.
  Coverage `include: ["src/utils/**", "src/hooks/**"]`, `exclude: ["src/utils/__tests__/**"]`.
- Test deps available: `vitest@^2`, `@vitest/coverage-v8@^2`, `@testing-library/react@^16`,
  `@testing-library/user-event@^14`, `@testing-library/jest-dom@^6`, `jsdom@^25`.
- Engine suites live in two places: `src/test/*.test.ts` (lbo, portfolio, fundLifecycle, irr,
  jCurve, vcRound, waterfall) and `src/utils/__tests__/*.test.ts` (formatting, performance,
  plus engine duplicates). New engine tests go in `src/test/<engine>.test.ts`.
- House test style: `import { describe, it, expect } from "vitest";` then named imports from
  the engine under test; build typed input fixtures as module-level consts; group with nested
  `describe` blocks separated by box-drawing comment rules; use `toBeCloseTo(value, digits)`
  for all float comparisons (never bare `toBe` on a computed float).

---

## --- COPY BELOW ---

````markdown
# Feature: <short imperative title>

Status: draft | in-progress | shipped | rolled-back
Owner: Nishkal (judgment) + <agent or worktree running the build>
Spec date: <YYYY-MM-DD>
Linear issue: <FUN-XX or "none">

## Problem

<One paragraph. What is broken, missing, or underexploited TODAY? Cite the concrete signal:
a PostHog funnel drop, a Sentry issue, a support message, a user request, or a strategic gap
from PRODUCT_STRATEGY.md. No solution language here — only the problem.>

## Hypothesis (what we believe)

We believe that <change> will cause <observable outcome> for <which user — e.g. free-tier
simulator users, Pro subscribers, club champions>.
We will know we were right when <the metric below> moves by <direction + rough magnitude>.
We will know we were wrong if <the failure signal — metric flat, or guardrail metric regresses>.

## Metric it moves

- **Primary PostHog event:** `<event_name>` — <what fires it, e.g. "user completes an LBO
  scenario and clicks Export">. If this event does not yet exist in `src/`, adding the
  `posthog.capture("<event_name>", { … })` call is part of this feature's scope (it edits
  `src/*`, so it is a founder-reviewed change — see Implementation steps).
- **Funnel / north-star tie-in:** <which of the funnels in the instrumentation playbook,
  `docs/AI-NATIVE-OPERATING-SYSTEM.md` Deliverable B1, this rolls up to>.
- **Guardrail metric (must NOT regress):** <e.g. simulator time-to-first-result, error rate
  in Sentry, checkout conversion>.
- **Feature flag (PostHog):** `<feature-flag-key>` — kebab-case, scoped to this feature.
  Default OFF. The new behavior is gated on this flag so the ship is reversible without a
  redeploy. Create it via the PostHog MCP `create-feature-flag` (or the PostHog UI) before
  enabling in prod.

## Scope

**Files to TOUCH** (exhaustive — if it is not listed here, the change does not edit it):

- `<src/utils/newEngine.ts>` — <one line: what changes>
- `<src/test/newEngine.test.ts>` — golden-file numeric test (new)
- `<src/components/.../Foo.tsx>` — <one line>
- …

**Files NOT to touch** (founder-owned; reference as recommendations only, never edit in an
agent-run feature):

- `api/*` (chat, create-checkout, stripe-webhook, share-create, share-meta, og, health)
- `vercel.json`
- CI config (`.github/workflows/*`)
- Any secret / `.env*`

> If the feature genuinely requires an `api/*` or `vercel.json` change, write that part as a
> numbered recommendation in Implementation steps for the founder to apply, and keep the
> agent-built diff strictly inside `src/` + tests + docs.

## Test plan

Pick the lane that matches the feature.

### Lane A — finance engine math (golden-file numeric test, REQUIRED for any engine change)

A golden-file test pins the engine's output to hand-derived expected values so a numeric
regression cannot slip through silently. Rules:

1. Compute the expected values by hand (or in a scratch sheet) from the inputs — do not copy
   them from a run of the code you are testing (that just freezes a bug). Write the derivation
   as a comment, the way `src/test/vcRound.test.ts` documents `pricePerShare ≈ $0.72`.
2. Put the file at `src/test/<engine>.test.ts`.
3. Compare every computed float with `toBeCloseTo(expected, digits)`, never `toBe`.
4. Assert the invariants, not just point values: conservation (proceeds sum to exit value),
   monotonicity (more dilution → lower founder %), determinism (same inputs → identical output).

```ts
import { describe, it, expect } from "vitest";
import { calculateNewEngine } from "../utils/newEngine";
import type { NewEngineInput } from "../utils/newEngine";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_INPUT: NewEngineInput = {
  // <fill with a typed, realistic scenario — keep it small enough to hand-derive>
};

// ── Golden values (hand-derived — show the arithmetic) ──────────────────────
//
// Given <inputs>, the expected results are:
//   result.foo = <X>   because <one-line derivation>
//   result.bar = <Y>   because <one-line derivation>
//
// These are NOT snapshots of the code under test — they are computed independently.

describe("calculateNewEngine — golden file", () => {
  it("matches hand-derived values for the base scenario", () => {
    const r = calculateNewEngine(BASE_INPUT);
    expect(r.foo).toBeCloseTo(/* X */ 0, 4);
    expect(r.bar).toBeCloseTo(/* Y */ 0, 4);
  });

  it("is deterministic — same inputs produce identical output", () => {
    const a = calculateNewEngine(BASE_INPUT);
    const b = calculateNewEngine(BASE_INPUT);
    expect(a.foo).toBe(b.foo);
    expect(a.bar).toBe(b.bar);
  });
});

// ── Invariants ───────────────────────────────────────────────────────────────

describe("calculateNewEngine — invariants", () => {
  it("conserves total value (parts sum to the whole)", () => {
    const r = calculateNewEngine(BASE_INPUT);
    expect(r.partA + r.partB).toBeCloseTo(r.total, 6);
  });

  it("moves monotonically with its key driver", () => {
    const low = calculateNewEngine({ ...BASE_INPUT, driver: 1 });
    const high = calculateNewEngine({ ...BASE_INPUT, driver: 5 });
    expect(high.foo).toBeGreaterThan(low.foo);
  });
});

// ── Edge cases ─────────────────────────────────────────────────────────────

describe("calculateNewEngine — edge cases", () => {
  it("handles the zero / empty case gracefully", () => {
    const r = calculateNewEngine({ ...BASE_INPUT /* zero out the driver */ });
    expect(Number.isFinite(r.foo)).toBe(true);
  });
});
```
````

### Lane B — component / flow feature (component or integration test)

For UI, gating, or capture-event features, render the component with Testing Library and
assert observable behavior. The jsdom environment and `@testing-library/jest-dom` matchers
are already wired via `src/test/setup.ts`.

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Foo } from "../components/.../Foo";

describe("<Foo>", () => {
  it("renders the gated CTA when the flag is on", () => {
    render(<Foo flagEnabled={true} />);
    expect(
      screen.getByRole("button", { name: /upgrade/i }),
    ).toBeInTheDocument();
  });

  it("fires the PostHog event on the tracked action", async () => {
    const capture = vi.fn();
    render(<Foo posthogCapture={capture} flagEnabled={true} />);
    await userEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(capture).toHaveBeenCalledWith(
      "<event_name>",
      expect.objectContaining({
        /* expected props */
      }),
    );
  });

  it("falls back to the old behavior when the flag is off", () => {
    render(<Foo flagEnabled={false} />);
    expect(
      screen.queryByRole("button", { name: /upgrade/i }),
    ).not.toBeInTheDocument();
  });
});
```

> File placement: a component test lives next to the engine convention as
> `src/test/<feature>.test.tsx` or `src/components/.../__tests__/<Component>.test.tsx`.
> Either matches the `src/**/*.{test,spec}.{ts,tsx}` glob.

## Implementation steps

1. Write the spec (this file). Get the hypothesis + metric + flag named before any code.
2. Create the PostHog feature flag `<feature-flag-key>` (default OFF).
3. Write the failing test FIRST (Lane A or B above). Run `npm run test:watch` and confirm it
   fails for the right reason.
4. Implement the change in the TOUCH files only. Gate every behavioral change on the flag.
5. (If a PostHog event is new) add the `posthog.capture("<event_name>", …)` call — this edits
   `src/*`, so flag it for founder review in the diff.
6. Make the test pass. Add edge-case and invariant assertions until the behavior is pinned.
7. (Founder recs only) Note any required `api/*`, `vercel.json`, or CI changes here as a
   numbered list for the founder — do not edit those files.

## Verification (the ship gate)

Run, in order, and paste the result into the PR / spec. All three must pass:

```bash
npm run lint && npm test && npm run build
```

- `npm run lint` → `eslint src/` clean.
- `npm test` → `vitest run`, all suites green (including the new golden-file / component test).
- `npm run build` → `tsc -b && vite build` produces a bundle with no type errors.

For UI/flow features, also verify in the real app per the founder rule "build passes is not
feature works": `npm run dev` (port 5200), open the simulator, trigger the path, confirm the
PostHog event fires (PostHog live events view) and the flag toggles the behavior.

## Rollback

- **Primary:** turn the PostHog feature flag `<feature-flag-key>` OFF. The new behavior
  disappears with no redeploy. This is the default rollback and must work because every
  behavioral change is flag-gated.
- **If a flag flip is insufficient** (e.g. a pure refactor or an engine fix that is not
  behind a flag): `git revert <commit>` and redeploy `main`. Engine fixes ship with their
  golden-file test, so a revert restores both code and the expectation it was pinned to.
- **Decision log:** record the outcome (metric moved / flat / regressed, flag left on or
  rolled back) so the bet feeds the next loop (principle 8, knowledge compounds).

````

## --- COPY ABOVE ---

---

## Founder CI recommendation: coverage floor

Vitest is already configured with `@vitest/coverage-v8` and a coverage `include` of
`src/utils/**` and `src/hooks/**` (the finance engines and hooks — the code worth protecting),
excluding the test dirs. To make principle 6 ("quality is automated") enforced rather than
optional, the founder should add a coverage threshold so a feature cannot ship while dropping
engine coverage. This is a CI/config change and therefore a recommendation, not an edit
applied by this template.

Recommended addition to the `test.coverage` block in `vitest.config.ts`:

```ts
coverage: {
  include: ["src/utils/**", "src/hooks/**"],
  exclude: ["src/utils/__tests__/**"],
  thresholds: {
    // Start at roughly the current engine coverage and ratchet up over time;
    // do not set a number above where the suite is today or every PR fails.
    lines: 70,
    functions: 70,
    branches: 60,
    statements: 70,
  },
},
````

Then gate it in CI by running `npm run test:coverage` (which already passes `--coverage`) as a
required check in the production workflow. Establish the real starting numbers first with
`npm run test:coverage`, set the thresholds at or just below those numbers, and ratchet them
up — never set a floor the current suite cannot clear, or you block every ship.

## Related deliverables

- [`docs/AI-NATIVE-OPERATING-SYSTEM.md`](../AI-NATIVE-OPERATING-SYSTEM.md) — the roadmap this
  template implements (Deliverable C1).
- [`.claude/commands/feature.md`](../../.claude/commands/feature.md) — the `/feature` slash
  command that drives this spec → test → ship path (Deliverable C2).
- [`.claude/agents/finance-engine-reviewer.md`](../../.claude/agents/finance-engine-reviewer.md)
  — the domain reviewer that checks engine diffs and their golden-file tests (Deliverable D1).
- [`COMPANY.md`](../../COMPANY.md) and
  [`.claude/context/architecture.md`](../../.claude/context/architecture.md) — the queryable
  context a cold agent reads first to fill the Scope section accurately (Deliverables A1, A2).
