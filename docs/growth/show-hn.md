# FUN-67 — Show HN draft

Ready-to-post Show HN for FundSim. The founder copies the title into the HN "title" field, the
URL into the "url" field, and posts the first comment immediately after the submission goes live.

DRAFT ONLY. Do not submit on the founder's behalf. The founder posts this manually from their own
Hacker News account.

---

## The submission

**URL to submit:** `https://fundsimulate.com`

(Submit the plain homepage. Do not link a deep simulator route or a `/s/:id` share link — HN wants
the project itself, and the homepage already routes to the PE/VC/IB picker.)

---

## Title — pick one

HN convention: prefix with `Show HN:`, keep it factual, no hype words ("amazing", "powerful",
"revolutionary"), no exclamation points. Each of these is honest and specific to a deal simulator.

1. **Show HN: FundSim – a free in-browser simulator for PE, VC, and M&A deals**
2. **Show HN: FundSim – run a leveraged buyout or a VC cap table in the browser, no signup**
3. **Show HN: A finance-deal simulator I built as a student – LBO, cap tables, M&A**
4. **Show HN: FundSim – practice private equity, venture, and IB modeling for free**

Recommended: **#1.** It names the three verticals, leads with "free in-browser", and reads as a
tool, not a pitch. #2 is the strongest if you want the "no signup" friction-killer in the title
itself. #3 leans on the student-built angle (HN tends to reward that) but is slightly less specific
about what it does.

Avoid: anything with "the practice layer", "master", "like an analyst", or competitor name-drops
(Goldman/KKR/etc.) in the title — that copy works on the landing page but reads as marketing on HN.

---

## First comment (the founder's note)

Post this as the first comment within a minute or two of the submission going live. Paste it as
plain text. Replace nothing — it is written to be copy-pasted as-is.

---

I'm a student and I built FundSim because the way you actually learn finance modeling is broken.
The instruction layer is everywhere — Wall Street Prep, Breaking Into Wall Street, a thousand
YouTube videos — but the only place to actually _run_ a deal is a blank Excel file or a $200 course
template. So you watch the videos and then have nowhere to practice before it counts.

FundSim is the practice layer. It's a browser app with three simulators:

- **Private Equity** — model a buyout fund end-to-end: LP capital calls, the 2/20 fee drag, the
  J-curve, a European vs. American waterfall, and net returns (DPI / TVPI / IRR / PME). Plus a
  standalone LBO with a real debt schedule.
- **Venture Capital** — build a cap table across rounds with SAFE conversion (pre/post-money caps,
  discounts, MFN), option-pool shuffle, anti-dilution, liquidation preferences, and a power-law
  portfolio model.
- **Investment Banking** — run an M&A deal from valuation (DCF, comps, precedents) through offer
  structure and accretion/dilution with synergies, scored on a 100-point rubric.

Everything recomputes live as you change inputs. All the finance math runs client-side — there's no
"submit and wait" — and the engines have a test suite, because a silently-wrong IRR or waterfall is
worse than no tool at all.

It's free and there's no account required to use any of the core simulators. You can open it and be
running a buyout in about ten seconds.

What I'd genuinely like feedback on:

1. If you've worked in PE/VC/IB — where is the math wrong, oversimplified, or missing an assumption
   that would get me laughed out of the room? I care more about this than anything else.
2. For the cap table and waterfall specifically: are the defaults sane, or do they bias toward a
   textbook case that doesn't match real deals?
3. Is the three-track structure (pick PE, VC, or IB up front) the right framing, or would you rather
   land somewhere neutral and drill in?

Built with React + TypeScript, finance engines are plain modules with vitest coverage, deployed on
Vercel. Happy to go into the modeling assumptions for any of the three in the comments. Thanks for
taking a look.

---

(End of comment. ~250 words — long enough to be substantive, short enough that people read it.)

---

## A shorter first-comment variant

If the above feels too long for the founder's taste, this is a tighter version that keeps the
essentials (what, free/no-signup, student, feedback ask):

---

I'm a student and built this because there's a ton of finance-modeling instruction out there but
almost nowhere to actually practice a deal that isn't a blank Excel file.

FundSim has three browser simulators that all recompute live as you change inputs:

- PE: buyout fund model (capital calls, 2/20 fee drag, J-curve, European/American waterfall, net
  IRR/TVPI/DPI) plus a standalone LBO.
- VC: cap table across rounds with SAFE conversion, option pool, anti-dilution, liquidation prefs,
  and a power-law portfolio.
- IB: an M&A deal from DCF/comps/precedents through offer structure and accretion/dilution, scored
  on 100 points.

All the math runs client-side and the engines are unit-tested. It's free, no account needed — you
can be running a buyout about ten seconds after opening it.

The feedback I most want: if you've done this work for real, where is the math wrong,
oversimplified, or missing an assumption that matters? Built with React/TypeScript on Vercel; happy
to dig into the modeling for any of the three in the comments.

---

## Posting guidance

**When to post.** Best window for Show HN is a US weekday morning, Eastern time. Aim for
**Tuesday, Wednesday, or Thursday between 8:00 and 10:00 AM ET.** That puts you on the front-page
churn while the US is waking up and Europe is still active, and it's early enough that the post has
the whole US workday to accumulate points and comments. Avoid Friday afternoon, weekends (lower
traffic, though competition is also lower — a fallback, not a first choice), and US holidays.

**One submission only.** Don't post the same link twice in a short span — HN penalizes reposts. If
the first attempt gets zero traction within a couple of hours, that's information; don't immediately
re-submit. You can legitimately re-submit a story weeks later if it genuinely got no attention, but
not same-day.

**Be at your desk for the next 3–4 hours.** The single biggest driver of a Show HN doing well is
the founder being present and responsive in the comments right after posting. Block the time.

**How to handle comments:**

- **Answer the technical critiques first and fully.** When someone who's worked in PE/VC/IB says
  your waterfall tier or IRR convention is off, that's the most valuable comment you'll get. Engage
  with the specifics, concede where they're right, and say what you'll change. "You're right, the
  American waterfall should net the GP clawback — I'm fixing that" earns more credibility than any
  marketing line. This is exactly the feedback you asked for, so treat it as a gift.
- **Don't get defensive.** HN rewards founders who take criticism well and punishes ones who argue.
  If a comment is harsh but correct, thank them. If it's harsh and wrong, explain calmly once and
  move on — don't go three rounds.
- **Answer "is this free / what's the catch?" plainly.** Say: the core simulators are free with no
  account; there's an optional Pro tier for saving models and exporting, but you don't need it to
  use the thing. Don't oversell the paid tier — HN distrusts anything that smells like a funnel.
- **Don't ask for upvotes anywhere.** Asking for upvotes (on HN, in DMs, in the thread) is against
  the rules and can get the post flagged. Let it stand on its own.
- **Reply fast and short.** A quick, specific reply within minutes beats a polished essay an hour
  later. Aim to respond to every substantive comment in the first few hours.
- **Take feature requests gracefully.** "Good idea, adding it to the list" is a fine answer. You
  don't have to commit to building everything; acknowledge it and note the genuinely good ones.
- **If someone finds a bug,** thank them, confirm you can reproduce it, and post back in the thread
  when it's fixed. A "fixed, thanks" reply during the live thread is great social proof.

**What not to do:**

- No emojis in the title or the first comment.
- Don't link the Pro/pricing page as the submission — link the free homepage.
- Don't mention LinkedIn or cross-post asks.
- Don't pad the comment with competitor name-drops or "used by students worldwide" type claims —
  HN reads marketing copy as a negative signal. Keep it factual.

**The one link to submit:** https://news.ycombinator.com/submit — log in to your HN account, put
the title in the "title" field, put `https://fundsimulate.com` in the "url" field, leave the "text"
field empty (because you're submitting a URL, not a text post), submit, then immediately open your
new submission and post the first comment.
