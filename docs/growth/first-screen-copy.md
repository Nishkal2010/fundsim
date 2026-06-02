# First-Screen Conversion Spec (FUN-58)

> **Status: DRAFT for founder approval.** This is a copy + layout spec. Nothing in `src/` is edited here. Once Nishkal approves the headline variant and layout, it gets implemented against `src/components/Hero.tsx`, `src/components/SimulatorSelector.tsx`, and the render branch in `src/App.tsx` (`activeSimulator === null`).

## The problem this fixes

"They just look." A cold visitor today lands on `Hero.tsx` — a **5-row competitor comparison table** ("THE HONEST COMPARISON / Why pay $1,499 for a course...") with a stat strip and a single button labeled **"Pick your simulator"** that does not run anything: it `scrollIntoView`-smooth-scrolls down to `SimulatorSelector.tsx`. There the visitor meets three dense cards (PE/VC/IB), each listing 8-11 features, stats, and taglines, and a CTA reading **"Enter PE Simulator"**. So the real path to running a deal is:

`land on a comparison table → read it → click "Pick your simulator" → scroll → read three feature-dense cards → click "Enter X Simulator"`

That is **two clicks and a scroll, fronted by a competitor table and ~30 feature bullets**, before anything happens. The first screen sells "why we're cheaper than Wall Street Prep" — a comparison argument — instead of getting the visitor's hands on a live deal. Cold finance students bounce because the first thing they have to do is _evaluate_, not _play_.

The fix: make the **first paint** a single, obvious "run a deal now" action. Everything that is currently above the fold (the comparison table, the long feature lists) is real and good — but it is **proof for the skeptic, not the hook for the newcomer**. Demote it below the fold.

The one function that actually starts a deal is `setActiveSimulator(id)` in `App.tsx` (it swaps the whole view into the live PE/VC/IB simulator). The first-screen CTA must call exactly that — **one click, sim running** — not a scroll.

## FundSim's real angle (what the copy must carry)

Grounded in `COMPANY.md` and `PRODUCT_STRATEGY.md`:

- **Free, no signup.** "No Excel, no install, no account required to explore." This is the wedge against AmplifyME (institutional, gated, instructor-scheduled) and against the $1,499 courses.
- **Instant + live.** Every output recomputes live as inputs change; the deal runs in the browser the moment you click.
- **Practice, not watch.** Positioning line from strategy: _"You've watched the videos. Now run the deal."_ The competitor angle is **"practice before anyone's watching"** — free, instant, unlimited reps.
- **Three real verticals.** PE buyout fund, VC cap table, IB M&A — the actual desks finance students recruit for.

The first screen should make a student feel: _I can run a real PE/VC/IB deal right now, for free, without signing up — one click._

---

## Headline — pick one (2-3 variants)

All three are written to pair with the same sub-line and CTA. Voice is FundSim-factual: confident, concrete, no hype words, no emojis.

**Variant A — the practice wedge (recommended).**

> # Run a real PE, VC, or IB deal. Right now. For free.

- Why it's the lead pick: it states the action (run a deal), the scope (the three desks a finance student cares about), and the two killer attributes (instant, free) in one line. It is a _do_ statement, not a _compare_ statement.

**Variant B — the angle, sharpened ("before anyone's watching").**

> # Practice the deal before anyone's watching.

- Sub-headline does the lifting on free/instant. This is the most distinct, brand-defining line and the closest to the strategy positioning. Slightly more abstract — best if paired tightly with the sub-line below so "the deal" is concretely PE/VC/IB.

**Variant C — the contrast with the courses (closest to today's tone).**

> # You've watched the videos. Now run the deal.

- Directly lifts the strategy one-liner. Strong for a finance audience that has sat through Wall Street Prep / BIWS / CFI videos. Reuses tone the founder already approved in `Hero.tsx`, so lowest-risk to ship.

## Sub-line (one, used with any variant)

> Build an LBO, a VC cap table, or an M&A deal in your browser — live, free, no signup. Pick a desk and start in one click.

Shorter alt (if the headline already says "free"):

> Pick a desk — Private Equity, Venture Capital, or Investment Banking — and start running the deal in one click. No signup.

## Primary CTA label

Three buttons, one per desk, so the **primary action is literally starting a deal** (not "pick" or "learn more"). Each button calls `setActiveSimulator(id)` directly.

- `Run a PE deal`
- `Run a VC deal`
- `Run an M&A deal`

If a single primary button is preferred over three, use:

> **Start a deal — free, no signup**

...wired to open the most-used desk (PE) directly, with VC/IB as two smaller secondary buttons beside it. **Three equal buttons is the recommendation** — it removes the "which one?" hesitation by making all three a single click, and it matches the three real verticals.

Micro-label under the buttons (reassurance, one line):

> Free forever. No account needed. Runs in your browser.

---

## Layout spec — above the fold

**Goal: first paint = headline + sub-line + three "Run a … deal" buttons, all visible without scrolling, on a laptop and on mobile.** A visitor can start a deal without reading anything else.

### Show (above the fold, in order)

1. **Logo + one-line nav** (already exists) — keep minimal.
2. **Headline** (chosen variant), serif, large — same type treatment as the current `Hero` `<h2>` (`font-serif text-3xl md:text-4xl text-[#F9FAFB]`).
3. **Sub-line**, one sentence, muted (`text-[#6B7280]` / `text-sm`), max-width constrained so it stays one or two lines.
4. **Three primary buttons** — `Run a PE deal` / `Run a VC deal` / `Run an M&A deal`. Side by side on desktop, stacked full-width on mobile. Each carries its desk's accent color (PE indigo `#818CF8`, VC green `#34D399`, IB amber `#F59E0B`) to echo the existing card colors. Each button = one `setActiveSimulator(id)` call.
5. **Reassurance micro-line** under the buttons: "Free forever. No account needed. Runs in your browser."
6. **One thin trust line** (single row, not the full table): e.g. "Free · No signup · PE + VC + IB · Used by finance students worldwide." (the social-proof string already lives in `SimulatorSelector.tsx`).

That is the entire first screen. Nothing else competes with the buttons.

### Defer (move below the fold — keep it, don't delete it)

- **The competitor comparison table** (`Hero.tsx`, all 5 rows + "YOU ARE HERE"). It is excellent _proof for a skeptic_ but it is an evaluation task, not a hook. Move it to a section the visitor reaches by scrolling, under a heading like **"How FundSim compares"**. Keep it exactly as built.
- **The stat strip** ("28+ modules / 3 tracks / $0") — keep, place between the buttons and the comparison table as a light reinforcement, or fold into the comparison section.
- **The three feature-dense cards** (`SimulatorSelector.tsx`) — these stay, but as the **second screen / "what's inside each desk"** detail, reached by scrolling _or_ shown after the user has already entered (they already enter on button click). The 8-11 feature bullets and taglines are reference content, not first-touch content. The "+ N more features" mobile expander stays as is.

### Mobile

- Headline scales down (current `text-3xl` base is fine).
- Three buttons stack vertically, full-width, with comfortable tap targets (min 44px height).
- Sub-line and reassurance line stay; the comparison table and feature cards are well below the fold (acceptable — they're proof, fetched on scroll).

### Behavior / wiring notes (for the implementer, not part of the copy)

- Each "Run a … deal" button → `setActiveSimulator("pe" | "vc" | "ib")`. This is the existing one-call path; no scroll, no intermediate screen.
- This is also the right place to fire the recommended **`landing_viewed`** event (Funnel 1, step 1 in `docs/INSTRUMENTATION_PLAYBOOK.md`) on first render, and to confirm the **`simulator_entered` → PostHog** mirror fires on button click so the landing→simulate funnel is legible. Adding those events touches `src/*` (founder-owned) — flagged, not done here.
- Keep `Hero`'s framer-motion entrance; just change _what_ enters first.

---

## Why this should lift Funnel 1 (landing → `sim_opened`)

The instrumentation playbook sets the target at **≥ 40% of landing sessions reaching `sim_opened`**, and notes the top funnel is the highest-leverage thing to fix. Today the first screen asks the visitor to read a comparison table and click a button that only scrolls — the actual `sim_opened`-triggering action (`setActiveSimulator`) is two interactions and a wall of features away. Putting three one-click "Run a … deal" buttons in the first paint collapses that to a single interaction, which is the most direct possible lever on the landing→simulate conversion this ticket exists to move.

## Copy block — ready to paste (recommended config)

```
Headline:  Run a real PE, VC, or IB deal. Right now. For free.
Sub-line:  Build an LBO, a VC cap table, or an M&A deal in your browser —
           live, free, no signup. Pick a desk and start in one click.
Buttons:   [ Run a PE deal ]   [ Run a VC deal ]   [ Run an M&A deal ]
Micro:     Free forever. No account needed. Runs in your browser.
Trust:     Free · No signup · PE + VC + IB · Used by finance students worldwide
```

Below the fold, in order: stat strip → "How FundSim compares" (existing comparison table) → "What's inside each desk" (existing three feature cards).
