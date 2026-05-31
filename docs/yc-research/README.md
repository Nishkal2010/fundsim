# FundSim Next-Product Research — Index

**Founder:** Solo technical founder of FundSim (fundsimulate.com) — browser-native PE/VC/IB deal simulator with a deterministic finance calc engine (LBO, waterfall, DCF, cap tables, IRR, J-curve), a Claude AI layer (FinFox), React/Vite/TS, Supabase, Vercel, and Financial Modeling Prep (FMP) MCP.
**Date:** May 2026.
**Purpose:** Choose and build ONE of three larger finance products next. The founder handles UI; every BUILD PROMPT focuses on the CORE (engine, data, AI agents, integrations, defensibility), not UI/design.

---

## The 3 Picks and How Each Maps to FundSim

1. **AI-Native FP&A / financial-modeling platform** (YC idea #11) → maps via FundSim's **DCF/scenario engine + Excel export + education-to-professional distribution** (finance students → economic buyers). Reuse score 7/10. The AI tutor ("explain this DCF") becomes the AI analyst ("explain this variance"). See `01-ai-native-fpa.md` → `PROMPT-1-ai-native-fpa.md`.

2. **AI-Native Fund Administration (Service-as-Software)** (YC idea #2) → maps via FundSim's **`waterfall.ts`, `fundLifecycle.ts`, `jCurve.ts`, `irr.ts`, `performance.ts` — the EXACT production artifacts a fund admin needs.** Reuse score 10/10. Not an analogy — direct technical reuse. See `02-ai-native-finance-service.md` → `PROMPT-2-finance-service.md`.

3. **AI CFO / Autonomous Finance OS** (YC idea #15) → maps via the **entire calc engine + FMP market data + FinFox** as the "system of intelligence"/decision-simulation layer everyone else is missing (they build the recording layer). Reuse score 6/10. See `03-ai-cfo-os.md` → `PROMPT-3-ai-cfo-os.md`.

---

## Cross-Cutting Final Ranking (from `00-cross-cutting.md`)

Scoring matrix totals (1–10 across time-to-revenue, asset reuse, defensibility, TAM, founder-market fit, AI leverage, regulatory burden, competition intensity, bootstrappability):

| Rank | Idea | Score | Role |
|---|---|---|---|
| **#1** | **Fund Administration (Idea 2)** | **65** | **THE RECOMMENDATION — build now** |
| #2 | FP&A (Idea 1) | 62 | Safe wedge (needs a sharp niche) |
| #3 | AI CFO OS (Idea 3) | 53 | Big swing (3–5 yr; capital-intensive) |

- **#1 RECOMMENDATION: AI-Native Fund Administration for emerging PE/VC managers (sub-$500M AUM).** Why it wins: FundSim's waterfall/J-curve/IRR engine is the exact artifact needed (no competitor starting today has it); genuine white space (no well-funded AI-native pure-play targets emerging managers — Decile is a services firm, Carta has reputational damage); high LTV/low churn (7–10yr funds, $105–300K LTV); lower competition intensity than FP&A; service-as-software pricing captures more value. **Path:** 3–5 emerging VC funds (tap FundSim's now-associate alumni) → $2K/mo each → SOC 2 Type I → 10 funds → raise.
- **SAFE WEDGE: FP&A (Idea 1)** — only with a sharp niche (e.g., "FP&A for SaaS startups" then "for PE-backed portfolio companies"). Lower regulatory burden, faster to revenue, clearer buyer; but crowded (Aleph, Concourse, Pigment, Cube, Datarails, Abacum).
- **BIG SWING: AI CFO OS (Idea 3)** — largest TAM, weakest distribution from FundSim, most capital-intensive. The dossier's honest verdict: full OS solo is a strategic mistake; build a focused wedge (rev-rec automation or financial scenario simulation). Natural 3–5yr expansion of Idea 2 once you have 50+ funds and $2M+ ARR.

**Decision framework:** NOW (0–12mo) → Idea 2. SAFE WEDGE → Idea 1 with a niche. BIG SWING (3–5yr) → Idea 3.

**Shared architecture across all three:** "LLM proposes, deterministic engine computes & verifies" — Claude handles intent/extraction/explanation via structured `tool_use`; the pure-TS engine does every number (unit-tested, audited); numbers never pass through an LLM as free text; immutable audit log on every step; staged autonomy with human-in-the-loop for irreversible financial actions. Proprietary evals (golden datasets seeded from FundSim's `src/utils/__tests__/`) are the deepest moat. SOC 2 Type II + audit trails are the procurement moat.

---

## Files

**Research dossiers:**
- [`00-cross-cutting.md`](./00-cross-cutting.md) — founder's edge, AI architecture, integrations, compliance, defensibility, business model, final ranking
- [`01-ai-native-fpa.md`](./01-ai-native-fpa.md) — AI-native FP&A (idea #11)
- [`02-ai-native-finance-service.md`](./02-ai-native-finance-service.md) — finance service-as-software (idea #2)
- [`03-ai-cfo-os.md`](./03-ai-cfo-os.md) — AI CFO / autonomous finance OS (idea #15)

**Build prompts (hand to a coding agent or use as master specs):**
- [`PROMPT-1-ai-native-fpa.md`](./PROMPT-1-ai-native-fpa.md) — FP&A core build spec
- [`PROMPT-2-finance-service.md`](./PROMPT-2-finance-service.md) — Fund Admin core build spec **(START HERE — #1 pick)**
- [`PROMPT-3-ai-cfo-os.md`](./PROMPT-3-ai-cfo-os.md) — AI CFO OS core build spec

Each PROMPT contains: thesis + wedge; state of space + why now; competitive landscape + biggest threat; transformation thesis + FundSim advantage; core product spec (data model, deterministic engine, agent architecture, evals/guardrails, audit/permissions); data & integrations with gotchas; defensibility & moat; GTM & pricing + unit economics; v0→v1→v2 milestones; risks & mitigations; open questions.
