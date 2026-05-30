# FundSim AI-Native Operating System — Index

> **Purpose.** This directory and the files it points to make FundSim **legible to
> agents**: a cold agent should be able to answer "what is this company, what's the
> schema, what's the strategy, how do I ship a change correctly" without the founder
> in the loop. The system is built around four moves drawn from
> [`../../docs/AI-NATIVE-OPERATING-SYSTEM.md`](../../docs/AI-NATIVE-OPERATING-SYSTEM.md):
> make context **queryable**, turn live telemetry into **closed loops**, stand up a
> repeatable **software factory** (spec → test → ship), and run an agent **fleet**
> that maps a CEO/CTO/COO operating model onto one founder. Everything here is
> additive and deploy-safe; `api/*`, `src/*`, `vercel.json`, and CI are founder-owned
> and are referenced as recommendations, never auto-edited.

This README is the queryable index of that system. It maps each of the eight
operating principles to the file(s) that now satisfy it, and gives a cold agent a
"start here" reading order.

---

## Start here (cold-agent reading order)

1. [`../../COMPANY.md`](../../COMPANY.md) — the single source of truth. What FundSim
   is, who the user/buyer is, the product surface, what's monetized, the data model,
   the API routes, the deploy path, and what must never break. Read this first.
2. [`./architecture.md`](./architecture.md) — the machine-readable companion: routes,
   finance engines + test coverage, env-var contract, Supabase tables, build scripts,
   and the component tree, all as tables. Read this when you need an exact fact.
3. [`../../docs/AI-NATIVE-OPERATING-SYSTEM.md`](../../docs/AI-NATIVE-OPERATING-SYSTEM.md)
   — the roadmap and principle scorecard that everything below serves. Read this for
   the "why".
4. [`../../docs/OPERATING_MODEL.md`](../../docs/OPERATING_MODEL.md) — the three-hat
   (CEO/CTO/COO) operating model and weekly rhythm. Read this to know which agent owns
   which loop.
5. Then branch by task: building a feature → the factory docs (principle 3); reading
   the numbers → the telemetry docs (principle 2); outreach → the growth agent
   (principle 1/CEO). The principle map below routes you.

---

## Principle → file map

The eight principles are defined and scored in
[`../../docs/AI-NATIVE-OPERATING-SYSTEM.md`](../../docs/AI-NATIVE-OPERATING-SYSTEM.md).
Each row links the file(s) that now satisfy that principle.

| #   | Principle                                                                                                                | Satisfied by                                                                                                                                                                                                           | What the file does                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Context is queryable** — agents answer "what is FundSim / what's the schema / what's the strategy" without the founder | [`../../COMPANY.md`](../../COMPANY.md), [`./architecture.md`](./architecture.md)                                                                                                                                       | `COMPANY.md` is the prose single source of truth (product, users, monetization, data model, routes, deploy path, the 5 things that must never break). `architecture.md` is its machine-readable companion: routes, engines + coverage, env contract, tables, and component tree as tables.                                              |
| 2   | **Loops are closed** — telemetry → insight → action without manual export                                                | [`../../docs/INSTRUMENTATION_PLAYBOOK.md`](../../docs/INSTRUMENTATION_PLAYBOOK.md), [`../agents/weekly-telemetry-review.md`](../agents/weekly-telemetry-review.md)                                                     | The playbook defines the north-star metric (Weekly Completed Simulations), the guardrail (error rate/session), the event taxonomy (emitted vs. recommended), the five funnels, and the exact PostHog/Sentry/Supabase MCP queries per loop with thresholds. The agent executes those queries weekly and drafts a digest + Linear issues. |
| 3   | **The factory is repeatable** — any feature goes spec → test → ship by a cold agent                                      | [`../../docs/templates/feature-spec-template.md`](../../docs/templates/feature-spec-template.md), [`../commands/feature.md`](../commands/feature.md)                                                                   | The template is the copy-pasteable spec (problem → hypothesis → metric → flag → scope → golden-file/component test plan → verification gate → rollback). The `/feature` command enforces the spec → failing-test → minimal-impl → verify → self-review → report sequence.                                                               |
| 4   | **The fleet exists** — specialized agents close specific loops, not one generalist                                       | [`../agents/finance-engine-reviewer.md`](../agents/finance-engine-reviewer.md), [`../agents/weekly-telemetry-review.md`](../agents/weekly-telemetry-review.md), [`../agents/growth-loop.md`](../agents/growth-loop.md) | Three seeded agents map to the three hats: finance-engine-reviewer (CTO/numeric correctness), weekly-telemetry-review (COO/metrics), growth-loop (CEO/outreach + content). Each is scoped, read-only on founder-owned paths, and drafts rather than decides.                                                                            |
| 5   | **Decisions are instrumented** — every ship carries a hypothesis + a metric it moves                                     | [`../../docs/templates/feature-spec-template.md`](../../docs/templates/feature-spec-template.md), [`../../docs/DECISION_LOG.md`](../../docs/DECISION_LOG.md)                                                           | The spec template forces a falsifiable hypothesis, a named PostHog event, and a per-feature feature flag (default OFF) into every feature before code. The decision log records the bet, the metric to watch, and the outcome for each consequential ship.                                                                              |
| 6   | **Quality is automated** — review, test, guardrails run without prompting                                                | [`../agents/finance-engine-reviewer.md`](../agents/finance-engine-reviewer.md), [`../../docs/templates/feature-spec-template.md`](../../docs/templates/feature-spec-template.md)                                       | The reviewer agent checks numeric correctness, sign conventions, NaN/Infinity guards, units, and golden-value test coverage on any `src/utils/` change, then runs vitest. The template's verification gate (`lint && test && build`) and its coverage-floor recommendation define the automated quality bar.                            |
| 7   | **The operating model is explicit** — the founder knows which hat each block of time wears                               | [`../../docs/OPERATING_MODEL.md`](../../docs/OPERATING_MODEL.md)                                                                                                                                                       | Names the three hats (CEO/CTO/COO), the default agent loop under each, the founder's irreducible judgment, the weekly rhythm (Mon read numbers / Tue–Thu build / Fri decide), the token-max stance, and how the loops hand off.                                                                                                         |
| 8   | **Knowledge compounds** — learnings persist and feed the next loop                                                       | [`../../docs/DECISION_LOG.md`](../../docs/DECISION_LOG.md), [`../../docs/OPERATING_MODEL.md`](../../docs/OPERATING_MODEL.md)                                                                                           | The decision log is the durable audit trail (status flow proposed → shipped → validated/reverted) and defines the retro → MEMORY.md loop that promotes durable learnings into the founder's memory index. The operating model wires the "All → memory" hand-off.                                                                        |

---

## File inventory (by location)

**Repo root**

- [`../../COMPANY.md`](../../COMPANY.md) — single source of truth (principle 1).

**`.claude/context/`**

- [`./architecture.md`](./architecture.md) — machine-readable fact sheet (principle 1).
- `./README.md` — this index.

**`.claude/agents/`**

- [`../agents/finance-engine-reviewer.md`](../agents/finance-engine-reviewer.md) — CTO-hat numeric reviewer (principles 4, 6).
- [`../agents/weekly-telemetry-review.md`](../agents/weekly-telemetry-review.md) — COO-hat telemetry digest + Linear filer (principles 2, 4).
- [`../agents/growth-loop.md`](../agents/growth-loop.md) — CEO-hat outreach + content drafter (principles 1, 4).

**`.claude/commands/`**

- [`../commands/feature.md`](../commands/feature.md) — the `/feature` factory command (principles 3, 5).

**`docs/`**

- [`../../docs/AI-NATIVE-OPERATING-SYSTEM.md`](../../docs/AI-NATIVE-OPERATING-SYSTEM.md) — roadmap + scorecard (all principles).
- [`../../docs/INSTRUMENTATION_PLAYBOOK.md`](../../docs/INSTRUMENTATION_PLAYBOOK.md) — telemetry taxonomy, funnels, queries, thresholds (principle 2).
- [`../../docs/OPERATING_MODEL.md`](../../docs/OPERATING_MODEL.md) — three-hat operating model + cadence (principles 7, 8).
- [`../../docs/DECISION_LOG.md`](../../docs/DECISION_LOG.md) — decision log + retro→memory loop (principles 5, 8).
- [`../../docs/templates/feature-spec-template.md`](../../docs/templates/feature-spec-template.md) — spec + test template (principles 3, 5, 6).

**Durable memory (outside the repo)**

- `~/.claude/projects/-Users-nishkaldachepelly-fundsim/memory/MEMORY.md` — the founder's auto-memory index the retro loop writes to (principle 8).

---

## Founder-owned, not auto-built

The swarm deliberately did not edit deploy-critical surfaces. These remain founder
recommendations, documented in the files above but never applied as edits: the in-app
PostHog events still marked `recommended` in the playbook (`pro_gate_viewed`,
`checkout_started`, `checkout_succeeded`, the PostHog mirror of `simulator_entered`,
`share_viewed`, `referral_signup`, `scenario_saved`); the feature-flag-per-feature
convention in `src/`; the CI coverage gate + pre-push review hook; the scheduled cron
that runs `weekly-telemetry-review`; and any Linear issue creation. Each touches
`api/*`, `src/*`, `vercel.json`, CI, or external state — the founder's call.
