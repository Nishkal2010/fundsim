# COMPANY.md — FundSim

> The single queryable source of truth. A cold agent reads this first, then drills into the linked docs. Every fact here is grounded in the live repo as of May 2026. When code and this file disagree, the code wins — fix this file.

**Map of the system (read these next as needed):**

- `docs/AI-NATIVE-OPERATING-SYSTEM.md` — the operating-model roadmap and the principle scorecard this doc serves.
- `.claude/context/architecture.md` — schema, routes, and env contract as tables (machine-friendly companion to this file).
- `CODEBASE.md` — auto-generated structure doc. **Stale** (generated 2026-04-07, pre-Supabase migration; it still describes an Express/Passport auth server and claims "no tests" — both wrong now). Trust this file and the code over it.
- `PRODUCT_STRATEGY.md` — positioning, monetization tiers, growth loops, 18-month roadmap.
- `README.md` — public-facing product description and local-dev setup.
- `market_opportunity_analysis.md`, `research_fundsim_feature_requirements.md`, `viral_finance_content_strategy.md` — supporting research.
- `docs/OVERNIGHT_AGENT.md`, `docs/finfox-seeds.md` — ops and FinFox chatbot seeds.

---

## 1. What is FundSim

FundSim (`fundsimulate.com`) is a browser-native **deal simulator** for the three verticals of institutional finance — Private Equity, Venture Capital, and Investment Banking. Users run a leveraged buyout, build a VC cap table with SAFE conversions, or score an M&A deal end-to-end, with every output recomputing live as inputs change. No Excel, no install, no account required to explore.

**Positioning** (per `PRODUCT_STRATEGY.md`): the "practice layer" that sits on top of the instruction layer incumbents (Wall Street Prep, BIWS, CFI) sell. They sell knowledge you consume; FundSim is the environment where you apply it. The one-line message: _"You've watched the videos. Now run the deal."_

**Tech shape:** React 19 + Vite + TypeScript single-page app on Vercel. Supabase for auth + persistence. All finance computation runs client-side in `src/utils/`. A small set of Vercel serverless functions in `api/` handle the things that can't run in the browser (AI chat, billing, share links, OG images, health). Dev server runs on **port 5200**.

## 2. Who is the user — and who is the buyer

**User (free):** finance students and early-career professionals prepping for technical interviews and modeling tests. They run deals, share results, and convert to Pro for the interview-artifact features.

**Buyer (the money is institutional, B2B2C):**

- **VP of Education / club leadership** at university finance & IB clubs — runs co-branded Deal Challenges and leaderboards. Fastest decision cycle; lead here. ($500–$1,500/yr per club.)
- **Professors** teaching Corporate Finance / PE / VC / M&A — assign FundSim as the lab component of a course. ($3,000–$8,000/yr per department.)
- **DECA / FBLA advisors** and case-competition organizers — feeder pipeline for high-school and early-college finance competitions.
- **Corporate training** (boutique banks, mid-market PE) — 18-month+ play, not the current focus.

The strategic sequence: free core → club flywheel → professor cohorts → university licensing → corporate. Do not lead with individual subscriptions.

## 3. Product surface — by component

Simulators live under `src/components/`, selected via `SimulatorSelector.tsx`. Each finance engine is a pure module in `src/utils/` with a vitest suite.

**Simulators (the three verticals):**

- **PE** (`components/PE/`, `components/FundLifecycle/`, `components/JCurve/`, `components/Waterfall/`, `components/Performance/`) — full fund model: capital calls and fee step-down (`fundLifecycle.ts`), J-curve trajectory (`jCurve.ts`), European/American 4-tier waterfall (`waterfall.ts`), DPI/RVPI/TVPI/MOIC/PME/IRR performance (`performance.ts`, `irr.ts`), and `portfolio.ts` for power-law portfolio construction.
- **VC** (`components/VC/`) — round-by-round dilution, SAFE conversion (pre/post-money cap, discount, MFN), liquidation preferences, anti-dilution, pro-rata (`vcRound.ts`).
- **IB** (`components/IB/IBSimulator.tsx`) — M&A deal from pitch to close with a 100-point deal score. Also `marketSizing.ts`, `qualitative.ts`.
- Supporting verticals/views: `LBO/`, `DCF/`, `PathFlow/`, `Scenarios/`, `ComparePage.tsx` / `ComparePanel.tsx` (multi-case comparison).

**Gamification (the club flywheel):**

- `components/DealChallenge/` — sealed-bid deal competitions.
- `components/Leaderboard/` — ranks deals (reads `deal_shares`, incl. percentile band).
- `components/DECA/`, `components/YIS/` — competition-pipeline framings.

**Monetization & lead loops:**

- `components/ProGate.tsx` + `src/lib/useProStatus.ts` — the Pro paywall gate (reads `profiles.is_pro`).
- `components/ShareButton.tsx` / `components/ShareView.tsx` / `components/SharedScenarioBanner.tsx` + `src/lib/dealShare.ts` — public shareable deal links (the primary viral growth loop).
- `components/EmailCapture/` — lead capture.
- `components/FinFox/` + `src/utils/finfoxApi.ts` — the AI tutor/roleplay chatbot (calls `api/chat.ts`).
- `src/utils/csvExport.ts` — data export.
- Onboarding/UX: `OnboardingTour.tsx` (driver.js), `KeyboardShortcutsModal.tsx`, error boundaries (`AppErrorBoundary.tsx`, `TabErrorBoundary.tsx`).

## 4. What is monetized, and how

**Free forever:** all core simulator mechanics. The free tier is the acquisition engine and the social-proof base for institutional deals.

**FundSim Pro** (individual subscription, target ~$149/yr):

- Gate component: `components/ProGate.tsx`; status read by `src/lib/useProStatus.ts` from `profiles.is_pro`.
- Pro value (per strategy): Excel/model download with formula mechanics, unlimited saved scenarios + multi-case comparison, PDF/shareable deal report, interview question bank.
- **Billing path (Stripe):** client calls `api/create-checkout.ts` → Stripe Checkout → on `checkout.session.completed`, Stripe calls `api/stripe-webhook.ts` → webhook flips `profiles.is_pro = true` using the Supabase **service-role key** (bypasses RLS). Optionally `customer.subscription.deleted` downgrades.

**Institutional licensing** (the real revenue, per `PRODUCT_STRATEGY.md`): club licenses, university department licenses, eventually corporate training. Sold as outcomes, not seats. Not yet wired into billing code — currently a sales motion.

## 5. Data model (Supabase)

Defined in `supabase/migrations/`. Three tables matter.

- **`profiles`** — user profile. Key column: **`is_pro boolean not null default false`** (added in `20260510_profiles_is_pro.sql`). Partial index `profiles_is_pro_idx` on pro users. This flag is the entire Pro gate; flipping it is billing-critical.
- **`fund_models`** — saved fund models, one+ per user. Columns: `id`, `user_id` (FK → `auth.users`, cascade delete), `data jsonb`, `created_at`, `updated_at`. **RLS-enforced** (`20260513_security_hardening.sql`): select/insert/update/delete policies all require `auth.uid() = user_id`. A user can only ever touch their own rows. Written by `src/hooks/useFundModel.ts` (debounced save).
- **`deal_shares`** — serialized simulator state behind public share links. Columns: `id`, `simulator` (check: `pe`/`vc`/`ib`), `tab`, `inputs jsonb`, `summary jsonb`, `percentile_band smallint`, `created_at`. RLS: **public SELECT** (anyone can view a shared deal); **INSERT is service-role only** — the original open anon-insert policy was removed in `20260521_deal_shares_throttle.sql` because it was floodable. All inserts now flow through `api/share-create.ts` using the service-role key. JSONB columns are capped at **32 KB** each (`20260513` check constraints). A `cleanup_old_deal_shares()` function deletes rows >90 days old (must be scheduled via pg_cron or run manually — not automatic). `percentile_band` (added `20260522`) powers viral OG-card copy.

## 6. API routes (`api/*.ts` — Vercel serverless)

| Route                    | Purpose                                                                                                                                     | Notes                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/chat.ts`            | Anthropic-backed FinFox chatbot: tutor, roleplay (founder/pe_seller/ib_client), and `breakdown` modes.                                      | Origin-locked, per-mode token caps, strict allowlists for mode/sim/screen, guardrail-prefixed. Only true roleplay modes accept a client `systemPrompt`.                                                                     |
| `api/create-checkout.ts` | Creates a Stripe Checkout session for Pro; returns the URL.                                                                                 | Origin-locked (fundsimulate.com + `*.vercel.app` + localhost:5200). Needs `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`.                                                                                                           |
| `api/stripe-webhook.ts`  | Verifies Stripe signature; on `checkout.session.completed` flips `profiles.is_pro = true`.                                                  | Raw-body parsing (`bodyParser: false`). Needs `STRIPE_WEBHOOK_SECRET`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Billing-critical.                                                                                  |
| `api/share-create.ts`    | The only insert path for `deal_shares`; validates 32 KB payload size, rate-limits per IP, computes percentile, writes via service-role key. | Replaced open anon insert. Sim allowlist `pe`/`vc`/`ib`.                                                                                                                                                                    |
| `api/share-meta.ts`      | Serves static OG-tagged HTML stubs to crawlers (which don't run JS), JS-redirects humans to the SPA.                                        | Node runtime (not edge). Matches crawler UA substrings.                                                                                                                                                                     |
| `api/og.ts`              | Generates personalized `/s/:id` deal-share OG card images via satori (JSX→SVG) + resvg (SVG→PNG).                                           | Node runtime, classic `(req, res)` handler (replaced `@vercel/og`, which failed on edge). Fonts (IBM Plex Sans) bundled from `api/_assets` via `vercel.json` `includeFiles`. Homepage card is static `public/og-image.png`. |
| `api/health.ts`          | Structured health check for the overnight agent / uptime monitors (pings Anthropic + Supabase).                                             | HTTP 200 + body `ok: true` is the only green state.                                                                                                                                                                         |

## 7. Deploy path

- **`main` → Vercel production** (`fundsimulate.com`). Pushing to `main` deploys.
- **Build:** `tsc -b && vite build` → `dist/`. Scripts in `package.json`: `dev` (vite, port 5200), `build`, `lint` (`eslint src/`), `test` (`vitest run`), `test:coverage`.
- `vercel.json` rewrites `/api/*` to serverless functions and everything else to `index.html` (SPA). The Vite dev config proxies `/api/*` locally so FinFox works without `vercel dev`.
- **Founder-owned, do not auto-edit:** `api/*`, `src/*`, `vercel.json`, CI config. Changes to these are recommendations, not edits.

## 8. What must NEVER break

1. **Billing.** `profiles.is_pro` is the entire Pro gate. The flip happens only in `api/stripe-webhook.ts` via the service-role key. Don't change the webhook signature verification, the `is_pro` column, or `useProStatus.ts` without verifying a real checkout end-to-end. A broken webhook means paying users don't get Pro.
2. **Finance-engine numerics.** The modules in `src/utils/` (`waterfall`, `jCurve`, `irr`, `performance`, `fundLifecycle`, `vcRound`, `lbo`, `portfolio`, `marketSizing`) are the product. A silent numeric regression (e.g. IRR Newton-Raphson convergence, waterfall tier math) destroys trust. **Every engine change must ship with its vitest test** — suites live in `src/test/` and `src/utils/__tests__/`. Run `npm test` before shipping. See `.claude/agents/finance-engine-reviewer.md`.
3. **Share links.** Public `deal_shares` SELECT must stay open (links break otherwise) and INSERT must stay service-role-only (anon insert is a flood hole — see `20260521_deal_shares_throttle.sql`). The 32 KB JSONB caps and `api/share-create.ts` as the sole insert path are load-bearing security, not optional.
4. **RLS on `fund_models`.** Every policy requires `auth.uid() = user_id`. Never weaken this — it's the only thing stopping users from reading each other's saved models.
5. **The Anthropic endpoint guardrails.** `api/chat.ts` is origin-locked, rate-limited, token-capped, and allowlist-validated. Don't loosen the mode/sim/screen allowlists or accept a client `systemPrompt` outside roleplay modes — that reopens prompt-injection and cost-abuse vectors.

## 9. Where strategy and memory live

- **Strategy:** `PRODUCT_STRATEGY.md` (positioning, monetization, growth loops, roadmap), `market_opportunity_analysis.md`, `research_fundsim_feature_requirements.md`, `viral_finance_content_strategy.md`.
- **Operating model / agent system:** `docs/AI-NATIVE-OPERATING-SYSTEM.md` (the roadmap this file serves), plus the `.claude/` fleet being seeded — `.claude/agents/finance-engine-reviewer.md`, `.claude/agents/weekly-telemetry-review.md`, `.claude/agents/growth-loop.md`, the `/feature` command at `.claude/commands/feature.md`, and the machine-readable architecture pack at `.claude/context/architecture.md`.
- **Durable memory:** the founder's auto-memory at `~/.claude/projects/-Users-nishkaldachepelly-fundsim/memory/MEMORY.md` indexes the multi-agent system, adoption/comms playbooks, Linear roadmap, and outreach drafts.
- **Telemetry (live, underexploited):** PostHog (`posthog-js`), Sentry (`@sentry/react`), Vercel Analytics (`@vercel/analytics`) are wired in. The closed-loop playbook turning these into named funnels + scheduled review is a roadmap deliverable.
- **Founder:** Nishkal (GitHub `Nishkal2010`, `nishkal.dachepelly@gmail.com`). Solo. Issues/feature requests go to email or GitHub issues.
