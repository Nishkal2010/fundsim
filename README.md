# FundSim

**The free PE/VC/IB deal simulator for finance students**

Run a leveraged buyout, build a cap table, or score an M&A deal — entirely in the browser, no Excel required, no paywall.

Live at [fundsimulate.com](https://fundsimulate.com)

---

## What it is

FundSim is a browser-native deal simulator covering the three major verticals of institutional finance:

- **Private Equity** — model a fund end-to-end with real GP/LP economics and waterfall math
- **Venture Capital** — simulate dilution, SAFE conversions, and portfolio power-law returns
- **Investment Banking** — run an M&A deal from pitch to close with a 100-point deal score

Everything computes live as you change inputs. No downloads, no installs, no account required to explore.

---

## Features

- **PE Simulator** — capital calls, J-curve, European & American waterfalls, DPI/TVPI/IRR/PME, LBO modeling, debt tranches, DSCR, and GP/LP carried interest mechanics
- **VC Cap Table** — round-by-round dilution, SAFE note conversion (pre/post-money cap, discount, MFN), liquidation preferences, anti-dilution, pro-rata rights, and power-law portfolio construction
- **IB Deal Mechanics** — DCF, trading comps, precedent transactions, football field valuation, accretion/dilution with synergies, and a 100-point deal score rubric
- **FinFox AI Tutor** — ask questions about any number on screen; the AI explains the formula, the convention, and the real-world context (powered by Anthropic Claude)
- **8 Deal Presets** — load a realistic PE buyout, growth-equity round, or M&A scenario in one click to explore before building your own
- **DECA Prep Mode** — preset scenarios and scoring tuned for DECA Finance/Investments event preparation
- **Shareable Deals** — generate a link to share your exact deal state with a professor, recruiter, or peer; no account required to view

---

## Tech stack

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 18 + Vite + TypeScript, Tailwind CSS, Recharts, Framer Motion |
| Auth       | Supabase (Google OAuth + email/password)                            |
| Storage    | Supabase — fund models saved per user, deal shares as JSONB         |
| AI         | Anthropic Claude via Vercel serverless (`api/chat.ts`)              |
| Deployment | Vercel (production branch: `main`)                                  |
| Analytics  | PostHog + Sentry                                                    |

All financial computation is client-side. No deal data is sent to a server — only auth and saved model state touch Supabase.

The math engine has 55 passing unit tests: `node src/utils/__tests__/engine.test.mjs`

---

## Getting started

```bash
git clone https://github.com/Nishkal2010/fundsim.git
cd fundsim
npm install
npm run dev        # Vite dev server on :5200
```

Copy `.env.example` to `.env` and fill in the required variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_POSTHOG_KEY=
VITE_SENTRY_DSN=
ANTHROPIC_API_KEY=   # server-only, not VITE_ prefixed
```

The Vite config includes a dev proxy for `/api/*` so the FinFox chatbot works locally without `vercel dev`.

```bash
npm run build      # tsc + vite build
npm run lint       # eslint src/
```

---

## Finance modules

| Module                 | Covers                                                     |
| ---------------------- | ---------------------------------------------------------- |
| Fund Lifecycle         | Capital calls, management fee drag, deployment schedule    |
| J-Curve                | Year-by-year NAV, trough, breakeven, net IRR               |
| Waterfall              | European & American distribution tiers                     |
| Performance            | DPI, RVPI, TVPI, MOIC, PME vs. S&P 500                     |
| LBO Model              | Debt schedule, entry/exit multiples, equity returns        |
| GP/LP Economics        | Carried interest, hurdle rate, fee structures              |
| Debt Structure         | Senior/mezzanine tranches, DSCR, covenants                 |
| Sector Benchmarks      | Value creation bridge                                      |
| Cap Table              | Dilution across seed, Series A–D, and secondary rounds     |
| SAFE Notes             | Pre/post-money cap, discount rate, MFN conversions         |
| Portfolio Construction | Power-law return distribution, reserve strategy            |
| Term Sheet             | Liquidation preferences, anti-dilution, pro-rata rights    |
| IB Valuation           | DCF, trading comps, precedent transactions, football field |
| M&A Deal Score         | 100-point rubric across structure, price, and execution    |

---

## Contributing

FundSim is a solo project. If you spot a math error, a broken scenario, or want to suggest a feature, open an issue or email nishkal.dachepelly@gmail.com.

Pull requests are welcome for:

- Fixing financial formula bugs (cite the source convention, e.g. ILPA, NVCA)
- Adding new preset deal scenarios
- UI/UX improvements that don't balloon bundle size

Please don't open PRs that add new dependencies without discussion first.

---

## License

MIT
