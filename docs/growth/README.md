# FundSim Growth — Founder Action Queue

Do these top to bottom. Each item says what it is, where the ready-to-paste content lives, and exactly what you do. No LinkedIn anywhere. Wall Street Oasis and the recruiting Discords are handled by you separately — they are not in this queue.

---

## 1. Tester panels — DO FIRST (needs founder accounts)

Two tests that surface real usability + headline data before you push to public channels.

- **What:** A PickFu headline-ranking poll, plus a BetaTesting/Maze usability test on fundsimulate.com.
- **Content:** `docs/growth/tester-panels.md` (poll question + headline options and the usability task script are copy-paste ready).
- **You do:**
  1. **PickFu** — _create a pickfu.com account_ (Claude cannot create accounts), then launch the headline poll using the question + options from the doc.
  2. **BetaTesting/Maze** — _create the account_ on whichever platform you pick, then load the usability test script from the doc pointed at fundsimulate.com.

---

## 2. Show HN (no account beyond your HN login)

- **What:** A Show HN submission with title variants and a first comment, grounded in the real PE/VC/IB sims and the free/no-signup model.
- **Content:** `docs/growth/show-hn.md` (4 title variants, full first comment + a shorter variant, posting/comment-handling guidance).
- **You do:** On a **Tue/Wed/Thu, 8–10am ET**, go to `news.ycombinator.com/submit`, paste **title #1** and url `fundsimulate.com`. Immediately post the first comment, then stay live in the thread for 3–4 hours answering replies.

---

## 3. Fishbowl post

- **What:** A Fishbowl post in two variants — feedback-seeking and a beat-my-score challenge — built on the free no-signup sims, the 100-point IB score, and the leaderboard.
- **Content:** `docs/growth/fishbowl-post.md` (Variant A + Variant B, copy-paste).
- **You do:** Replace `[fundsimulate.com]` with the live link. Paste **Variant A** into the **Investment Banking** bowl. 2–3 days later, post **Variant B** in **Consulting Exit Opps** or **PE**.

---

## 4. Creator outreach

- **What:** Outreach to 10 verified TikTok/YouTube finance-prep creators (no LinkedIn), with templates built on the free "practice layer" + shareable-scorecard angle.
- **Content:** `docs/growth/creator-outreach.md` (10 creators with public contact channels, 3 templates: email, TikTok DM, beat-my-score follow-up).
- **You do:** Confirm the handles/channels marked `[verify]`, then send **Template A** to the Tier-A creators first — **Afzal Hussein** (`info@afzalhussein.com`) and **Peak Frameworks** (media-kit page). Personalize the one bracketed line per creator.

---

## Do these with Claude next (need your approval + a code change)

These are not send-it-yourself tasks. Read, decide, then hand back to Claude to implement.

- **First-screen conversion copy** — `docs/growth/first-screen-copy.md`. 3 headline variants, a sub-line, three one-click "Run a … deal" CTAs, and a layout that demotes the competitor table + feature cards below the fold. **You do:** read it, pick a headline (**A recommended**), approve the three-button layout. Claude then implements it against `Hero.tsx`, `SimulatorSelector.tsx`, and the `activeSimulator===null` branch in `App.tsx`.
- **Traction metric** — `docs/growth/traction-metric.md`. One north-star (Activated Returning Student) + a 5-number application scoreboard, each with copy-paste HogQL/SQL. **You do:** run the §1 and §2 queries (PostHog + Supabase) with an "as of" date, drop the numbers into the §5 application sentence. Some events need a source edit first — Claude can do that.
