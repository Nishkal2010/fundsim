# FundSim Traction Metric + App-Story Scoreboard (FUN-57)

> One north-star activation metric and a 4-5 number scoreboard for a college application, grounded in the events that actually fire today. Every claim here is checked against `docs/INSTRUMENTATION_PLAYBOOK.md`, `src/lib/posthog.ts`, and the live call sites. Where a number needs an event that does not exist yet, it is marked **NEEDS SRC EDIT (founder)** — those are recommendations against founder-owned `src/*`, not auto-built.
>
> Voice note: the application story is "I built a free finance-deal simulator and N real students from M schools ran K deals on it." That is a usage story, not a revenue story. Pick metrics that prove students _used the thing_, not that money changed hands.

---

## 0. Ground truth — what fires today

Confirmed against the playbook's "Events ALREADY emitted" table and the call sites:

- PostHog is configured `autocapture: false`, `person_profiles: "identified_only"`. So: nothing is captured automatically except `$pageview` / `$pageleave`; every product action is an explicit `captureEvent`; anonymous visitors get **no person profile** until `identifyUser` fires on Supabase login (`App.tsx:625`). Demo/localStorage users are never identified.
- The artifact events that mean "a student finished a deal" all fire today: `share_link_copied` (`ShareButton.tsx`), `ib_excel_exported` (`IBSimulator.tsx:1468`), `deal_memo_downloaded` (`DealMemoTab.tsx:240`), `challenge_completed` (`DealChallengeModal.tsx:260`).
- Entry events fire today: `sim_opened` with prop `sim ∈ {pe,vc,ib}` (`App.tsx:219`). `simulator_entered` exists but is **Vercel-only**, so it is not in PostHog funnels.
- `email_captured` fires to PostHog with only `{ trigger, method }`. **The email string itself is NOT sent to PostHog** — it is upserted to Supabase `profiles(email, source, captured_at)` in `EmailCaptureModal.tsx:43-52`. This is the one place a school can be inferred (email domain), and it lives in **Supabase, not PostHog**.

This last fact decides where each scoreboard number comes from.

---

## 1. North-star activation metric (the ONE number)

**Activated Returning Student (ARS): a person who completed at least one full deal, then came back on a later day and opened a simulator again.**

Plain-English: they ran a deal to a real output (not just poked the UI), _and_ the product was good enough that they came back another day. That is the single signal that proves FundSim delivers practice value, because it only moves when both the "finished a rep" loop and the "worth returning for" loop work.

### Expressed against real event names

A person counts as an ARS when **both** hold:

1. **Completed a deal** — emitted any of (today's artifact events):
   `share_link_copied` OR `ib_excel_exported` OR `deal_memo_downloaded` OR `challenge_completed`
   (When `simulation_completed` ships — see §4 — collapse this to `event = 'simulation_completed'`.)
2. **Returned on a later calendar day** — emitted `sim_opened` (or any artifact event) on a day strictly after the day of (1), as the **same `person_id`**.

Because return requires same-person tracking, ARS is only countable for **identified users** (logged in via Supabase, so `identifyUser` has fired). That is the correct denominator anyway — a returning student is, by definition, someone the system can recognize twice.

### Queryable today — PostHog `execute-sql` (HogQL)

```sql
WITH completions AS (
  SELECT person_id, min(toDate(timestamp)) AS first_complete_day
  FROM events
  WHERE event IN ('share_link_copied','ib_excel_exported','deal_memo_downloaded','challenge_completed')
    AND person_id IS NOT NULL
  GROUP BY person_id
)
SELECT count(DISTINCT c.person_id) AS activated_returning_students
FROM completions c
JOIN events e
  ON e.person_id = c.person_id
WHERE e.event IN ('sim_opened','share_link_copied','ib_excel_exported','deal_memo_downloaded','challenge_completed')
  AND toDate(e.timestamp) > c.first_complete_day;
```

This is measurable **today**. It is the headline number to grow and to quote.

> Relationship to the playbook NSM: the playbook's north star is _Weekly Completed Simulations_ (a weekly operating dial). ARS is the _cumulative-traction_ version of the same idea for the application — it adds the "and came back" clause and drops the 7-day window, because an admissions reader cares about "students who stuck," not "this week's throughput." Same event vocabulary, different aggregation.

---

## 2. The scoreboard — 4-5 numbers for the application

Quote these as cumulative totals (all-time) with an "as of <date>" stamp. Order them so the strongest usage proof leads.

| #   | Number                            | Definition                                                                           | Source today                                                |
| --- | --------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1   | **Students who completed a deal** | distinct `person_id` (or distinct anon + identified) that emitted any artifact event | PostHog HogQL — **today**                                   |
| 2   | **Deals completed (total reps)**  | total count of artifact events                                                       | PostHog HogQL — **today**                                   |
| 3   | **Return rate**                   | ARS (from §1) ÷ students who completed a deal                                        | PostHog HogQL — **today**                                   |
| 4   | **Distinct schools reached**      | distinct email domains among captured emails                                         | Supabase `profiles.email` — **today** (see caveat)          |
| 5   | **Channel breakdown**             | sessions/completions grouped by referrer / utm_source                                | PostHog — **partial today**, clean after one event (see §4) |

### 2.1 Students who completed a deal (total) — TODAY, PostHog

```sql
SELECT count(DISTINCT coalesce(toString(person_id), distinct_id)) AS students_completed
FROM events
WHERE event IN ('share_link_copied','ib_excel_exported','deal_memo_downloaded','challenge_completed');
```

Using `coalesce(person_id, distinct_id)` counts anonymous completers too (anon users have a `distinct_id` but no `person_id`). For the conservative, defensible version quote `count(DISTINCT person_id)` (identified only) and note "plus anonymous users we don't double-count." For an application, lead with the identified-or-distinct count and say so honestly.

### 2.2 Deals completed (total reps) — TODAY, PostHog

```sql
SELECT count(*) AS deals_completed
FROM events
WHERE event IN ('share_link_copied','ib_excel_exported','deal_memo_downloaded','challenge_completed');
```

This is the "K deals run" number. Break it down by simulator for color (PE/VC/IB) — `share_link_copied` and `challenge_completed` don't carry `sim`, but you can approximate the IB share with `ib_excel_exported` count, and split `sim_opened` by its `sim` prop to show which simulator pulls usage:

```sql
SELECT properties.sim AS simulator, count(*) AS opens
FROM events
WHERE event = 'sim_opened'
GROUP BY simulator
ORDER BY opens DESC;
```

### 2.3 Return rate — TODAY, PostHog

Return rate = `activated_returning_students` (§1 query) ÷ `students_completed` (identified) (§2.1, person_id version). Quote it as a percentage. This is the number that proves stickiness, which is the hardest thing to fake and the most credible signal of a real product.

A cleaner cohort version uses PostHog's `query-retention` (returning event `sim_opened`, persons, weekly) and reads Week-1 / Week-4 return directly off the matrix — use that if the reader wants a curve rather than a single ratio.

### 2.4 Distinct schools reached — TODAY, Supabase (not PostHog)

The school dimension does **not** exist in PostHog (the `email_captured` event drops the address). It exists in Supabase, because `EmailCaptureModal.tsx` upserts the raw email to `profiles`. Distinct schools = distinct `.edu`-style domains:

```sql
SELECT count(DISTINCT split_part(email, '@', 2)) AS distinct_email_domains
FROM profiles
WHERE email IS NOT NULL;

-- and the actual list, to eyeball how many are real universities:
SELECT split_part(email, '@', 2) AS domain, count(*) AS students
FROM profiles
WHERE email IS NOT NULL
GROUP BY domain
ORDER BY students DESC;
```

**Caveats, stated plainly so the number is honest:**

- This only counts students who hit the Excel-export or deal-memo email gate, so it **undercounts** total schools (a student can complete a deal via share/challenge without ever giving an email). It is a floor, not a ceiling — which is fine for an application ("at least M schools").
- Domain ≠ school cleanly: gmail.com / outlook.com are noise. For the application, count and list only the `.edu` (and obvious international university) domains: filter `WHERE email LIKE '%.edu'` for the defensible figure, and report that as "distinct universities," with the broader domain count as a footnote.
- This query runs against Supabase via the Supabase MCP (`execute_sql`) or the SQL editor. Run `list_tables` first to confirm `profiles` has the `email`, `source`, `captured_at` columns the modal writes (the modal upserts them; confirm the migration created them, or they land as an error).

### 2.5 Channel breakdown — PARTIAL today, clean after one event

Today, top-of-funnel source is only reliably available from PostHog's automatic `$pageview` (which carries `$referrer` / `$referring_domain`) and any `utm_*` params PostHog parses into person/event properties. There is no named landing event yet. Workable today:

```sql
-- where landing traffic comes from (referring domain), last 90 days
SELECT properties.$referring_domain AS source, count(DISTINCT $session_id) AS sessions
FROM events
WHERE event = '$pageview'
  AND timestamp >= now() - INTERVAL 90 DAY
GROUP BY source
ORDER BY sessions DESC
LIMIT 20;
```

For "which channel produced _completers_" (the version worth quoting — Reddit vs. Product Hunt vs. direct), you need the source attached to the person at completion time. That is clean only once `landing_viewed` with `{ referrer, utm_source }` ships (§4). Until then, quote referrer-of-traffic as the channel mix and note it is session-level, not completion-level.

---

## 3. Measurable TODAY vs. needs a tiny event — summary

| Scoreboard number                        | Status                                                        | Where                               |
| ---------------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| North-star: Activated Returning Students | **TODAY**                                                     | PostHog HogQL (§1)                  |
| 1. Students who completed a deal         | **TODAY**                                                     | PostHog HogQL (§2.1)                |
| 2. Deals completed (total reps)          | **TODAY**                                                     | PostHog HogQL (§2.2)                |
| 3. Return rate                           | **TODAY**                                                     | PostHog HogQL / retention (§2.3)    |
| 4. Distinct schools reached              | **TODAY** (floor only)                                        | Supabase `profiles.email` (§2.4)    |
| 5. Channel breakdown                     | **PARTIAL today** (traffic mix yes; completer-attribution no) | PostHog `$pageview` referrer (§2.5) |

Everything in the scoreboard is countable right now. Only the _clean_ version of #5 (and the convenience of a single NSM event) needs new instrumentation.

---

## 4. The tiny events that would sharpen this — NEEDS SRC EDIT (founder)

These touch `src/*` (founder-owned). They are recommendations, not edits. None is required to populate the scoreboard; each just removes a caveat. Listed highest-leverage first.

1. **`landing_viewed`** with `{ referrer, utm_source }` — fire on home/Hero render in `App.tsx`, anon-safe (do not gate on auth). One `captureEvent` line. This is what turns #5 (channel breakdown) from "traffic mix" into "this channel produced N completers," which is the version an application wants ("most signups came from a Reddit post in r/FinancialCareers").

2. **`simulation_completed`** with `{ simulator, artifact }` — fire at each artifact action (or one rollup). One line per site, or one shared helper. Collapses the 4-event `IN (...)` lists in §1 and §2 into a single clean event, and lets you split completions by simulator without proxying. Pure legibility win; the proxy works today.

3. **School on identify** — when a logged-in user has a `.edu` email, set a person property `school_domain` in `identifyUser` (`src/lib/posthog.ts:38`), e.g. `identifyUser(id, { name, email, school_domain: email.split('@')[1] })`. This moves the "distinct schools" number into PostHog so it joins cleanly with completion/return data (today schools live in Supabase and completions live in PostHog — two tools, no join). Privacy-light since the email is already stored.

> Founder decision rule: if you ship exactly one of these, ship `landing_viewed` — channel attribution is the single weakest part of the current scoreboard and the part an admissions reader is most likely to ask "how did you get users?" about.

---

## 5. How to state it on the application (copy-ready shape)

Fill the brackets from the queries above, with an "as of" date:

> "FundSim is a free, no-signup web app where finance students run live private-equity, venture-capital, and M&A deals. As of [DATE], [N] students have completed [K] full deals on it, [P]% of them returning on a later day to run more. Usage has reached students at [M] universities. The largest single acquisition channel was [CHANNEL]."

Every bracket maps to one query in §1-§2. Run them the day you write the application so the numbers are current, and keep the "as of" date attached — a dated, queryable number reads as real; a round undated number reads as invented.
