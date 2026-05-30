# FundSim Closed-Loop Instrumentation Playbook

> **Purpose.** FundSim already has three telemetry pipes wired and live — PostHog (`src/lib/posthog.ts`), Vercel Analytics (`@vercel/analytics/react`, mounted in `src/App.tsx`), and Sentry (`src/lib/sentry.ts`, initialized in `src/main.tsx`). This is the single most underexploited asset in the company: the data flows, but nothing reads it on a schedule and acts. This document turns that raw telemetry into **named loops** — a north-star metric, a guardrail, an event taxonomy, five funnels, and the exact MCP queries an agent runs weekly to read each loop. It is the contract that Deliverable B2 (the `weekly-telemetry-review` agent, `.claude/agents/weekly-telemetry-review.md`) executes against.

This deliverable is part of the AI-native operating system. See the roadmap at `docs/AI-NATIVE-OPERATING-SYSTEM.md` (principle 2, "Loops are closed", 3 → 8) for why this exists. Sibling deliverables:

- Queryable context: `COMPANY.md`, `.claude/context/architecture.md`
- The agent that runs these queries: `.claude/agents/weekly-telemetry-review.md`
- Decisions instrumented from these metrics: the spec template (`.claude/` factory docs) ties every ship to one event below + one PostHog feature flag.

---

## What is wired today (ground truth, verified this pass)

| Pipe                 | Wiring                                                                                                                                            | Config that shapes the data                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PostHog**          | `src/lib/posthog.ts` — `captureEvent(name, props)`, `identifyUser`, `resetUser`, `isFeatureEnabled`. Init runs at module load.                    | `person_profiles: "identified_only"`, `capture_pageview: true`, `capture_pageleave: true`, `autocapture: false`. Host `us.i.posthog.com`. Key from `VITE_POSTHOG_KEY`. |
| **Vercel Analytics** | `<Analytics />` mounted in `App` (`src/App.tsx`); `track()` called directly in `App.tsx` and wrapped by `trackEvent()` in `src/lib/analytics.ts`. | Page-level + a few custom events. No identity.                                                                                                                         |
| **Sentry**           | `initSentry()` in `src/main.tsx`; `captureError(error, context)` helper in `src/lib/sentry.ts`; `AppErrorBoundary` wraps the app.                 | `tracesSampleRate: 0.1`, replays off, `environment: import.meta.env.MODE`. DSN from `VITE_SENTRY_DSN`.                                                                 |

**Two consequences of the config that the agent must respect when reading loops:**

1. **`autocapture: false`** — PostHog records _nothing_ automatically except pageviews/pageleaves. Every product action is an explicit `captureEvent` call. If an event is not in the "Already emitted" table below, it does not exist in PostHog and a funnel step that depends on it will read as a hard zero, not a low number.
2. **`person_profiles: "identified_only"`** — anonymous visitors do not get person profiles until `identifyUser` fires (on Supabase login, `App.tsx`). Demo/localStorage users are never identified. So person-level retention/cohort queries only cover authenticated users; top-of-funnel landing analysis must be event- or pageview-based, not person-based.

**Split-brain warning.** Some events go to PostHog (`captureEvent`) and at least one goes to Vercel only (`track("simulator_entered", ...)` in `App.tsx:242`). PostHog is the **system of record for funnels** in this playbook because it supports funnel/retention/SQL queries via the MCP. Vercel Analytics is treated as a corroborating pageview/traffic source only. Where a funnel step currently lives only in Vercel, it is flagged as a **recommended PostHog event** below.

---

## North-star metric + guardrail

**North-star metric (NSM): Weekly Completed Simulations.**

> A "completed simulation" = a unique user who entered a simulator _and_ produced a shareable or exportable artifact (share link copied, Excel exported, deal memo downloaded, or challenge completed) in the trailing 7 days.

Rationale, grounded in `PRODUCT_STRATEGY.md`: FundSim's entire thesis is the **practice economy** — "You've watched the videos. Now run the deal." Value is delivered the moment a user _runs a deal to an artifact_, and every artifact is also the input to the viral loop (shareable URL = "the single highest-priority growth feature", strategy §Growth) and the conversion loop (Excel download = "the single highest-conversion paywall feature"). Pure visits or sign-ups overcount; raw "simulator opened" undercounts depth. "Completed simulation" is the one number that moves only when the product is actually working _and_ feeding both growth and revenue.

**Guardrail metric: Client error rate per session (Sentry).**

> Sessions with at least one unhandled exception ÷ total sessions, trailing 7 days. Target: **< 1%.** A funnel can be "improved" by shipping something that silently breaks a simulator for a slice of users; the guardrail catches a growth/conversion win that is actually a stability regression. Pair every NSM movement with a guardrail check before declaring a win.

Secondary guardrails to keep honest: **checkout error rate** (the only revenue path, `/api/create-checkout`) and **share-create failure rate** (`/api/share-create`, the viral path).

---

## Event taxonomy

Naming convention in this codebase is **snake_case** (`sim_opened`, `pe_tab_changed`, `email_captured`). Keep it. Properties are flat `Record<string, string | number | boolean>` — PostHog's `captureEvent` signature enforces this, so no nested objects.

### A. Events ALREADY emitted (verified at the call site)

These exist in PostHog/Vercel today and can be queried immediately.

| Event                      | Sink            | Fired when                         | Properties                                          | Source                       |
| -------------------------- | --------------- | ---------------------------------- | --------------------------------------------------- | ---------------------------- |
| `$pageview` / `$pageleave` | PostHog (auto)  | Route/hash view; tab close         | PostHog defaults (`$current_url`, etc.)             | `posthog.ts` init            |
| `sim_opened`               | PostHog         | URL hash changes to `pe`/`vc`/`ib` | `sim` (`"pe"\|"vc"\|"ib"`)                          | `App.tsx:219`                |
| `compare_opened`           | PostHog         | hash → `compare`                   | —                                                   | `App.tsx:221`                |
| `scenarios_opened`         | PostHog         | hash → `scenarios`                 | —                                                   | `App.tsx:223`                |
| `simulator_entered`        | **Vercel only** | `activeSimulator` becomes non-null | `simulator` (`SimulatorId`)                         | `App.tsx:242` (`track`)      |
| `pe_tab_changed`           | PostHog         | PE TabBar change                   | `tab` (PETabId string)                              | `App.tsx:509`                |
| `vc_tab_changed`           | PostHog         | VC TabBar change                   | `tab` (VCTabId string)                              | `App.tsx:546`                |
| `leaderboard_nav_clicked`  | PostHog         | Header leaderboard click           | —                                                   | `Header.tsx:89`              |
| `challenge_nav_clicked`    | PostHog         | Header challenge click             | —                                                   | `Header.tsx:108`             |
| `challenge_started`        | PostHog         | Deal Challenge begins              | —                                                   | `DealChallengeModal.tsx:229` |
| `challenge_eliminated`     | PostHog         | Player eliminated mid-challenge    | round/score props                                   | `DealChallengeModal.tsx:204` |
| `challenge_completed`      | PostHog         | Challenge finished                 | score props                                         | `DealChallengeModal.tsx:260` |
| `challenge_share_twitter`  | PostHog         | Share result to X                  | `score`                                             | `DealChallengeModal.tsx:762` |
| `challenge_share_linkedin` | PostHog         | Share result to LinkedIn           | `score`                                             | `DealChallengeModal.tsx:793` |
| `challenge_share_copy`     | PostHog         | Copy challenge result              | `score`                                             | `DealChallengeModal.tsx:824` |
| `challenge_invite_shared`  | PostHog         | Challenge invite shared            | —                                                   | `DealChallengeModal.tsx:899` |
| `leaderboard_viewed`       | PostHog         | Leaderboard panel opens            | `count`                                             | `LeaderboardPanel.tsx:140`   |
| `share_link_copied`        | PostHog         | Share button copies a link         | share metadata                                      | `ShareButton.tsx:25,40`      |
| `email_captured`           | PostHog         | Email capture modal submitted      | `trigger` (`"excel_export"\|"deal_memo"`), `method` | `EmailCaptureModal.tsx:54`   |
| `deal_memo_downloaded`     | PostHog         | VC deal memo downloaded            | —                                                   | `DealMemoTab.tsx:240`        |
| `ib_excel_exported`        | PostHog         | IB Excel export                    | export props                                        | `IBSimulator.tsx:1468`       |
| `ib_preset_applied`        | PostHog         | IB preset applied                  | preset props                                        | `IBSimulator.tsx:1640`       |

User identity: `identifyUser(id, {name,email})` fires on Supabase login (`App.tsx:625`); `resetUser()` on logout (`App.tsx`, `handleLogout`).

### B. Events RECOMMENDED to add (do not exist yet — founder `src/*` edits)

Every row below is a gap that breaks a funnel step in the next section. These are **recommendations, not edits** — adding them touches `src/*`, which is founder-owned. Each is one `captureEvent(...)` line at the named site. Mark all as `recommended` until shipped.

| Event                                | Fire at                                                                                                            | Properties                                                        | Why it matters (which funnel it unblocks)                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing_viewed`                     | `Hero`/home render in `App.tsx` (anon-safe; do not gate on auth)                                                   | `referrer`, `utm_source?`                                         | Funnel 1 step 1. `$pageview` exists but a named entry event makes the landing→simulate funnel legible and lets the agent segment by source.                                                                                                                                                                      |
| `simulator_entered` **(to PostHog)** | mirror the existing Vercel `track` at `App.tsx:242` with `captureEvent`                                            | `simulator`                                                       | Funnel 1/2 hinge. Today this step is Vercel-only, so the PostHog landing→simulate funnel has a missing middle. Dual-emit or move to PostHog.                                                                                                                                                                     |
| `simulation_completed`               | At each artifact action (share/export/memo/challenge-complete) **or** as a single rollup event                     | `simulator`, `artifact` (`"share"\|"excel"\|"memo"\|"challenge"`) | **The NSM event.** Today the NSM must be assembled from 4 different events; one canonical event makes the north star a one-query read and removes ambiguity.                                                                                                                                                     |
| `pro_gate_viewed`                    | `ProGate` render (`ProGate.tsx`) and the `ScenarioCompare` upgrade prompt (`ScenarioCompare.tsx:~320`)             | `gate` (which feature was gated), `simulator?`                    | Funnel 3 step 1. There is **no event when the paywall is shown** — conversion rate is currently uncomputable because the denominator (gate views) is missing.                                                                                                                                                    |
| `checkout_started`                   | Just before `fetch("/api/create-checkout")` in `ProGate.tsx:20` and `ScenarioCompare.tsx:323`                      | `plan`, `source_gate`                                             | Funnel 3 step 2. The click-to-checkout intent is invisible today.                                                                                                                                                                                                                                                |
| `checkout_succeeded`                 | On the post-Stripe success return (no success-param handling exists today; add a redirect param read in `App.tsx`) | `plan`                                                            | Funnel 3 terminal step. **No success event exists** — Pro conversions are only visible in Stripe/Supabase `is_pro`, not in PostHog, so the funnel cannot close in one tool.                                                                                                                                      |
| `share_viewed`                       | `ShareView` mount (the public read-only deal view, `ShareView.tsx`)                                                | `has_ref` (bool), `simulator?`                                    | Funnel 4 step 1. The viral loop's _inbound_ side is currently uninstrumented — we see links created (`share_link_copied`) but not links opened.                                                                                                                                                                  |
| `referral_signup`                    | On signup when an attribution param is present                                                                     | `ref_source` (`"share"\|"challenge"`), `referrer_user_id?`        | Funnel 4 terminal step. The referral loop is **designed but not built** (strategy §Growth describes a referral reward; no `ref=` attribution code exists in `src/`). Needs (1) a `ref` param on shared URLs and (2) attribution capture at signup. Until both ship, Funnel 4 is a hypothesis, not a measurement. |
| `scenario_saved`                     | On save in the fund-model hook                                                                                     | `simulator`, `count`                                              | Retention signal — saved scenarios are the strongest predictor of return (free tier caps at one; saving is the depth action).                                                                                                                                                                                    |

> **Decision rule for the founder:** the highest-ROI additions are `pro_gate_viewed` + `checkout_started` + `checkout_succeeded` (they make the entire revenue funnel computable) and the PostHog mirror of `simulator_entered` (it repairs the top funnel). Ship those three first; the rest can follow.

---

## The five funnels that matter

Each funnel lists its ordered steps, the backing event, and whether the step is live or blocked on a recommended event. "Blocked" steps mean the funnel is currently **partial** — the agent reports what it can and flags the gap.

### Funnel 1 — Landing → Simulate (activation)

The top of everything. Did a visitor actually start running a deal?

1. `landing_viewed` _(recommended)_ — or `$pageview` on `/` as a live proxy
2. `sim_opened` **(live)** or `simulator_entered` **(live in Vercel; recommended in PostHog)**
3. First in-sim depth action: `pe_tab_changed` / `vc_tab_changed` / `ib_preset_applied` **(live)**

**Status:** measurable today via `$pageview` → `sim_opened`, but the cleanest version needs `simulator_entered` in PostHog. **What good looks like:** ≥ 40% of landing sessions reach `sim_opened`.

### Funnel 2 — Simulate → Share (the viral artifact)

Did running a deal produce a shareable artifact? This is the NSM-feeding loop.

1. `simulator_entered` / `sim_opened` **(live)**
2. `simulation_completed` _(recommended; today proxied by the union of artifact events)_
3. `share_link_copied` **(live)** / `deal_memo_downloaded` **(live)** / `ib_excel_exported` **(live)** / `challenge_share_*` **(live)**

**Status:** measurable today via the artifact events; the `simulation_completed` rollup would make it one clean step. **What good looks like:** ≥ 15% of simulator sessions emit at least one artifact event.

### Funnel 3 — Simulate → Pro gate → Checkout (revenue)

The only money path. Backed by `/api/create-checkout` → `/api/stripe-webhook` → `profiles.is_pro`.

1. `simulator_entered` / artifact-intent (e.g. `email_captured` with `trigger:"excel_export"`) **(live)**
2. `pro_gate_viewed` _(recommended — currently MISSING; conversion denominator)_
3. `checkout_started` _(recommended — currently MISSING)_
4. `checkout_succeeded` _(recommended — currently MISSING; only visible in Stripe/`is_pro` today)_

**Status:** **largely blocked.** Today the only PostHog-visible signal is `email_captured` (a soft intent). True paywall-view-to-paid conversion cannot be computed in PostHog until steps 2–4 are added. The agent should currently read conversions from Supabase `profiles.is_pro` count deltas via the Supabase MCP and flag the instrumentation gap every week until closed. **What good looks like (strategy target):** 5% free→Pro within 12 months; gate-view→checkout-start ≥ 8%.

### Funnel 4 — Share → Referral signup (viral acquisition)

The compounding loop: a shared artifact lands in front of a high-value viewer who signs up.

1. `share_link_copied` / `challenge_share_*` **(live — outbound)**
2. `share_viewed` _(recommended — inbound side is uninstrumented)_
3. `referral_signup` _(recommended — attribution not built; strategy §Growth describes the reward, code does not implement `ref=`)_

**Status:** **hypothesis only.** We see links created but not opened or converted. Requires a `ref` param on shared URLs (`shareUrl.ts`) + attribution capture at signup. **What good looks like (strategy target):** 500 shared links in first 60 days; ≥ 1 signup per 20 share-views.

### Funnel 5 — Retention / return (the loop that compounds)

Do users come back and run more deals? Person-level, authenticated users only (per `identified_only`).

1. Week-0: `identifyUser` (login) + first `simulation_completed`-class event **(login live; completion proxied)**
2. Week-N return: any `sim_opened` / artifact event by the same person **(live)**
3. Depth: `scenario_saved` _(recommended — strongest return predictor)_

**Status:** measurable today via PostHog retention on `sim_opened` for identified users; `scenario_saved` sharpens it. **What good looks like:** Week-1 return ≥ 25% of activated users; Week-4 ≥ 12%.

---

## The weekly read — exact MCP queries per loop

These are the queries the `weekly-telemetry-review` agent runs every Monday (per the founder cadence in `docs/AI-NATIVE-OPERATING-SYSTEM.md`). Two MCP servers are used:

- **PostHog MCP** (server id `068a2e19-...`): funnels, trends, retention, SQL via `query-trends`, `query-funnel`, `query-retention`, `execute-sql`, plus error-tracking tools.
- **Sentry MCP** (server id `d36ec729-...`): `search_issues`, `search_events`, `analyze_issue_with_seer` for the guardrail.
- **Supabase MCP** (server id `7bb136c8-...`): `execute_sql` against `profiles.is_pro` for the revenue funnel until checkout events exist.

> All PostHog event names below are the snake_case names from the taxonomy. Date range: trailing 7 days (`-7d`) unless noted; compare to the prior 7 days for deltas. Prefer `execute-sql` (HogQL) for anything a prebuilt query can't express — it reads the `events` table directly.

### Loop 0 — North-star + guardrail (run first)

**NSM (HogQL via PostHog `execute-sql`)** — Weekly Completed Simulations. Until `simulation_completed` ships, assemble from artifact events:

```sql
SELECT count(DISTINCT person_id) AS completed_sims
FROM events
WHERE event IN (
  'share_link_copied','ib_excel_exported','deal_memo_downloaded','challenge_completed'
)
AND timestamp >= now() - INTERVAL 7 DAY
```

When `simulation_completed` exists, replace the IN-list with `event = 'simulation_completed'`.

**Guardrail (Sentry MCP `search_events`)** — error rate proxy:

- `search_events` with `naturalLanguageQuery: "unhandled errors in the last 7 days grouped by issue, count and affected users"` on the FundSim project. Compute affected-sessions ÷ total sessions (sessions from PostHog `$pageview` distinct sessions). Flag if > 1%.
- `search_issues` with `naturalLanguageQuery: "new or regressed issues in the last 7 days sorted by event count"` to catch a fresh break introduced by the week's ships. Any **new** high-frequency issue → draft a Linear issue.

### Loop 1 — Landing → Simulate (PostHog `query-funnel`)

Steps (in order): `$pageview` (or `landing_viewed`) → `sim_opened` → `pe_tab_changed` OR `vc_tab_changed` OR `ib_preset_applied`. Window 1 day. Report step-1→2 conversion vs. the 40% threshold.

### Loop 2 — Simulate → Share (PostHog `query-funnel`)

Steps: `sim_opened` → any of `share_link_copied`/`ib_excel_exported`/`deal_memo_downloaded`/`challenge_completed`. Report sim→artifact rate vs. 15%. Cross-check the trend of each artifact event with `query-trends` to see which simulator drives sharing.

### Loop 3 — Simulate → Pro gate → Checkout (mixed: PostHog + Supabase)

- **If `pro_gate_viewed`/`checkout_started`/`checkout_succeeded` exist:** PostHog `query-funnel` over those three steps; report gate→start and start→success.
- **Until then (current state):** Supabase MCP `execute_sql`:

```sql
SELECT count(*) AS new_pro
FROM profiles
WHERE is_pro = true
  AND updated_at >= now() - interval '7 days';
```

> **Column caveat (important):** `profiles` is a pre-existing Supabase-auth table; the only migration against it (`supabase/migrations/20260510_profiles_is_pro.sql`) adds `is_pro` and an index — it does **not** add an `updated_at` column, and none is documented on `profiles` in `.claude/context/architecture.md` (the `updated_at` column there belongs to `fund_models`). The `updated_at` filter above will error if the column is absent. Run `list_tables` against the Supabase MCP to confirm the real upgrade-timestamp column first; if there is none, fall back to a plain `count(*) WHERE is_pro = true` cumulative total and track the week-over-week delta instead of a windowed count.

Report `new_pro` as the only available conversion signal and **emit a standing flag**: "Funnel 3 is blind in PostHog — ship `pro_gate_viewed`, `checkout_started`, `checkout_succeeded`."

### Loop 4 — Share → Referral signup (PostHog `query-trends`, partial)

- Live: `query-trends` on `share_link_copied` + `challenge_share_twitter`/`_linkedin`/`_copy` (outbound volume vs. the 500-links/60-day pace).
- Blocked: `share_viewed` and `referral_signup` do not exist. Report outbound only and flag the inbound/attribution gap until Funnel 4 events ship.

### Loop 5 — Retention (PostHog `query-retention`)

`query-retention` with returning event = `sim_opened` (or `simulation_completed` once live), target entity = persons, period = week, for identified users. Report Week-1 and Week-4 cohort return vs. 25% / 12%.

### Output of the run

The agent writes one digest (NSM, guardrail, five funnels with deltas, standing instrumentation gaps) and opens a Linear issue for: any guardrail breach, any funnel step that dropped > 20% week-over-week, and each unshipped recommended event still blocking a funnel. This is the loop closing without the founder in the middle.

---

## What good looks like — thresholds

| Loop / metric                             | Backing query                                                         | Green (good)        | Yellow (watch) | Red (act this week)             |
| ----------------------------------------- | --------------------------------------------------------------------- | ------------------- | -------------- | ------------------------------- |
| **NSM — Weekly Completed Simulations**    | HogQL distinct persons w/ artifact event                              | Growing WoW         | Flat 2+ weeks  | Declining WoW                   |
| **Guardrail — error rate / session**      | Sentry events ÷ PostHog sessions                                      | < 1%                | 1–2%           | > 2% or any new high-freq issue |
| **Checkout error rate**                   | Sentry on `/api/create-checkout` + `checkout_started`→`succeeded` gap | < 2%                | 2–5%           | > 5%                            |
| **Funnel 1 — landing → sim_opened**       | `query-funnel`                                                        | ≥ 40%               | 25–40%         | < 25%                           |
| **Funnel 2 — sim → artifact**             | `query-funnel`                                                        | ≥ 15%               | 8–15%          | < 8%                            |
| **Funnel 3 — gate view → checkout start** | `query-funnel` (once events ship)                                     | ≥ 8%                | 4–8%           | < 4%                            |
| **Funnel 3 — free → Pro (cumulative)**    | Supabase `is_pro` ÷ free users                                        | ≥ 5% (12-mo target) | 2–5%           | < 2%                            |
| **Funnel 4 — share links created**        | `query-trends` outbound                                               | ≥ 500 / 60 days     | 250–500        | < 250                           |
| **Funnel 4 — share view → signup**        | needs `share_viewed`+`referral_signup`                                | ≥ 1 / 20 views      | 1 / 20–50      | < 1 / 50 or unmeasurable        |
| **Funnel 5 — Week-1 return**              | `query-retention`                                                     | ≥ 25%               | 15–25%         | < 15%                           |
| **Funnel 5 — Week-4 return**              | `query-retention`                                                     | ≥ 12%               | 6–12%          | < 6%                            |
| **Instrumentation coverage**              | count of shipped vs. recommended events                               | 0 blocking gaps     | 1–2 gaps       | ≥ 3 funnels partial             |

Thresholds in the strategy-target rows (Pro conversion 5%, 500 share links / 60 days) are lifted directly from `PRODUCT_STRATEGY.md` §Growth and §Success Metrics. Activation/retention thresholds are starting hypotheses — the first month of real data should recalibrate them, and that recalibration is itself a retro→memory write-back per the operating-system roadmap.
