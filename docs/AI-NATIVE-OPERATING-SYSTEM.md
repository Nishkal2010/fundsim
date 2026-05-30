# FundSim AI-Native Operating System

> **Thesis.** FundSim is a one-person company with a real product, live billing, and three best-in-class telemetry pipes (PostHog, Sentry, Vercel) already wired in — but it operates like a traditional solo dev shop: the founder is still the integration point for every loop (build, measure, decide, act). The leverage is not more code; it is _closing loops without the founder in the middle_. This document converts eight principle-audits into one ranked plan: make the company's context queryable by agents, turn the live instrumentation into closed feedback loops, build a software factory (spec → test → ship) that a cold agent can run, and stand up a `.claude/` agent fleet that maps a CEO/CTO/COO operating model onto a single founder plus a token-maxed agent swarm. Everything here is additive and low-risk; deploy-critical changes (api/_, src/_, vercel.json) are deliberately routed to founder-owned recommendations, not auto-built deliverables.

---

## How to read this

This roadmap is organized around **eight operating principles** of an AI-native company. Each is scored honestly against where FundSim is today (May 2026), given a target, and assigned the single biggest lever to move it. Then per-principle detail, then a consolidated impact-ranked backlog, then the founder's operating cadence.

> Grounding: verified against the live repo on this pass. Confirmed facts that shape the plan: `.claude/` contains `skills/` and `worktrees/` but **no `agents/`, `commands/`, `hooks/`, or `multi-agent/` dirs** (the fleet gap). Finance engines live in `src/utils/` — `waterfall.ts, jCurve.ts, irr.ts, performance.ts, fundLifecycle.ts, vcRound.ts, lbo.ts, portfolio.ts, marketSizing.ts, qualitative.ts` — with vitest suites split across `src/test/` (lbo, portfolio, fundLifecycle, irr, jCurve, vcRound, waterfall) and `src/utils/__tests__/` (formatting, performance, plus a raw `engine.test.mjs`). API routes confirmed: `api/{chat,create-checkout,stripe-webhook,share-create,share-meta,og,health}.ts`. Component tree confirms the simulator set (LBO, DCF, VC, Waterfall, JCurve, FundLifecycle, IB, PE, Portfolio, Performance) plus gamification (DealChallenge, Leaderboard, DECA) and the monetization/lead loops (`ProGate.tsx`, `EmailCapture`, `ShareButton`/`ShareView`). Build/test scripts: `dev` (vite, port 5200), `build` (tsc -b && vite build), `lint` (eslint src/), `test` (vitest run), `test:coverage` (has `@vitest/coverage-v8`).

---

## Scorecard

| #   | Principle                                                                                                                  | Now  | Target | Biggest lever                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------- |
| 1   | **Context is queryable** — agents can answer "what is FundSim, what's the schema, what's the strategy" without the founder | 4/10 | 9      | One `COMPANY.md` + `.claude/context/` pack that indexes the existing docs into an agent-readable map |
| 2   | **Loops are closed** — telemetry → insight → action happens without manual export                                          | 3/10 | 8      | An instrumentation playbook + scheduled agent that reads PostHog/Sentry and files Linear issues      |
| 3   | **The factory is repeatable** — any feature can go spec → test → ship by a cold agent                                      | 4/10 | 8      | A spec+test template and a `/feature` command that enforces the path                                 |
| 4   | **The fleet exists** — specialized agents close specific loops, not one generalist                                         | 2/10 | 8      | Seed `.claude/agents/` (the brief confirms this dir is empty — the gap)                              |
| 5   | **Decisions are instrumented** — every ship has a hypothesis + a metric it moves                                           | 3/10 | 7      | Tie the spec template to a PostHog event + a feature flag per feature                                |
| 6   | **Quality is automated** — review, test, and guardrails run without prompting                                              | 6/10 | 9      | Vitest + Sentry exist; add a review agent + a coverage gate doc                                      |
| 7   | **The operating model is explicit** — the founder knows which "hat" each block of time wears                               | 2/10 | 8      | An operating-model doc mapping CEO/CTO/COO archetypes onto solo + fleet                              |
| 8   | **Knowledge compounds** — learnings persist and feed the next loop                                                         | 5/10 | 8      | MEMORY.md exists; add a retro→memory loop and a decision log                                         |

**Weighted reading:** the two lowest scores (fleet = 2, operating model = 2) are also the two highest-leverage because they unlock every other principle — a fleet that can read queryable context and run the factory is the whole game. Start there.

---

## Per-principle: current state, gaps, prioritized actions

### 1. Context is queryable (4 → 9)

**Current.** FundSim has _excellent_ prose docs — `PRODUCT_STRATEGY.md`, `CODEBASE.md`, `market_opportunity_analysis.md`, `README.md`, plus `docs/` (ops, outreach, research, social, `OVERNIGHT_AGENT.md`). MEMORY.md indexes some of it. But this is human-readable narrative, not an agent-queryable index. An agent spawned cold has to read 6+ long files to learn the schema, the routes, the pricing model, and the strategy.

**Gaps.**

- No single `COMPANY.md` that answers the 20 questions an agent asks first (what is the product, who is the user, what's the schema, what are the routes, what's monetized, what's the deploy path, what must never break).
- No machine-friendly facts file (schema as a table, routes as a list, env-var contract).
- Docs aren't cross-linked into a `.claude/`-discoverable map, so the harness doesn't surface them.

**Actions (ranked).**

1. **[Deliverable A1]** Write `COMPANY.md` — the queryable single source of truth.
2. **[Deliverable A2]** Write `.claude/context/architecture.md` — schema, routes, env contract as tables.
3. Cross-link from `CLAUDE.md` (founder rec — edits an existing file).

### 2. Loops are closed (3 → 8)

**Current.** PostHog, Sentry, Vercel Analytics are _installed and wired_ (main.tsx, App.tsx). This is the single biggest underexploited asset: the data exists, but nothing reads it on a schedule and acts. The founder is the closed loop — they have to log into PostHog to see a funnel drop or into Sentry to see a spike.

**Gaps.**

- No defined event taxonomy (which events matter, what they're named, what a "good" funnel looks like).
- No scheduled agent reading PostHog/Sentry and filing Linear issues for regressions.
- No "north-star + guardrail metric" definition.

**Actions (ranked).**

1. **[Deliverable B1]** Write the closed-loop instrumentation playbook: event taxonomy, the 5 funnels that matter, the north-star metric, and the exact PostHog/Sentry MCP queries to run.
2. **[Deliverable B2]** Write a `weekly-telemetry-review` agent that runs those queries and drafts a digest + Linear issues.
3. Add the missing PostHog events in-app (founder rec — edits src/\*).

### 3. The factory is repeatable (4 → 8)

**Current.** Vitest suites cover the finance engines (vcRound, irr, jCurve, waterfall, fundLifecycle, portfolio, lbo). The hard, numerically-sensitive core is tested — that's the right instinct. But there's no _template_ that makes "add a feature correctly" the path of least resistance.

**Gaps.**

- No spec template (problem → hypothesis → metric → test plan → rollback).
- No test template that pairs a new engine function with a golden-file numeric test.
- No `/feature` command enforcing spec → test → implement → verify.

**Actions (ranked).**

1. **[Deliverable C1]** Write the software-factory spec+test template.
2. **[Deliverable C2]** Write a `.claude/commands/feature.md` slash command that drives the factory path.
3. Adopt a coverage floor in CI (founder rec — edits CI config).

### 4. The fleet exists (2 → 8)

**Current.** The `.claude/` harness exists (skills/, settings.local.json, agent-metrics.jsonl) but has **no agents/, commands/, hooks/, or multi-agent/ dirs** — confirmed gap in the brief. MEMORY.md references a "FAMS multi-agent system" and an 11-agent stack, but those live as memory notes, not as wired `.claude/agents/` files. So the fleet is aspirational, not operational.

**Gaps.** Every specialized loop (telemetry review, code review, outreach drafting, finance-engine correctness) is run by the generalist main thread.

**Actions (ranked).**

1. **[Deliverable D1]** Seed `.claude/agents/finance-engine-reviewer.md` — a domain reviewer for the numeric hot paths.
2. **[Deliverable B2]** `weekly-telemetry-review` agent (also serves principle 2).
3. **[Deliverable D2]** Seed `.claude/agents/growth-loop.md` — drafts outreach + content from the playbooks already in MEMORY.md.

### 5. Decisions are instrumented (3 → 7)

**Current.** Ships happen; there's no enforced link from a ship to a hypothesis and a metric. Feature flags (PostHog supports them, and the MCP exposes create-feature-flag) are available but not used as the default gate.

**Gaps.** No decision log; no per-feature flag+event convention.

**Actions.** Bake "hypothesis + metric + flag" into the spec template (C1). Add a decision log (E2). Adopt feature-flag-per-feature (founder rec).

### 6. Quality is automated (6 → 9)

**Current.** Strongest principle. Vitest covers engines; Sentry catches runtime errors; the API endpoint is origin-locked, rate-limited, input-validated. Good hygiene.

**Gaps.** No automated review pass on diffs; no coverage gate; numeric regressions in engines could slip if a test isn't added alongside.

**Actions.** Finance-engine-reviewer agent (D1); coverage-gate doc as part of the factory (C1); a pre-push review (founder rec — hooks).

### 7. The operating model is explicit (2 → 8)

**Current.** The founder context-switches between CEO work (strategy, outreach, fundraising-adjacent), CTO work (the actual building), and COO work (ops, billing, support) with no explicit model. MEMORY.md shows heavy CEO-mode artifacts (outreach playbooks, comms kits) — evidence the founder already wears these hats, just implicitly.

**Gaps.** No doc that says "Monday is COO/metrics, building is CTO-mode with the fleet, outreach is CEO-mode delegated to the growth agent."

**Actions.**

1. **[Deliverable E1]** Write the operating-model doc (the cadence section below, expanded).
2. **[Deliverable E2]** Decision log + retro→memory loop.

### 8. Knowledge compounds (5 → 8)

**Current.** MEMORY.md is a genuine asset and is actively maintained (it indexes projects, Linear, outreach). Good.

**Gaps.** No structured retro that writes back to memory; learnings live in chat, not in a durable decision log.

**Actions.** Decision log (E2); a `/retro` cadence that appends to MEMORY.md (founder habit, supported by E2).

---

## Consolidated, impact-ranked backlog

### A) Quick wins (hours, zero deploy risk)

1. **Write `COMPANY.md`** — the single queryable context file. Unblocks every agent. (Deliverable A1)
2. **Write `.claude/context/architecture.md`** — schema/routes/env as tables. (Deliverable A2)
3. **Write the instrumentation playbook** turning the already-live PostHog/Sentry into named funnels + queries. (Deliverable B1)
4. **Seed the first two agents** (`finance-engine-reviewer`, `weekly-telemetry-review`) so the fleet exists at all. (Deliverables D1, B2)
5. **Write the spec+test template + `/feature` command** so the factory path is the default. (Deliverables C1, C2)

### B) Infrastructure to build (days)

- The full `.claude/agents/` fleet (reviewer, telemetry, growth, factory-runner) — start with D1/B2/D2, expand.
- A scheduled telemetry-review (cron via the scheduled-tasks MCP) that runs the playbook weekly and files Linear issues. _(Founder rec — wires a cron + Linear writes.)_
- Feature-flag-per-feature convention in-app + a PostHog event taxonomy actually emitted. _(Founder rec — edits src/_.)\*
- A coverage gate in CI + a pre-push review hook. _(Founder rec — edits CI / hooks.)_

### C) Operating-model / process (ongoing)

- Adopt the founder cadence (below): a weekly loop with explicit hats.
- Decision log + retro→memory discipline (E1, E2).
- "Token-max" stance: default to spawning parallel agents for any multi-file or research task; reserve the main Opus thread for judgment and integration.

---

## Founder operating cadence — three archetypes on one founder + a fleet

A traditional company splits into **CEO** (where are we going, who do we sell to), **CTO** (what do we build, is it correct), and **COO** (does the machine run, what do the numbers say). A solo founder wears all three; the AI-native move is to **assign each hat a default agent loop** so the founder only does the judgment, not the legwork.

| Hat     | Owns                                                                        | Default agent loop                                                                                                   | Founder's actual job                                |
| ------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **CEO** | Strategy, positioning, outreach, partnerships (clubs/profs/DECA per MEMORY) | `growth-loop` agent drafts outreach + content from the comms-kit playbooks; deep-research agent gathers market facts | Pick targets, approve sends, set the bet            |
| **CTO** | What to build, correctness of the finance engines, the factory              | `finance-engine-reviewer` + `/feature` factory; parallel build agents in worktrees                                   | Decide the feature, review the diff, ship           |
| **COO** | Metrics, billing health, support, the loop closing                          | `weekly-telemetry-review` agent reads PostHog/Sentry/Vercel/Stripe, files Linear issues                              | Read the digest, triage, decide what's worth fixing |

**Weekly rhythm (suggested).**

- **Mon — COO hat:** read the telemetry digest the agent drafted over the weekend. Triage Sentry spikes, funnel drops, churn signals into Linear. 30 min of judgment on top of agent legwork.
- **Tue–Thu — CTO hat:** build with the fleet. Every feature enters via `/feature` (spec → test → implement → verify). Parallel agents in git worktrees for independent work; the main Opus thread integrates and reviews.
- **Fri — CEO hat:** review what the growth agent drafted (outreach, content), approve sends, decide next week's bet. Update the decision log.
- **Continuous:** the retro→memory loop appends durable learnings to MEMORY.md after anything notable.

**Token-max stance.** This founder learns by building and asks for outcomes ("ship it", "fix everything"). The right default is **maximal parallel agent use, minimal founder-in-the-loop legwork**:

- Spawn parallel subagents for any independent search, research, or multi-file task — never serialize what can fan out.
- Reserve the main Opus 4.8 thread for the work that needs judgment: architecture, the diff review, the strategic call.
- Prefer scheduled/background agents (cron via scheduled-tasks MCP, background bash) so loops close while the founder is away — the telemetry digest, the overnight outreach drafts, the dependency scan should all be running without a prompt.
- Bias toward _closing the loop in software_: if the founder finds themselves manually exporting from PostHog or copy-pasting Sentry stacks, that's a missing agent, not a chore.
- Use feature flags + PostHog events as the default ship gate so every decision is instrumented and reversible without a redeploy.

The endgame: the founder spends their hours on the three judgments only a human should make — _which bet, is this correct, is this worth fixing_ — and the fleet does everything between the judgment and the next judgment.
