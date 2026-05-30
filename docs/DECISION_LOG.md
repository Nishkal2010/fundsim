# FundSim Decision Log

> Companion to [`docs/OPERATING_MODEL.md`](./OPERATING_MODEL.md). This file implements principle 8 ("Knowledge compounds") and principle 5 ("Decisions are instrumented") of the [AI-Native Operating System](./AI-NATIVE-OPERATING-SYSTEM.md): every consequential ship gets a durable record of _what_ was decided, _why_, the _hypothesis_ it was betting on, and the _metric_ it should move — so the next loop starts from accumulated knowledge instead of memory.

## How to use this

- **Log a decision when a ship is consequential.** Anything that changes the deploy path, the schema, a user-facing flow, pricing, or a numerically-sensitive finance engine. Skip trivial copy/CSS tweaks.
- **Write the entry _when you decide_, not after the fact.** The "why" is freshest at the moment of the call. The "outcome" line gets filled in later, once the metric has moved (or not).
- **One entry per decision, newest at the top.** Use the template below verbatim. Keep each field to a sentence or two — this is an index, not an essay.
- **Status flows:** `proposed` → `shipped` → `validated` | `reverted` | `superseded`. A decision isn't done at `shipped`; it's done when the metric confirms or refutes the hypothesis.
- **Cross-link the commit.** Reference the short SHA so an agent can `git show` the actual diff. Ground every claim in a real commit, route, or schema field — never invent one.
- **The retro loop (below) promotes durable learnings from here into the founder's MEMORY index** so they survive past this file and feed future sessions.

## Entry template

Copy this block to the top of the "Decisions" section for each new decision.

```markdown
### YYYY-MM-DD — <short imperative title>

- **Decision:** What we chose to do, in one line.
- **Context / why:** The constraint or problem that forced the call. The thing a cold agent needs to understand the decision.
- **Hypothesis:** What we believe will happen because of this. Phrase it so it can be proven wrong.
- **Metric to watch:** The single PostHog event, Sentry trend, Stripe number, or deploy signal that confirms/refutes the hypothesis. Name the exact metric.
- **Status:** proposed | shipped | validated | reverted | superseded
- **Commit(s):** <short SHA(s)>
- **Outcome / learning:** _(fill in later)_ What actually happened, and the durable lesson. This is the line that gets promoted to MEMORY.md.
```

## Decisions

### 2026-05-29 — Replace @vercel/og with satori + resvg-js for dynamic OG images

- **Decision:** Rewrote `api/og.ts` off `@vercel/og` onto `satori` (JSX→SVG) + `@resvg/resvg-js` (SVG→PNG via native binary), with IBM Plex Sans bundled in `api/_assets` and shipped to the lambda via `functions.includeFiles` in `vercel.json`. Switched to the classic `(req, res)` handler and gave `new URL(req.url)` a base.
- **Context / why:** `@vercel/og` 500'd on the Vercel Node runtime (couldn't load its font/WASM assets in the lambda, though it rendered fine locally) and failed to build on edge. The downstream symptom was a broken image on personalized `/s/:id` deal-share cards — the exact asset a shared link leads with. Two follow-up fixes were needed: `req.url` is relative on Vercel Node so `new URL` threw, and a returned Web `Response` hangs (199s timeout) because the runtime won't flush it — matched the working `res.setHeader`/`res.end(buffer)` pattern from `api/share-meta.ts`.
- **Hypothesis:** A pure-JS render path with no runtime asset fetching will produce a working OG image reliably in the lambda, fixing broken share-card previews and unblocking the share growth loop.
- **Metric to watch:** Zero `api/og` errors in Sentry; successful 200 + valid PNG on `/api/og?id=...`; share-link click-through (PostHog share/visit funnel) no longer leaking on broken previews.
- **Status:** shipped
- **Commit(s):** `39bad10`, `7b4f020`, `fe3c615`
- **Outcome / learning:** _(fill in later)_ Candidate durable lesson: Vercel Node serverless handlers must use the classic `(req, res)` signature and write the body explicitly (a returned `Response` hangs), and `req.url` is relative so any `new URL()` needs a base. Bundle render assets via `functions.includeFiles` — never fetch fonts/WASM at request time.

### 2026-05-29 — Declutter the header nav to seven items

- **Decision:** Removed five header buttons — FinFox toggle, Tour, Print, the light/dark theme toggle, and GitHub — leaving DECA, YIS, Leaderboard, Challenge, Glossary, Compare, Scenarios. Also landed the pending `btn-nav` class + CSS-variable theming the header markup depends on.
- **Context / why:** The header was overcrowded, diluting attention across low-value controls. FinFox stays reachable via the mascot, so its toggle was redundant; Tour/Print/theme/GitHub were rarely the next action a visitor wanted.
- **Hypothesis:** A leaner nav focused on the core simulator + gamification surfaces (Challenge, Leaderboard, DECA) will raise engagement with those surfaces without measurably hurting access to the removed features.
- **Metric to watch:** PostHog clicks on the retained nav items (esp. Challenge / Leaderboard entry rate); no rise in "can't find X" support signals or a drop in FinFox chat-open rate via the mascot.
- **Status:** shipped
- **Commit(s):** `2e26a02`
- **Outcome / learning:** _(fill in later)_ Candidate durable lesson: when removing an entry point, confirm the feature stays reachable by another path (FinFox via mascot) before deleting its nav button, and verify the dependent CSS (`btn-nav`, theme variables) lands in the same change.

### 2026-05-28 — Upgrade chat to Claude Opus 4.8 with real SSE streaming

- **Decision:** Upgraded `api/chat.ts` to Claude Opus 4.8 with an extended 1h prompt-cache TTL, then replaced the fake typing animation with real server-sent-event streaming from the model.
- **Context / why:** The chatbot was on an older model and faked streaming with a client-side animation, so perceived latency and answer quality both lagged what the API could actually deliver. The 1h cache TTL cuts repeated-prompt cost on the guardrail-prefixed system prompt.
- **Hypothesis:** A stronger model plus true token-by-token streaming will improve FinFox answer quality and time-to-first-token enough to lift chat engagement and completion, while the long cache TTL holds per-message cost down.
- **Metric to watch:** PostHog FinFox messages-per-session and chat-completion rate; time-to-first-token; Anthropic per-message cost (cache hit rate on the system prefix).
- **Status:** shipped
- **Commit(s):** `0d9aff5`, `b3ca6d1`
- **Outcome / learning:** _(fill in later)_ Candidate durable lesson: prefer real SSE over simulated streaming once the endpoint supports it — the fake animation was hiding available latency wins; pair model upgrades with a prompt-cache TTL bump to keep cost flat.

## Retro → MEMORY.md loop

Decisions decay if they stay buried in this file. The `/retro` cadence promotes the durable ones into the founder's memory index so they compound across sessions.

**The index this loop writes to:** the FundSim project memory at `~/.claude/projects/-Users-nishkaldachepelly-fundsim/memory/MEMORY.md` (and its linked topic files). That index already holds project, behavior, and outreach knowledge; this loop adds engineering decisions.

**Cadence.** Run `/retro` at the close of each weekly cycle — Friday, the CEO-hat block in [`docs/OPERATING_MODEL.md`](./OPERATING_MODEL.md), when the week's decision-log entries are updated. Also run it ad hoc after anything notable (a reverted ship, a surprising metric result, a hard-won runtime gotcha).

**What `/retro` does.**

1. Read the entries added or changed in this log since the last retro.
2. For each, decide whether the **outcome / learning** is _durable_ — a fact that will still matter three months from now and that a cold agent would benefit from. One-off context is not durable; a runtime constraint, a pattern that worked, or a hypothesis that proved wrong is.
3. For `validated` / `reverted` entries, rewrite the learning as a one-line, project-general rule (strip the date-specific narration).
4. Append it to the appropriate section of `MEMORY.md` (or a linked topic file), so it surfaces automatically in future sessions without re-reading this whole log.
5. Update the entry's **Status** to its terminal state (`validated` | `reverted` | `superseded`) so it isn't re-promoted next retro.

**What stays vs. what gets promoted.** This log keeps the _full_ record — every decision, hypothesis, and commit, including the ones that didn't pan out. MEMORY.md gets only the _distilled rule_: the reusable lesson, not the diary. The log is the audit trail; the memory index is the compounding asset.

**Rule of thumb.** If you find yourself re-deriving a decision an agent could have read — that's a missing MEMORY.md line, and the retro loop is where it gets fixed.
