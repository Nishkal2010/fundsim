# FundSim

A professional finance simulator for Private Equity, Venture Capital, and Investment Banking. Built for students, analysts, and anyone who wants to understand how institutional finance actually works — with real formulas, real mechanics, and real depth.

## What It Does

**Private Equity Simulator** — Model a buyout fund end-to-end: capital calls, J-curve, waterfall distributions (European & American), performance metrics (DPI/TVPI/IRR/PME), LBO modeling, GP/LP economics, and debt structure.

**Venture Capital Simulator** — Simulate the full venture cycle: cap table dilution across rounds, SAFE note conversion mechanics, portfolio construction with power law returns, and term sheet provisions (liquidation preferences, anti-dilution, pro-rata rights).

**Investment Banking Simulator** — Run an M&A deal from pitch to close: DCF, comps, precedents, football field valuation, offer structure, accretion/dilution with synergies, and a 100-point deal score rubric.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion
- **Auth:** Supabase (Google OAuth + email/password demo mode)
- **Storage:** Supabase — fund model inputs are saved per user
- **Deployment:** Vercel

## Development

```bash
npm install
npm run dev      # starts Vite dev server on :5200
npm run build    # tsc + vite build
npm run lint     # eslint src/
```

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Architecture

All financial computation is client-side. The server is auth-only (Supabase). Simulation state flows through React Context via `useFundModelState` — four `useMemo` calls recalculate lifecycle, J-curve, waterfall, and performance on every input change.

The math engine has 55 passing unit tests: `node src/utils/__tests__/engine.test.mjs`

## Finance Modules

| Module                 | Covers                                                  |
| ---------------------- | ------------------------------------------------------- |
| Fund Lifecycle         | Capital calls, management fee drag, deployment schedule |
| J-Curve                | Year-by-year NAV, trough, breakeven, net IRR            |
| Waterfall              | European & American distribution tiers                  |
| Performance            | DPI, RVPI, TVPI, MOIC, PME vs S&P 500                   |
| LBO Model              | Debt schedule, returns analysis                         |
| GP/LP Economics        | Carried interest, fee structures                        |
| Debt Structure         | Tranches, DSCR, covenants                               |
| Sector Benchmarks      | Value creation bridge                                   |
| Cap Table              | Dilution across all rounds                              |
| SAFE Notes             | Pre/post-money cap, discount, MFN conversions           |
| Portfolio Construction | Power law returns, reserve strategy                     |
| Term Sheet             | Liquidation preferences, anti-dilution, pro-rata        |
