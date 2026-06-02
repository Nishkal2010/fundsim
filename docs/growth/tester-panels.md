# Tester Panels — PickFu Poll + Usability Test (FUN-64 + FUN-65)

> Turnkey first action for the founder. Two paid panels you can run today, copy-paste ready.
>
> **Read this first — what these panels are and are NOT.** PickFu and BetaTesting.com / Maze
> recruit **generic US consumers / generic testers**, not real finance students. Treat their
> output as **first-impression and UX signal only**: does the landing page read clearly, can a
> stranger find and finish a deal, does the score screen make sense. They are NOT the
> real-finance-student traction story — a random panelist saying "I'd use this for an interview"
> is a comprehension signal, not a finance-student demand signal. The traction story comes from
> actual club/professor outreach (separate workstream). Use these panels to make the front door
> obvious before you point real students at it.
>
> Grounding: the landing page today is `src/components/SimulatorSelector.tsx` — headline
> "Three careers. One platform.", a "PICK YOUR TRACK" badge, three cards (Private Equity /
> Venture Capital / Investment Banking), and a social-proof strip ("the only simulator that
> scores both"). A `Hero.tsx` comparison block sits above it. The product is free, no signup,
> instant. IB produces a 100-point Deal Score; every simulator ends in a shareable/exportable
> artifact. FundSim's wedge vs. AmplifyME is "practice before anyone's watching" — free,
> instant, unlimited reps.

---

## PART 1 — PickFu poll (FUN-64)

### What you are testing

Which landing headline makes a college student most want to click in and try a free finance
deal simulator. The current live headline ("Three careers. One platform.") is elegant but does
not say what the thing is or why a student should care in the 3 seconds before they bounce. You
are testing three replacement headlines against each other for pull and clarity.

### Headline variants to test

Run these as the three options in a **ranked / "which would make you most likely to try this"**
poll. Keep them short — this is the H1, not a paragraph.

- **Variant A (job-outcome / interview angle):**
  "Practice the deal before the interview. Free PE, VC & IB simulators — no signup."

- **Variant B (reps / practice-layer angle):**
  "You've watched the videos. Now run the deal. Free private equity, venture, and M&A
  simulators."

- **Variant C (instant / try-it angle):**
  "Run a real buyout, cap table, or M&A deal in your browser. Free, instant, no account."

> Optional 4th if you want a control: include the current live headline
> "Three careers. One platform. — practice PE, VC & IB deals free" so you can see how far the
> rewrites move the needle. PickFu lets you add up to 8 options; 3–4 is the sweet spot for clean
> ranking.

### Poll questions (exact text)

PickFu's core format is one question per poll with the options ranked and an open-ended "why"
captured from every respondent. Run **two polls** (PickFu charges per poll/per response, so two
focused polls beat one muddy one):

**Poll 1 — Headline ranking (the main test).**
Question text:

> "Imagine you are a college student studying finance or business. You land on a free website.
> Which of these headlines makes you MOST want to click in and try it? Rank them, and in one
> sentence tell us why your top pick won."

Options: Variant A, Variant B, Variant C (and the control if you add it). PickFu auto-collects a
written "why" from each respondent — that open text is the most valuable output, more than the
rank itself.

**Poll 2 — Intent / objection (open-response poll).**
Use PickFu's "open-ended / poll without images" format. Question text:

> "This is a free website where finance students practice live private equity, venture capital,
> and investment banking deals — no signup, instant, unlimited tries. Would you use it to prep
> for a finance internship or interview? Answer yes or no, then explain why or why not in one or
> two sentences."

This question surfaces the objection language you will reuse everywhere (the "no because…"
answers tell you what the landing page must pre-empt).

> Note on accuracy: PickFu panelists are general US consumers, so Poll 2's "would you use it"
> is a comprehension-and-appeal proxy, not a finance-student purchase intent. Read the _reasons_,
> not the yes/no split.

### Audience targeting (US college students)

PickFu's audience builder lets you filter the general US panel. Set:

- **Country:** United States.
- **Age:** 18–24 (this is PickFu's closest proxy to current college students; there is no
  verified "enrolled student" filter, so age 18–24 plus the prompt framing is how you approximate
  it).
- **Education (if offered in your plan tier):** "Some college" and above.
- **Audience size:** 50 respondents per poll is the standard PickFu minimum for a directional
  read; 50 is enough to separate a clear winner from the pack. Do not over-buy — these are
  directional, not statistically rigorous.
- Leave gender / income unfiltered; you want breadth on a top-of-funnel headline test.

> PickFu does NOT have a "finance major" filter. Lean on the in-question framing ("Imagine you
> are a college student studying finance or business…") to set context. This is exactly why
> these panels are first-impression-only and not your traction proof.

### How to set up and run it on pickfu.com (you create the account)

You do this yourself — no account is created for you.

1. Go to **pickfu.com** and click **Sign Up / Get Started**. Create the account with
   `nishkal.dachepelly@gmail.com`.
2. Choose **Create a Poll**. For Poll 1, pick the **"Ranked" / multiple-option** poll type
   (text options, no images needed — though you may screenshot each headline on the real page if
   you want them seen in context).
3. Paste the Poll 1 question text above into the question field. Add Variant A, B, C (and the
   control) as the options.
4. Click **Audience → Targeted Audience**. Set Country = United States, Age = 18–24, Education =
   Some college and above (if available on your tier). Set respondent count to **50**.
5. Review the per-response price PickFu shows before you pay (general-audience polls are the
   cheapest; each demographic filter raises the per-response cost). Confirm and launch. Results
   typically return within an hour or two.
6. Repeat for **Poll 2**: choose the **open-ended** poll format, paste the Poll 2 question, set
   the same audience, 50 respondents, launch.
7. When results land, read the **written rationales first**, then the ranking. Pull the 3–5 most
   repeated reasons the winning headline won, and the 3–5 most common objections from Poll 2.

### What to do with the result

- The winning headline (plus the rationale themes) becomes the recommended new H1 for
  `SimulatorSelector.tsx` / `Hero.tsx`. File it as a founder rec — `src/*` is founder-owned, so
  it is a recommended edit, not an auto-edit.
- The objection themes from Poll 2 become the bullets the landing page must answer above the
  fold (e.g. "is it actually free", "do I need to know Excel", "how long does it take").
- Save the raw responses; they are quotable in the college-application traction write-up as
  "ran two PickFu panels (n=100) to validate landing messaging."

---

## PART 2 — Usability test (FUN-65) — BetaTesting.com (or Maze)

### What you are testing

Can a stranger who has never seen FundSim land on the page, start a deal, finish it, and find
their score — without help? This is pure UX / first-run friction. You watch where they hesitate,
misclick, or give up.

Pick **one** platform:

- **BetaTesting.com** — recruits real human testers who record their screen + think out loud
  (video). Best for "watch a stranger struggle" qualitative signal. Costs more per tester, fewer
  testers.
- **Maze** — unmoderated, click-path / task-success analytics on a live URL or prototype. Best
  for "where do people drop / misclick" quantitative heatmaps. Cheaper, faster, more testers, no
  video by default. Maze can recruit from its panel or you can bring your own link.

Recommendation: if you want to _see and hear_ the confusion, use BetaTesting.com with 5 testers.
If you want drop-off numbers and click heatmaps fast, use Maze with 15–20.

### The test URL

Point testers at the live production site: **https://fundsimulate.com** (the real homepage that
renders `SimulatorSelector.tsx`). No login or setup is required since the product is free and
no-signup — that is the whole point and you want testers to experience exactly that.

### Task script (give testers these 4 tasks, in order)

1. **Land and orient (10–15 sec).** "Open the page. Without clicking anything yet, say out loud:
   what is this website, and who is it for?" (This tests whether the headline communicates the
   product. Captures first-impression before any interaction.)

2. **Start a deal.** "Pick whichever of the three tracks looks most interesting to you —
   Private Equity, Venture Capital, or Investment Banking — and start it. Talk through what you
   expect to happen." (Tests whether the card → simulator entry is obvious and whether they
   understand they can just dive in, free, no signup.)

3. **Finish the deal / produce a result.** "Work through the simulator until you reach a result
   or an end state — a finished model, a deal outcome, or a final number. Don't worry about
   getting it 'right'; just go until it feels done." (Tests whether the simulator has a legible
   path to completion and an obvious 'done' state. For IB, the natural end is the 100-point Deal
   Score; for PE/VC it is the performance/cap-table output.)

4. **Find your score / result.** "Find your score, your result, or the number that tells you how
   you did. Then find how you would share or save it." (Tests discoverability of the score screen
   and the share/export artifact — the growth loop. Watch whether they ever find the
   share/export action.)

### The 4 questions to ask (post-task)

Ask all four after the tasks, verbatim:

1. **Clarity:** "In one sentence, what does FundSim let you do — and was that clear from the very
   first screen, or did you only get it later?"
2. **Friction:** "What was the single most confusing or annoying moment, and where exactly did it
   happen?"
3. **Completion confidence:** "When you reached the end, did you feel sure you had finished and
   that you understood your result? Why or why not?"
4. **Pull / return:** "If you were a finance student prepping for an internship interview, would
   you come back and use this again? What would make you more likely to?"

### How to set up and run it (you create the account)

You do this yourself — no account is created for you.

**If using BetaTesting.com:**

1. Go to **betatesting.com**, click **Get Started / Launch a Test**, create the account with
   `nishkal.dachepelly@gmail.com`.
2. Create a new test. Test type: **Usability test (think-aloud, screen recording)**, platform
   **Desktop web** (and optionally a second run on **Mobile web** — the page has a mobile layout
   with an expandable feature list worth checking).
3. Target URL: `https://fundsimulate.com`. No credentials needed.
4. Demographics: United States, age 18–24 if the filter exists; otherwise leave general and rely
   on the task framing. Request **5 testers** for the first run.
5. Paste the 4 tasks as the test steps and the 4 questions as the post-test questionnaire.
6. Review the price, launch. Recordings typically return within a day or two.

**If using Maze instead:**

1. Go to **maze.co**, create the account with `nishkal.dachepelly@gmail.com`, start a new
   **maze** project.
2. Add a **Live Website** block pointing at `https://fundsimulate.com`.
3. Add the 4 tasks as **mission** blocks (Maze tracks task success rate, time, and misclick
   heatmaps per mission). Add the 4 questions as **open-question** blocks at the end.
4. Choose **Recruit from Maze panel** (set US, 18–24 if available) or share the maze link
   yourself. Request **15–20 testers** for usable heatmaps.
5. Launch and read the per-mission success/drop-off and the misclick heatmaps.

### What to do with the result

- Each spot where ≥2 testers hesitated, misclicked, or could not find the score/share action is
  a ranked UX fix. Write them up as founder recs against the specific component
  (`SimulatorSelector.tsx`, the IB Deal Score screen, `ShareButton.tsx`) — recommendations, not
  auto-edits, since `src/*` is founder-owned.
- Task 4 failures (can't find score / can't find share) directly threaten the share-link growth
  loop — prioritize those.
- Keep the recordings/clips; "ran a 5-tester moderated usability pass + Maze click study"
  is a credible line in the traction write-up.

---

## Reminder on positioning (for both panels)

These two panels validate the **front door**: is the headline clear, can a stranger get in and
out, is the score and share obvious. They do **not** prove finance-student demand. The real
traction story is built from club VP-of-Education and professor outreach, Deal Challenges, and
documented student usage — a separate workstream. Run these first so that when real finance
students arrive, the door is already obvious and frictionless.
