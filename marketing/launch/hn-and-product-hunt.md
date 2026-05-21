# Hacker News — Show HN launch

## Title (matters more than the post)
```
Show HN: FundSim – a free, browser-based PE/VC/IB simulator
```

Backup titles, ranked:
1. `Show HN: A free browser simulator for LBOs, PE waterfalls, and VC cap tables`
2. `Show HN: FundSim – interactive finance models without Excel`

The "Show HN:" prefix is mandatory. Keep it short. HN dislikes adjectives.

## Body
```
Hi HN — I built FundSim because every "learn finance" path leads to a $400 course or a broken Excel template from 2014. There was no place to just *play* with the models.

FundSim runs three simulators in the browser:

- PE: LBO model with debt schedule + sensitivity grid, fund-level waterfall (European + American), J-curve, DPI/RVPI/TVPI/PME, portfolio construction
- VC: multi-round cap table with SAFEs and option pool math, term sheet builder, AI deal memo
- IB: DCF + comps + precedents, accretion/dilution, deal score, deal compare

There's also a Claude-powered tutor that knows what screen you're on, plus roleplay modes (PE seller, VC founder, IB client) with concrete walk-away thresholds.

Stack: React 19 + Vite + TypeScript SPA on Vercel. Supabase for auth + autosave. Anthropic Claude via a hardened serverless endpoint (origin-locked, rate-limited, screen-allowlisted, server-side guardrail prefix). PWA with stale-while-revalidate for assets. PostHog + Sentry. Vitest for the math engines (IRR, waterfall, LBO, J-curve, cap table all have unit tests).

It's genuinely free. No pro tier, no paywall, no email collection. There's a Stripe integration in the codebase that's dormant — I might add a pro tier eventually but the core stays free.

Things I'd love feedback on:
1. Math correctness, especially the waterfall catch-up tier and the LBO debt schedule
2. UX of moving between simulators — currently hash-routed with React.lazy boundaries
3. Whether the AI tutor's per-screen context actually helps or just gets in the way
4. Performance on slow devices — the YIS suite has one ~61-file-touch component I want to break up

Link: https://fundsimulate.com

Happy to answer anything technical in the comments.
```

## When to post
- **Tuesday or Wednesday, 8:00am PT (11:00am ET)** — historically the highest visibility window for Show HN.
- NOT Monday (overflow from weekend). NOT Friday (low traffic into the weekend).

## Comment strategy
- For the first 60 minutes after posting, refresh every 5 minutes and reply to every comment within 10 minutes. HN ranks rising posts partially by author engagement.
- Don't argue with criticism. "Fair point, I'll fix that" + actually fixing it within 24h is the only winning move.
- If anyone asks about monetization, be honest: dormant Stripe, planning a pro tier later, core stays free.
- If anyone asks "why not just use Excel" — that's the killer question. Answer: because the goal is the math being live and the inputs being draggable. Excel is the wrong tool for *learning*. It's the right tool for *building*.

## After the launch
- Whether it hits the front page or not, save the thread URL.
- Reply to top-3 comments with deeper technical detail (debt schedule edge cases, waterfall math).
- If it hits front page: be prepared for traffic — Vercel autoscales but the chat API has Anthropic rate limits.

---

# Product Hunt — launch kit

## Pre-launch (do this 5-7 days before launch day)
1. Make a Product Hunt account if you don't have one. Lurk for a week. Upvote and comment on 5-10 products in the finance/edu space.
2. Find a hunter with karma — someone who already posts on PH regularly. Reach out (NOT via the "request a hunter" form, which is dead). Best: ping someone in fintwit who has a PH profile.
3. Schedule launch for a **Tuesday or Wednesday at 12:01am PT** (the moment a new PH day starts). Avoid the same week as any big AI launch.

## Listing copy

**Tagline (60 chars max):**
```
The free browser simulator for PE, VC & IB models.
```

**Description:**
```
Build LBOs, model PE waterfalls, run VC cap tables, walk through a J-curve, and prep DECA finance events — all in the browser. No Excel. No signup. No paywall.

FundSim has three full simulators (Private Equity, Venture Capital, Investment Banking), a Claude-powered AI tutor that knows what screen you're on, and roleplay modes that let you negotiate against a PE seller, a VC founder, or an IB client.

Free. No pro tier. No collected emails. Just the place to actually play with the numbers until they make sense.
```

**Gallery (need to produce these — see /marketing/assets/):**
1. Hero shot: PE simulator with waterfall tab open
2. LBO debt schedule + sensitivity grid
3. VC cap table with SAFE conversion
4. AI tutor (FinFox) in roleplay mode
5. DECA suite step list
6. Side-by-side scenario compare

## Launch day comments
- Pin a comment at the top with: "Hi PH 👋 — answering everything in the thread today. Hit me with the hard questions."
- Reply to every comment within 30 min for first 4 hours.
- Don't spam your network with "please upvote" DMs — PH penalizes coordinated voting.

## Follow-up
- Whether you place top 5 or not, write a follow-up post 1 week later: "What I learned launching on PH" — that post often gets more traffic than the launch itself.
