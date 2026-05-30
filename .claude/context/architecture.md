# FundSim Architecture — Machine-Readable Facts

> Agent-queryable fact sheet for FundSim. Tables over prose. Every row was verified
> against the live repo. Sibling context: [`../../COMPANY.md`](../../COMPANY.md)
> (single source of truth) and [`../../docs/AI-NATIVE-OPERATING-SYSTEM.md`](../../docs/AI-NATIVE-OPERATING-SYSTEM.md)
> (the roadmap this file serves). Stack: React 19 + Vite 8 + TypeScript SPA, dev
> port 5200, deployed to Vercel; Supabase auth/db; one Anthropic-backed endpoint.
> Founder-owned (do not auto-edit): `api/*`, `src/*`, `vercel.json`, CI config.

## Serverless routes (`api/*.ts`)

All handlers are classic `(req, res)` Node functions (`export default async function handler`).
`vercel.json` declares **no per-function runtime block**, so every route runs on
Vercel's default **Node** runtime. Only `api/og.ts` has a function config
(`includeFiles: "api/_assets/**"`). Rate limits are in-process per-IP token buckets
(reset on cold start), not durable.

| Route                    | Runtime                                                                        | Auth / origin lock                                                                                   | Rate limit                                              | Purpose                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/chat.ts`            | Node                                                                           | Origin allowlist + `.vercel.app` suffix containing `fundsim`; rejects unknown origin; POST only      | 20 req / 60s per IP; `breakdown` mode capped at 5 / 60s | FinFox educational assistant. Server-built per-`mode` system prompt prefixed with a hard guardrail; modes gate output token cap and what client may inject (`breakdown` = structured, no client `systemPrompt`; roleplay modes accept scenario) |
| `api/create-checkout.ts` | Node                                                                           | Origin allowlist + `.vercel.app` suffix; POST only; success/cancel URLs hardcoded (no open redirect) | none                                                    | Creates a Stripe Checkout session in `subscription` mode from `STRIPE_PRICE_ID` (FundSim Pro upgrade)                                                                                                                                           |
| `api/stripe-webhook.ts`  | Node (`config = { api: { bodyParser: false } }` for raw-body signature verify) | Stripe signature via `STRIPE_WEBHOOK_SECRET`; POST only                                              | none                                                    | Flips `profiles.is_pro` on subscription events using the Supabase service-role key (sets true on activation, false when subscription ends)                                                                                                      |
| `api/share-create.ts`    | Node                                                                           | Origin allowlist + `fundsim`-prefixed `.vercel.app` regex; POST only                                 | yes — per-IP bucket, returns 429 on exceed              | Inserts a `deal_shares` row using the service-role key (the only legit insert path since anon-insert was closed); computes `percentile_band` on write                                                                                           |
| `api/share-meta.ts`      | Node                                                                           | none (public; serves crawler meta)                                                                   | none                                                    | Server-rendered OG/Twitter meta tags for `/s/:id` share links; points crawlers at `/api/og?id=` and humans at `/?share=`                                                                                                                        |
| `api/og.ts`              | Node (only route with `includeFiles: api/_assets/**`)                          | none (public; crawler image)                                                                         | none                                                    | Generates the OG share image via `satori` (JSX→SVG) + `@resvg/resvg-js` (SVG→PNG), pure-JS so it builds on Node (edge build failed)                                                                                                             |
| `api/health.ts`          | Node                                                                           | Same-origin / no-origin / `fundsim` `.vercel.app` / localhost only                                   | none                                                    | Health probe (mirrors `/api/chat` origin posture); reports commit SHA + region                                                                                                                                                                  |

Routing rewrites (`vercel.json`): `/s/:id` → `/api/share-meta?id=:id`; all non-`/api/`
paths → `/index.html` (SPA fallback). Global security headers (CSP, HSTS,
`X-Frame-Options: DENY`, etc.) are set in `vercel.json`.

## Finance engines (`src/utils/*.ts`)

"Covered" = a vitest spec exercises the engine's exported calc function. Two test
roots exist: `src/test/` and `src/utils/__tests__/` (plus a raw `src/utils/__tests__/engine.test.mjs`).

| File                         | Exported function(s)                                                                                                         | Test file(s)                                                                  | Covered |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------- |
| `src/utils/waterfall.ts`     | `calculateWaterfall(inputs)`                                                                                                 | `src/test/waterfall.test.ts`, `src/utils/__tests__/waterfall.test.ts`         | y       |
| `src/utils/jCurve.ts`        | `calculateJCurve(inputs)`                                                                                                    | `src/test/jCurve.test.ts`, `src/utils/__tests__/jCurve.test.ts`               | y       |
| `src/utils/irr.ts`           | `calculateIRR(...)`                                                                                                          | `src/test/irr.test.ts`, `src/utils/__tests__/irr.test.ts`                     | y       |
| `src/utils/performance.ts`   | `calculatePerformance(inputs)`                                                                                               | `src/utils/__tests__/performance.test.ts`                                     | y       |
| `src/utils/fundLifecycle.ts` | `calculateLifecycle(inputs)`                                                                                                 | `src/test/fundLifecycle.test.ts`, `src/utils/__tests__/fundLifecycle.test.ts` | y       |
| `src/utils/vcRound.ts`       | `calculateVCCapTable(state)` + `DEFAULT_VC_ROUNDS`, `DEFAULT_VC_FOUNDER_SHARES`, `DEFAULT_ESOP_FOUNDING_PCT`, `VCInputState` | `src/test/vcRound.test.ts`, `src/utils/__tests__/vcRound.test.ts`             | y       |
| `src/utils/lbo.ts`           | `calculateLBO(inputs)`                                                                                                       | `src/test/lbo.test.ts`                                                        | y       |
| `src/utils/portfolio.ts`     | `calculatePortfolio(inputs)`                                                                                                 | `src/test/portfolio.test.ts`                                                  | y       |
| `src/utils/marketSizing.ts`  | `calculateMarketSizing(...)` + `DEFAULT_MARKET_SIZING_INPUTS`, types                                                         | none                                                                          | n       |
| `src/utils/qualitative.ts`   | `calculatePayne(...)`, `calculateBerkus(...)`, `calculateFounderDNA(...)` + default dimension/factor sets                    | none                                                                          | n       |
| `src/utils/finfoxApi.ts`     | `callFinFox(...)`, `coerceScreen`, cache + query-count helpers, `seedCache`, `FINFOX_ALLOWED_SCREENS`, types                 | none                                                                          | n       |
| `src/utils/csvExport.ts`     | `downloadCSV`, `fmtUSD/fmtPct/fmtMultiple`, row builders (`section`, `item`, `subtotal`, `grandTotal`, …)                    | none                                                                          | n       |
| `src/utils/formatting.ts`    | `formatMillions`, `formatPercent`, `formatMultiple`, `formatIRR`, `formatDollar`                                             | `src/utils/__tests__/formatting.test.ts`                                      | y       |

Coverage gap (factory target per roadmap §3/§6): `marketSizing`, `qualitative`
(Payne/Berkus/FounderDNA), and `finfoxApi` ship without golden-file numeric tests.

## Environment-variable contract (names only — values REDACTED)

`VITE_`-prefixed vars are bundled into the client and are public; non-`VITE_` vars
are server-only (Vercel env + gitignored local `.env`). Note the Supabase-touching
routes read the URL as a `SUPABASE_URL` / `VITE_SUPABASE_URL` fallback pair
(`og.ts` tries both; `share-create.ts` reads `SUPABASE_URL`, `stripe-webhook.ts`
and `create-checkout.ts` read `VITE_SUPABASE_URL`), and `og.ts` / `create-checkout.ts`
/ `health.ts` read `VITE_SUPABASE_ANON_KEY` server-side. `chat.ts` reads only
`ANTHROPIC_API_KEY`.

| Var                                | `VITE_` public? | Server-only            | Purpose                                                                     |
| ---------------------------------- | --------------- | ---------------------- | --------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`                | yes             | no                     | Supabase project URL (client)                                               |
| `VITE_SUPABASE_ANON_KEY`           | yes             | no                     | Supabase anon key (client; RLS-bounded)                                     |
| `VITE_POSTHOG_KEY`                 | yes             | no                     | PostHog project key (client analytics)                                      |
| `VITE_SENTRY_DSN`                  | yes             | no                     | Sentry DSN (client error tracking)                                          |
| `ANTHROPIC_API_KEY`                | no              | yes                    | Anthropic key for `api/chat.ts` (FinFox)                                    |
| `STRIPE_SECRET_KEY`                | no              | yes                    | Stripe API key for checkout + webhook                                       |
| `STRIPE_PRICE_ID`                  | no              | yes                    | Stripe price for the Pro subscription                                       |
| `STRIPE_WEBHOOK_SECRET`            | no              | yes                    | Verifies `stripe-webhook.ts` signatures                                     |
| `SUPABASE_URL`                     | no              | yes                    | Supabase URL (server: webhook + share-create)                               |
| `SUPABASE_SERVICE_ROLE_KEY`        | no              | yes                    | Service-role key — bypasses RLS for `is_pro` writes + `deal_shares` inserts |
| `VERCEL_GIT_COMMIT_SHA`            | no              | yes (Vercel-injected)  | Reported by `health.ts`                                                     |
| `VERCEL_REGION`                    | no              | yes (Vercel-injected)  | Reported by `health.ts`                                                     |
| `NODE_ENV`                         | no              | yes (runtime-injected) | Standard runtime env flag                                                   |
| `MODE` / `DEV` (`import.meta.env`) | yes             | no                     | Vite build-mode flags (client)                                              |

## Build / test / lint scripts (`package.json`)

| Script          | Command                 | Purpose                                                                                                  |
| --------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `dev`           | `vite`                  | Dev server on port 5200 (Vite config has a dev plugin proxying `/api/*` for FinFox without `vercel dev`) |
| `build`         | `tsc -b && vite build`  | Type-check then production bundle to `dist/` (Vercel `buildCommand`)                                     |
| `preview`       | `vite preview`          | Serve the built `dist/` locally                                                                          |
| `lint`          | `eslint src/`           | Lint the `src/` tree                                                                                     |
| `test`          | `vitest run`            | Run all vitest suites once                                                                               |
| `test:watch`    | `vitest`                | Vitest watch mode                                                                                        |
| `test:coverage` | `vitest run --coverage` | Coverage report (`@vitest/coverage-v8` installed)                                                        |

No CI coverage gate is wired today (roadmap §6 founder rec). Test env: `jsdom`,
`@testing-library/*`, setup at `src/test/setup.ts`.

## Supabase tables (RLS + key columns)

`profiles` is a pre-existing auth-linked table; migrations only **add** the `is_pro`
column to it (no `create table profiles` exists in `supabase/migrations/`).

| Table         | RLS                                                                                                      | Key columns / notes                                                                                                                                                                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`    | yes (pre-existing; keyed to `auth.uid()`)                                                                | `is_pro boolean not null default false` (added `20260510`); partial index `where is_pro = true`. Flipped only by `stripe-webhook.ts` via service role                                                                                                                                                                                 |
| `fund_models` | yes — select/insert/update/delete all scoped to `auth.uid() = user_id`                                   | `id uuid pk`, `user_id uuid -> auth.users(id) on delete cascade`, `data jsonb`, `created_at`, `updated_at` (created `20260513`)                                                                                                                                                                                                       |
| `deal_shares` | yes — public anon SELECT; INSERT service-role only (anon-insert closed `20260521`, `with check (false)`) | `id uuid pk`, `simulator text check in ('pe','vc','ib')`, `tab text`, `inputs jsonb`, `summary jsonb` (JSONB size-capped ~32KB, `20260513`), `percentile_band smallint` (`20260522`), `created_at` (indexed `20260521`). `cleanup_old_deal_shares()` deletes rows >90 days (SECURITY DEFINER; must be scheduled manually via pg_cron) |

Migration order: `20260430_deal_shares` → `20260510_profiles_is_pro` →
`20260513_security_hardening` (fund_models + JSONB caps) → `20260521_deal_shares_throttle`
(TTL + close anon insert) → `20260522_deal_shares_percentile`.

## Component tree (`src/components/`)

Simulator modules (each a directory): `LBO`, `DCF`, `VC`, `Waterfall`, `JCurve`,
`FundLifecycle`, `IB` (with `tabs/`, `shared/`), `PE`, `Portfolio`, `Performance`,
`YIS`, `PathFlow`. Gamification/growth: `DealChallenge`, `Leaderboard`, `DECA`
(with `steps/`, `config/`, `validation/`, `utils/`, `types/`). Monetization + lead
loops: `ProGate.tsx`, `EmailCapture/`, `ShareButton.tsx`, `ShareView.tsx`,
`SharedScenarioBanner.tsx`, `PESharePanel.tsx`. Assistant: `FinFox/`. Shell/chrome:
`Header.tsx`, `Hero.tsx`, `Footer.tsx`, `SimulatorSelector.tsx`, `TabBar.tsx`,
`GlobalInputs.tsx`, `Glossary.tsx`, `OnboardingTour.tsx`, error boundaries
(`AppErrorBoundary.tsx`, `TabErrorBoundary.tsx`), compare views (`ComparePage.tsx`,
`ComparePanel.tsx`), `Scenarios/`, `ScenarioPresets.tsx`.
