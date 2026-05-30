# FundSim Operating Model — three hats on one founder + a fleet

> **Purpose.** FundSim is a one-person company. A traditional company splits the
> work into **CEO** (where are we going, who do we sell to), **CTO** (what do we
> build, is it correct), and **COO** (does the machine run, what do the numbers
> say). A solo founder wears all three and becomes the integration point for every
> loop. The AI-native move is to assign each hat a **default agent loop** so the
> founder does only the judgment, not the legwork. This doc is the explicit version
> of principle 7 in `docs/AI-NATIVE-OPERATING-SYSTEM.md` ("the operating model is
> explicit": now 2/10, target 8) — it names the hat each block of time wears, the
> agent that runs underneath it, and how the loops hand off to each other.

This is the expanded form of the "Founder operating cadence" section of
`docs/AI-NATIVE-OPERATING-SYSTEM.md`. Read that doc first for the why; read this for
the week-to-week how.

---

## The three-hat table

Each hat owns a slice of the company, runs on a default agent loop, and leaves the
founder a small, irreducible judgment. The agent names below are real files in this
repo — the fleet seeded under principle 4.

| Hat     | Owns                                                                                    | Default agent loop                                                                                                                                                                                                     | Founder's actual job                                |
| ------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **CEO** | Strategy, positioning, outreach, partnerships (clubs / professors / DECA per MEMORY.md) | `growth-loop` agent (`.claude/agents/growth-loop.md`) drafts outreach + content from the comms-kit playbooks already in MEMORY.md; deep-research gathers facts                                                         | Pick targets, approve sends, set the bet            |
| **CTO** | What to build, correctness of the finance engines, the factory                          | `/feature` command (`.claude/commands/feature.md`) drives spec → test → ship; `finance-engine-reviewer` (`.claude/agents/finance-engine-reviewer.md`) guards numeric hot paths; parallel build agents in git worktrees | Decide the feature, review the diff, ship           |
| **COO** | Metrics, billing health, support, the loop closing                                      | `weekly-telemetry-review` agent (`.claude/agents/weekly-telemetry-review.md`) reads PostHog / Sentry / Vercel / Stripe and drafts a digest + Linear issues                                                             | Read the digest, triage, decide what's worth fixing |

The agent loops are wired to the supporting docs they depend on:

- The CTO loop's factory path is defined by `.claude/commands/feature.md`, which pulls
  the spec template at `docs/templates/feature-spec-template.md`, the architecture map
  at `.claude/context/architecture.md`, and the event taxonomy at
  `docs/INSTRUMENTATION_PLAYBOOK.md`.
- The COO loop's queries and named funnels come from `docs/INSTRUMENTATION_PLAYBOOK.md`.
- The CEO loop's source material is the outreach playbooks and comms kit indexed in
  the founder's MEMORY.md.
- All three write durable learnings back to the decision log + retro→memory loop
  (Deliverable E2) so the next loop starts smarter.

---

## Weekly rhythm

The week is structured so each hat gets a dedicated block and the agent legwork lands
_before_ the founder's block opens — the agent works overnight or in the background,
the founder shows up to a drafted artifact and applies judgment on top.

### Mon — COO hat (read the numbers)

The `weekly-telemetry-review` agent runs over the weekend (scheduled via the
scheduled-tasks MCP) and drafts a telemetry digest: PostHog funnels, Sentry spikes,
Vercel performance, Stripe billing health, churn signals. Monday morning the founder
reads the digest and spends ~30 minutes on judgment only — triaging real regressions
and funnel drops into Linear issues, deciding which signals are noise. The agent did
the export and the first-pass analysis; the founder decides what matters.

### Tue–Thu — CTO hat (build with the fleet)

Building happens here, and every feature enters through `/feature`
(`.claude/commands/feature.md`), which enforces the spec → failing-test → minimal
implementation → verify → self-review → report sequence. Independent work fans out to
parallel build agents in git worktrees; the main Opus 4.8 thread integrates and
reviews the diffs. The `finance-engine-reviewer` agent reviews any change touching the
numeric engines (`src/utils/` — waterfall, jCurve, irr, lbo, vcRound, portfolio, etc.)
before it merges, because those paths are numerically sensitive and a silent
regression is the most expensive bug FundSim can ship. The founder decides the
feature, reviews the diff, and ships.

### Fri — CEO hat (decide the next bet)

The `growth-loop` agent has drafted outreach and content from the comms-kit playbooks
in MEMORY.md. Friday the founder reviews those drafts, approves sends, and decides next
week's bet — which target (club VP of Education, professor, DECA chapter), which
positioning, which feature gets prioritized. The decision and its rationale go into the
decision log (Deliverable E2) so the bet is instrumented, not just made.

### Continuous — knowledge compounds

After anything notable — a shipped feature, a resolved incident, a bet that paid off or
didn't — the retro→memory loop appends the durable learning to MEMORY.md. This is the
mechanism behind principle 8 ("knowledge compounds"): learnings live in a durable log,
not in chat history that evaporates.

---

## Token-max stance

This founder learns by building and asks for outcomes ("ship it", "fix everything"),
per the working-style rules in `~/.claude/CLAUDE.md`. The right default is therefore
**maximal parallel agent use, minimal founder-in-the-loop legwork**:

- **Parallel by default.** Spawn parallel subagents for any independent search,
  research, or multi-file task. Never serialize what can fan out. Run independent
  agents in one message, not three sequential ones.
- **Reserve the main thread for judgment.** The main Opus 4.8 thread is for the work
  only it should do: architecture, the diff review, the strategic call. Subagents
  (lighter models) handle the legwork and return summaries.
- **Schedule the loops.** Prefer scheduled / background agents (cron via the
  scheduled-tasks MCP, background bash) so loops close while the founder is away — the
  Monday telemetry digest, the overnight outreach drafts, the dependency scan should
  all run without a prompt.
- **Close loops in software.** If the founder finds themselves manually exporting from
  PostHog or copy-pasting Sentry stacks, that is a missing agent, not a chore — file it
  as a fleet gap.
- **Instrument every decision.** Use feature flags + PostHog events as the default ship
  gate (enforced by the spec template via `/feature`) so every decision is measurable
  and reversible without a redeploy.

**The three judgments.** The endgame is that the founder spends their hours on the
three judgments only a human should make, and the fleet does everything between one
judgment and the next:

1. **Which bet** — CEO hat, Friday. Which target, which positioning, which feature.
2. **Is this correct** — CTO hat, Tue–Thu. Reviewing the diff and the engine math.
3. **Is this worth fixing** — COO hat, Monday. Triaging the telemetry digest.

Everything else is the fleet's job.

---

## How the loops hand off

The three hats are not independent — they form a single closed cycle, and each hand-off
is a concrete artifact that the next hat consumes:

1. **COO → CTO.** Monday's telemetry triage produces Linear issues. Those issues become
   the candidate features for the Tue–Thu CTO block. A funnel drop the COO loop surfaced
   on Monday is the problem statement a `/feature` spec fills in on Tuesday.

2. **CTO → CEO.** What shipped Tue–Thu — gated behind a PostHog flag and event per the
   spec template — becomes evidence the CEO hat weighs on Friday when deciding the next
   bet. A feature that moved its target metric justifies doubling down; one that didn't
   gets rolled back via its flag, no redeploy needed.

3. **CEO → COO.** Friday's bet (a new outreach push, a positioning change, a
   prioritized feature) defines what the COO loop watches the following week. The
   `growth-loop` agent's sends become campaigns the `weekly-telemetry-review` agent
   measures in the next Monday digest — closing the cycle.

4. **All → memory.** Every hand-off writes its decision and outcome to the decision log
   (`docs/DECISION_LOG.md`) and MEMORY.md (Deliverable E2). The retro→memory loop is the
   connective tissue: it ensures the COO digest, the CTO ship, and the CEO bet each leave
   a durable trace, so the next week's loop starts from accumulated context rather than
   the founder's recall.

The week is therefore a flywheel: **measure (Mon) → build (Tue–Thu) → decide (Fri) →
measure**, with the agent fleet running the spokes and the founder making the three
judgments at the hub.

---

## Cross-references

- `docs/AI-NATIVE-OPERATING-SYSTEM.md` — the parent roadmap; principle 7 and the
  "Founder operating cadence" section this doc expands.
- `.claude/commands/feature.md` — the CTO hat's factory path.
- `.claude/agents/finance-engine-reviewer.md` — CTO hat, numeric-correctness reviewer.
- `.claude/agents/weekly-telemetry-review.md` — COO hat, telemetry digest agent.
- `.claude/agents/growth-loop.md` — CEO hat, outreach + content drafting agent.
- `docs/INSTRUMENTATION_PLAYBOOK.md` — the event taxonomy and queries the COO loop runs.
- `docs/DECISION_LOG.md` — the decision log (Deliverable E2) every hand-off writes to.
- `docs/templates/feature-spec-template.md` — the spec the CTO loop fills per feature.
- `.claude/context/architecture.md` — the schema / routes / env map every agent reads.
- `~/.claude/CLAUDE.md` — the founder's working-style and coding rules that set the
  token-max stance.
