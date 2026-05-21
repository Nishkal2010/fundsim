# Reddit Launch Plan

Reddit hates marketing. Reddit also hates Wall Street Prep. The opening is: *show up as a person who built a free thing, not a brand launching a product.*

## Pre-flight rules
1. The account posting MUST have karma in the relevant subs already. If yours doesn't, comment helpfully for 1-2 weeks first, or use a co-founder's account that does.
2. Read each sub's rules. r/PrivateEquity, r/venturecapital, and r/FinancialCareers all have explicit "no self-promo" rules — but they allow free resources from members in good standing. Frame matters.
3. Never post the same text in two subs back-to-back. Reddit shadow-throttles cross-posters.
4. Reply to every single comment in the first 4 hours.

---

## r/FinancialCareers — "I built a free LBO/PE/VC simulator because I was tired of broken excel templates"
**Best time:** Tuesday or Wednesday, 9am ET.
**Flair:** Off-Topic / Resources (check current options)

```
Title: Built a free browser-based PE/VC/IB simulator — no excel, no signup. Would love feedback from people actually breaking in.

Body:
The thing that drove me crazy: every "learn finance" path leads to a $400 Wall Street Prep course or a janky Excel template from 2014. There's no place to just play with the numbers.

So I built one. It's free, no signup needed, runs in the browser.

What's in it:
- PE: full LBO model with debt schedule + sensitivity grid, fund-level waterfall (European + American), J-curve, DPI/RVPI/TVPI/PME, portfolio construction
- VC: multi-round cap table, SAFEs, option pool math, term sheet builder, deal memo
- IB: DCF + comps + precedents, accretion/dilution, deal score, side-by-side deal compare
- AI tutor that knows what screen you're on (built on Claude)
- Roleplay modes — PE seller, VC founder, IB client — with walk-away thresholds

Link: fundsimulate.com

It's genuinely free. There's no pro tier. I'm not collecting emails. I just want to know:
1. Where does it suck?
2. What model would have actually helped you most when you were prepping?
3. What's broken in the UI?

Roast me.
```

---

## r/PrivateEquity — wait until after r/FinancialCareers performs well. This sub is harder.
**Best time:** Weekday 10am ET. NOT Friday.

```
Title: Free PE waterfall + LBO simulator I've been working on — looking for sharp criticism

Body:
Built this after a few too many calls with juniors who could quote the formula but couldn't walk through a payout schedule.

It models:
- European vs American waterfall, tier by tier (return of capital → hurdle → catch-up → carry split)
- Full LBO with debt schedule, FCF sweep, exit equity, value creation bridge
- DPI/RVPI/TVPI, PME (Long-Nickels), KS-PME, quartile bucketing
- Fund lifecycle with proper fee math (the closed-form, not the circular-estimate version)
- Bull/base/bear scenario overlays

fundsimulate.com

I'm not selling anything. Looking for: where's the math wrong, what's missing, what's a real-world quirk I've glossed over. Particularly interested in feedback on the waterfall implementation — got the catch-up tier to behave correctly under partial catch-up but want a second pair of eyes.
```

---

## r/venturecapital — focus on cap table + term sheet builder

```
Title: Free cap table + term sheet sim — multi-round dilution with SAFEs and option pool shuffle

Body:
Built a browser cap table simulator for founders / aspiring VCs that does the stuff most free tools skip:

- Multi-round dilution with proper post-money math
- SAFE conversion at cap and discount, including stacked SAFEs at different caps
- Option pool refresh in the pre-money (the part that quietly costs founders 5-8%)
- Term sheet builder: liq prefs, participation, anti-dilution (broad-based weighted avg, full ratchet), board seats, pro rata
- Exit waterfall for founders, employees, each investor cohort

fundsimulate.com/#vc

Free, no signup, runs locally. Looking for feedback specifically on the anti-dilution math and whether the SAFE stacking math handles pre/post-money SAFEs the way YC documents it.
```

---

## r/SecurityAnalysis — academic tone

```
Title: Free interactive PE performance metrics calculator (PME, KS-PME, IRR, sensitivity)

Body:
For anyone studying alternative investments or working through Kaplan-Schoar style PE performance literature: built a free interactive calculator that takes a fund's cash flow stream and computes:

- IRR (Newton-Raphson with multiple-root warnings)
- DPI / RVPI / TVPI
- PME (Long-Nickels)
- KS-PME (Kaplan-Schoar)
- Quartile bucketing against a benchmark
- Full sensitivity matrix on exit multiple × loss ratio

fundsimulate.com/#pe → performance tab

Open to suggestions on additional benchmark methodologies worth implementing.
```

---

## r/CFA — performance metrics angle

```
Title: Free interactive PE/VC performance metrics calculator — useful for L2/L3 alt investments

Body:
For L2 candidates working through the Alternative Investments readings — built a free interactive tool that lets you actually compute the things the curriculum quizzes you on:

- TVPI / DPI / RVPI
- IRR vs MOIC tradeoffs
- PME (Long-Nickels) and KS-PME
- J-curve dynamics with adjustable fee drag
- Hurdle rate + catch-up + carry mechanics

Drag inputs, see metrics shift. Better than the static examples in the Kaplan books, in my opinion.

fundsimulate.com
```

---

## r/DECA — this sub is small but the audience is exact

```
Title: Free 15-step financial plan generator for PFL / FOR / FORI events

Body:
Built this for anyone doing a finance event that requires a written financial plan. Walks through:

1. Business overview → 2. Assumptions → 3. Startup costs → 4. Income statement → 5. Cash flow → 6. Balance sheet → 7. 3-year plan → 8. Capital needs → 9. Break-even → 10. Sensitivity → 11. Implementation budget → 12. International finance → 13. Current financials → 14. Risk → 15. Review/Print

Print-ready. Maps to the official rubric. Free.

fundsimulate.com/#deca

Lmk what's missing for the event you're competing in and I'll add it.
```

---

## r/Entrepreneur — focus on cap table for founders

```
Title: Free cap table simulator — finally see what you'll actually own after 4 rounds

Body:
Most founders I know can quote their post-money but can't tell you their ownership at exit. The math is doable but it's tedious enough that everyone just trusts the lawyer's spreadsheet.

Made a free browser cap table sim:
- Pre-seed → Series C with proper dilution
- SAFE conversion (including stacked SAFEs)
- Option pool refresh (the sneaky one in the pre-money)
- Liq prefs at exit (1x non-participating, 2x participating, etc.)
- Founder + employee + investor split at any exit valuation

fundsimulate.com/#vc

Free. No signup. The math is the same math your lawyer is doing, just visible.
```

---

## r/wallstreetbets — DO NOT POST DIRECTLY. WSB hates self-promo and will eat you alive. Skip this sub.

---

## r/financialindependence, r/personalfinance — DO NOT POST. Wrong audience, will be removed.

---

## Reply playbook
Top comment archetypes you'll see and how to handle them:

- **"Why is this free?"** → "Because I built it to learn, and shipping it for free gets me better feedback than charging would. I might add a pro tier eventually but the core sim stays free."
- **"Have you seen [competitor]?"** → "Yeah, [honest comparison]. The reason I built this is [specific gap]."
- **"Bug: X happens when Y"** → Reproduce, fix, ship within 24h, reply with "fixed, thanks." This single behavior wins more Reddit love than any post you'll write.
- **"This is just a slick UI on top of basic formulas"** → "Pretty much. The point is the formulas being live and the inputs being draggable, not the formulas being secret."
