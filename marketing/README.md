# FundSim Marketing — Master Index

Everything for the FundSim launch campaign lives here. Each file is self-contained and ready to use.

## What's here

```
marketing/
├── README.md                              ← this file
├── launch/
│   ├── calendar.md                        ← 30-day launch schedule, T-7 through T+30
│   └── hn-and-product-hunt.md             ← Show HN post + PH launch kit
├── social/
│   ├── x-twitter-queue.md                 ← hero thread + 2 weeks of standalones, ready to xurl
│   ├── reddit-drafts.md                   ← 7 subreddit-tailored posts + reply playbook
│   └── short-form-video-scripts.md        ← 6 TikTok/Reels/Shorts scripts (30-60s each)
├── outreach/
│   └── community-list.md                  ← Discord servers, university clubs, YouTube creators
├── seo/                                   ← (reserved for future blog posts)
└── assets/                                ← (reserved for screenshots, OG images, video files)
```

Plus, committed to `/public/learn/`:
- `learn/index.html` — Learn hub
- `learn/private-equity-waterfall.html`
- `learn/lbo-model-explained.html`
- `learn/j-curve-private-equity.html`
- `learn/cap-table-dilution.html`
- `learn/deca-finance-events.html`

And `public/sitemap.xml` updated with all six new URLs.

## How to use this

1. **Read** `launch/calendar.md` first. It's the playbook.
2. **Authenticate xurl** outside this agent session (see `~/.hermes/skills/social-media/xurl/SKILL.md` for the one-time setup). Once done, every tweet in `social/x-twitter-queue.md` is `xurl post "..."`-ready.
3. **Find a PH hunter** before launch day. Don't try to self-launch on PH unless you have the karma.
4. **Pre-record the short-form videos** during T-7. You'll never have time on launch week.
5. **Deploy and verify** the /learn/ pages render correctly. Commit + push to main → Vercel auto-deploys.

## Channels we're NOT using (per user preference)

- LinkedIn (skip entirely)
- Cold email / Gmail outreach (skip entirely)

Everything else is fair game.

## Things still to produce (manual)

- 6 product screenshots for HN / PH gallery (1280×800 PNG ideal)
- og-image.png if it's not already in /public/ at 1200×630
- The 6 short-form videos (script provided, recording is on you)

## Notes for future iterations

- The Stripe paywall is dormant. If/when you turn it on, the marketing copy changes from "no paywall" to "free tier + pro". Update everywhere when that happens.
- After T+30, the rhythm becomes weekly content from `/learn/` and short-form. The launch surge dies down; SEO and creator relationships compound.
