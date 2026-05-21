# Changelog

All notable changes to FundSim are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — Overnight Swarm (2026-05-20)

Commits: `c2a2d47` `c79cf16` `b298e66` `9c5b1e7` `628e1df`

### Added

**Infrastructure & Observability**

- `src/lib/storage.ts`: `safeStorageGet/Set/Remove` — safe `localStorage` wrappers that fail silently in private/incognito mode; all storage calls now route through these
- `src/lib/posthog.ts`: PostHog analytics integration with GDPR consent gate and single-init guard; `VITE_POSTHOG_KEY` env var required
- `src/lib/sentry.ts`: `initSentry()` extracted into its own module, called from `main.tsx` on boot
- `src/hooks/useHash.ts`: `useHash()` — reactive hook tracking `window.location.hash` changes
- `posthog-js` npm dependency
- `.github/workflows/bundle-size.yml`: CI action that builds on every push, reports per-chunk gzip sizes to the job summary, and fails if any JS chunk exceeds 1 MB gzipped

**Tests**

- `src/test/portfolio.test.ts`: 21 unit tests covering `calculatePortfolio` — TVPI invariant, MOIC bucket boundaries, determinism across re-runs, strategy-stage logic; suite now at 201 passing (was 180)

**Deal Presets**

- `src/data/scenarios.ts`: 3 new presets — Healthcare Platform (3.2x, buy-and-build), Software Growth Equity (4.5x, American waterfall), Distressed & Turnaround (2.0x, 2.5 yr hold)

**PostHog**

- Student Activation Funnel and Simulator Opens by Type insights created in PostHog project
- Feature flags created: `show-deal-presets`, `finfox-proactive`

**Docs & Content**

- `docs/finfox-seeds.md`: 30 educational Q&A pairs (10 PE, 10 VC, 10 IB) with concrete numbers for FinFox fine-tuning/seeding
- `docs/deal-presets.json`: 5 deal scenario objects for future tooling
- `docs/blog/why-fundsim.md`: 586-word blog post draft
- `docs/blog/lbo-explained.md`: 554-word LBO explainer with worked example
- `docs/outreach/club-vp-email.md`, `professor-email.md`, `club-drip-sequence.md`: outreach templates
- `docs/social/twitter-threads.md`: 3 complete X/Twitter thread drafts
- `docs/social/faq-content.md`: 12-question FAQ for the website
- `docs/research/competitive-analysis.md`: comparative analysis of WSP, BIWS, CFI, FinanceQuest, AmplifyME
- `docs/ops/env-vars-needed.md`: Vercel checklist for `VITE_POSTHOG_KEY` and `VITE_SENTRY_DSN`
- `README.md`: complete rewrite — tagline, feature list, tech stack, dev setup

### Changed

**Anonymous User Experience**

- `src/hooks/useFundModel.ts`: anon users now auto-save simulator inputs to `localStorage` (800 ms debounce) and restore on page load; anon data is cleared on successful login

**Accessibility**

- `src/components/Header.tsx`: replace manual `hashchange` listener with `useHash()`; add `aria-expanded`, `aria-haspopup`, `role="menu"/"menuitem"` on FinFox dropdown; `aria-label="Sign out"` on logout button
- `src/components/FinFox/FinFoxMascot.tsx`: add `aria-label="Open FinFox AI tutor"`

**Storage migration to `safeStorage*`**

- `src/lib/analytics.ts`
- `src/lib/posthog.ts`
- `src/components/FinFox/FinFoxProvider.tsx`
- `src/components/OnboardingTour.tsx`
- `src/utils/finfoxApi.ts` (cache + rate-limit storage)
- `src/components/YIS/YISFinanceSuite.tsx` (checklist storage)

**Analytics**

- `src/App.tsx`: `captureEvent` calls added on sim, compare, and scenarios hash changes
