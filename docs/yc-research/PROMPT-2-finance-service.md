# BUILD PROMPT 2 — AI-Native Fund Administration (Service-as-Software)

**Source dossier:** `02-ai-native-finance-service.md` (YC idea #2) + `00-cross-cutting.md`
**For:** Solo technical founder, builder of FundSim (fundsimulate.com). You handle UI. This spec is the CORE: engine, data, AI agents, integrations, defensibility.
**Cross-cutting rank: #1 OF 3 — THE RECOMMENDATION.** Strongest FundSim asset reuse (10/10), genuine white space, defensible, founder-market fit. Build this first.

---

## 1. ONE-LINE THESIS + WEDGE

**Thesis:** AI-native fund administration that delivers the OUTCOME (waterfalls computed, LP reports sent, K-1s on time) — not software — for emerging PE/VC managers, where FundSim's tested waterfall engine does every number and Claude drafts, extracts, and explains.

**Wedge (do NOT boil the ocean):**
- **Segment:** **Emerging PE/VC managers, sub-$500M AUM** (sharpest: sub-$100M VC funds, ~1,871 of 2,079 analyzed US VC funds per Carta). Currently on Excel + QuickBooks + Carta + email.
- **Job-to-be-done:** "Compute my waterfall/NAV correctly, generate ILPA-compliant quarterly LP reports, and deliver K-1s on time — at 1/5th the cost of an incumbent."
- **Beachhead sequence (per dossier §8):** start with **SPVs** (simplest, highest volume, easiest to fully automate, $1.5–5K/SPV event) → **Fund I emerging VC** → PE funds → add LP portal → add GP-entity accounting + fractional CFO bundle ($30–60K/yr).
- **Positioning:** "Institutional-grade fund admin at emerging-manager pricing — K-1s delivered on time, every quarter."

---

## 2. STATE OF THE SPACE + WHY NOW

- Fund admin is still mostly humans manually ingesting deal data, running Excel, formatting PDFs, emailing LPs. K-1 prep outsourced to CPAs. Slow, error-prone, expensive (2–4 staff per $1B PE AUM; emerging funds pay **$40K–$120K/yr**).
- **Market:** global fund administration services **$12.9B (2024) → $25.8B (2033), 8.2% CAGR**; alternative AUM >$23T (2024) → ~$40T (2030); sub-$500M serviceable market est. $2–4B/yr. Sub-$100M US VC alone ≈ $75M–$225M/yr TAM.
- **Pain (documented):** only **1 in 5 asset managers would recommend their current fund admin** (EY Luxembourg); K-1s 6+ months late with errors; quarterly reports 60 days late; emerging managers deprioritized; Carta LP-data scandal (2024); Assure collapsed (2023–24); AngelList service issues forcing migrations.
- **Why now:** ~70–80% of fund-admin labor is automatable with today's AI (waterfalls, NAV, LP reports, capital calls, K-1 drafting, doc ingestion, KYC). Service-as-software is YC's named thesis (~50% of recent batches are AI agents). **No well-funded AI-native fund-admin pure-play targets emerging managers — this is the white space.**

---

## 3. COMPETITIVE LANDSCAPE & THREATS

**Tier 1 enterprise (not your competitor, price you out of the segment):** SS&C (~$5B rev, $75–200K+/yr), Citco, Apex Group ($3T AUM), Gen II (~200 PE funds, $60–150K/yr). Built for mega-funds; slow.

**Tier 2 mid-market / VC-focused:** Juniper Square (2,000+ GPs, 600K LPs, 38K funds; better for RE/PE; expensive for small funds); **Carta Fund Admin** (~$24–36K/yr emerging VC; equity-first not fund-first; LP-data scandal; mixed reviews; rigid); AngelList + Belltower (20,000+ funds; AngelList service delays; Belltower spun out 2024); Aduro Advisors (boutique, FundPanel.io).

**Tier 3 emerging-manager specialists:** **Decile Partners (Decile Group) — the closest competitor:** explicitly "agentic fund admin" (capital-call/reporting/KYC-AML/memo agents) + human oversight, 94 NPS, integrated with VC Lab (853 funds). **But still a services firm with software tooling, not AI-native from the ground up.** Standish, NAV Fund Services.

**Incumbents adding AI incrementally:** Allvue (AI Knowledge Agent 2025, mid-market PE), Caruso (exploring agentic, still a software vendor).

**Cost gap = the opportunity:** Carta ~$120–180K over a 5-yr fund life vs. Archstone ~$17,820. That ~$100K gap is the wedge.

**BIGGEST THREAT TO DEFEND AGAINST: Decile Group** (furthest along on agentic fund admin for the exact segment) and **platform risk from Carta/AngelList/Juniper Square** building or acquiring the AI layer. Defense: be AI-native + waterfall-correct from day one (FundSim engine), win on accuracy/timeliness reputation and Fund-I lock-in before they move down-market. No YC-backed AI fund-admin pure-play exists yet — move fast.

---

## 4. TRANSFORMATION THESIS + WHY FUNDSIM IS AN UNFAIR ADVANTAGE

**From "tool the fund accountant operates" to "the work delivered."** Customers pay for LP reports delivered, waterfalls calculated, month-end closed — not licenses. Captures more value than SaaS and is far stickier (cross-cutting §6: AUM-based 0.05–0.15%, or flat SaaS + per-fund, or hybrid).

**Why FundSim is the strongest of the three ideas (cross-cutting §1, reuse 10/10):**
- **`waterfall.ts` = the exact production artifact:** carried interest, preferred return, GP catch-up, distribution waterfall — already tested. **No competitor starting today has a proven waterfall engine as a starting point** (cross-cutting §5, defensibility layer 1 + §6 domain expertise).
- `fundLifecycle.ts` (capital-call timing, fees), `jCurve.ts` (capital calls + NAV evolution = LP-report content), `irr.ts` + `performance.ts` (TVPI/DPI/RVPI/IRR = the LP-report metrics) — all direct reuse.
- FinFox/Claude → LP-report narrative drafting + LP NL Q&A ("what's my IRR as of Q3?").
- `excelExport.ts`/`csvExport.ts` → audit exports + report packages.
- **Distribution/trust:** PE/VC analysts who used FundSim in school are now at the firms that need this; brand = warm-door opener. Trojan horse: give the simulator free to ops teams as a training sandbox, sell production software to the GP/CFO.

---

## 5. CORE PRODUCT SPEC (NO UI)

### 5.1 Data model (Postgres/Supabase, multi-tenant RLS)
- `fund`, `vehicle` (fund/SPV), `lpa_terms` (versioned — side letters amend terms), `lp` (investor), `commitment`, `capital_account` (per-LP), `capital_call`, `distribution`, `portfolio_company`, `valuation` (NAV marks, fair-value hierarchy), `transaction`, `management_fee` (with offset/recycling), `waterfall_run`, `lp_report`, `k1_package`, `document` (LPA/PPM/sub-docs/side letters/wires), `calc_run` (inputs hash, engine version, output), `audit_event` (immutable), `review_task` (human approval queue).

### 5.2 Deterministic calc engine (extend FundSim's pure-TS core — the moat)
- **Fund waterfalls:** European vs. American carry, hurdle rates, GP catch-up, clawback. Provably correct; unit-tested to 6 decimals; **every number traceable to source.**
- **NAV calculation:** portfolio valuation rules, fair-value hierarchy, GAAP vs. IFRS.
- **Capital account statements:** income/loss allocation per LP per partnership agreement.
- **Management fees:** offsets, recycling provisions.
- **Performance:** IRR / TVPI / DPI / RVPI.
- **Reconciliation invariant (assert in code): total LP capital accounts MUST equal fund NAV.**

### 5.3 AI / agent architecture — "LLM proposes, engine computes & verifies"
```
LPA / deal data → Claude (extract waterfall terms, structure call)
               → tool_use → deterministic engine (waterfall/NAV/fees/IRR)
               → typed JSON result
               → Claude drafts LP report narrative / capital-call notice / K-1 data
               → HUMAN REVIEW (licensed pro) → deliver
               → immutable audit log (every step)
```
- **Orchestration:** multi-agent orchestrator-worker fits month-end (parallel: extraction / calc / compliance / formatting), but start single-agent tool-augmented for auditability.
- **Agent tasks:** extract waterfall terms from 100–200pg LPAs (LLM + validation against structured schema — unique provisions per fund); draft quarterly LP report; compose capital-call notices (validate bank details); generate K-1 package data (feed to tax software); answer LP NL questions.
- **CRITICAL PATTERN: agents draft → human reviews → agent sends. NEVER fully autonomous on financial or tax outputs.** Build the review queue / approval workflow into the product — it's the trust layer, not a weakness.
- **Structured outputs only**; numbers never free-text through an LLM. Haiku 3.5 for doc extraction, Sonnet 4.x for reasoning/narrative; prompt caching for static fund context; Batch API for quarterly report runs (50% off).

### 5.4 Accuracy / eval / guardrails (zero tolerance in production)
- Golden dataset of waterfall/NAV/IRR scenarios with known-correct outputs (seed from FundSim `src/utils/__tests__/`); regression-test every engine/model change; alert on any variance.
- Range/anomaly checks: flag if an LP balance moves unexpectedly; flag impossible IRRs.
- LPA-term version control (side letters amend); reconciliation checks (capital accounts = NAV).
- Document ingestion: AWS Textract / Google Document AI / Azure Form Recognizer + LLM post-processing, validated against schema.

### 5.5 Audit trail & permissions
- Full audit trail: source data → transformation → output, every calc. RBAC (GP/admin/LP-read). Immutable logs satisfying SEC-examination expectations (cross-cutting §4 — a genuine moat; no incumbent fund-admin startup built this natively). SEC Reg S-P relevant (holding LP data).

---

## 6. DATA & INTEGRATIONS (gotchas)
- **Bank feeds (cash reconciliation):** Plaid/MX — **but note:** for funds holding public securities you need custodian feeds (Schwab/Fidelity/prime brokers), NOT Plaid; custodian feeds take months + institutional relationships + $5–50K. For sub-$500M VC, bank-account-level reconciliation via Plaid is usually enough.
- **Cap table / portfolio company data:** Carta API (limited, partnership-gated), Pulley (export only), or Excel/CSV import. **Build against Open Cap Table Format (OCF)** — the portable standard (Gunderson/Carta/AngelList). Most PE funds use Excel/Allvue, not Carta.
- **Fund data aggregators (LP data):** Canoe Intelligence, Accelex.
- **Tax software (K-1 delivery):** Drake, Lacerte, UltraTax. **K-1s require a CPA/licensed professional sign-off — partner with a boutique alternative-investment CPA firm (dossier §8.3 above-and-beyond §3).**
- **Accounting (GP entity):** QuickBooks/Xero via Merge/Codat for the GP-entity-accounting bundle later.
- **Documents:** AWS S3 + strict access controls; SOC 2 required.
- Gotcha: LPAs are 100–200pg legal docs with unique waterfall provisions per fund — extraction + schema validation is the hard, valuable part.

---

## 7. DEFENSIBILITY & MOAT (cross-cutting §5 + dossier §7)
1. **Trust & accuracy** — fiduciary-level; LPs sue for calc errors; one wrong K-1 hits 50+ LPs. First to be "always accurate, always on time" owns the market. **Carry E&O insurance from day one.**
2. **Switching costs** — funds don't switch mid-life (re-audit history, recompute NAVs; 3–6mo migration). LTV = 7–10yr per fund.
3. **Proprietary data flywheel** — hundreds of LPAs, capital-call histories, LP transactions = training data competitors can't replicate.
4. **Network effects within fund families** — Fund I → Fund II/III/SPVs; partners launching own funds refer. VC ecosystem is small/networked.
5. **Domain depth** — correct American vs. European carry is genuinely hard; FundSim crystallizes it.
6. **Compliance as procurement moat** — SOC 2 Type II (~$20–30K via Vanta/Drata) + SEC-grade audit trails + GDPR EU data residency (flip on Supabase/Vercel EU regions). Fund admins do NOT need RIA registration (administrative, not advice) — a moat without oppressive licensing. Need AML/KYC process for LP onboarding (FinCEN).

---

## 8. GTM & PRICING + UNIT ECONOMICS
- **Pricing:** fixed $8K–$25K/yr (vs. $40–120K traditional — immediately attractive); or AUM-based 0.05–0.15% of committed capital; per-LP surcharge for complex structures; SPVs $1.5–5K/event. Bundle (fund admin + GP-entity accounting + fractional CFO) = $30–60K/yr, near-irreplaceable.
- **CAC:** low — emerging managers cluster in **VC Lab (853 funds), Kauffman Fellows, On Deck, First Check, AngelList, law firms (Cooley, Gunderson)**. One partnership = hundreds of warm leads.
- **LTV:** high — $15K/yr × 7–10yr = $105–150K, near-zero churn.
- **Target:** 100 funds × $15K = $1.5M ARR, achievable solo in 12–18mo with strong automation.
- **Above-and-beyond angles (dossier §8):** Fund-II wedge; SPVs as beachhead; CPA-partnership moat (be their tech layer, they refer); LP-portal two-sided network; audit-defensibility "always audit-ready" guarantee (partner RSM/BDO); regulatory-intelligence co-pilot (SEC Private Fund Adviser Rules, ILPA templates); bridge-to-institutional-LPs ("institutional-grade ODD at emerging pricing").
- **Funding:** cross-cutting recommends raising $500K–1M pre-seed (compliance/integration/trust take time) or raising at first 2–3 paying funds, highlighting the waterfall engine.

---

## 9. BUILD MILESTONES
- **v0 (0–8 wks) — Prove the waterfall.** Reuse `waterfall.ts`/`fundLifecycle.ts`/`irr.ts`; LPA-term extraction (Claude + schema validation) → engine → typed output; capital-account model; reconciliation invariant; 100+ waterfall/NAV golden eval. **Validate:** correctly compute one real fund's waterfall + NAV from its LPA; capital accounts = NAV; every number sourced.
- **v1 (2–5 mo) — First paying funds.** LP-report narrative generation (ILPA template), capital-call notices, human review/approval queue, audit trail, RBAC, Plaid cash reconciliation, OCF cap-table import. CPA partner for K-1 sign-off. **Validate:** 3–5 funds (offer free for first 3 for testimonials), first paying customer at $10–15K/yr by ~month 4; first quarterly LP-report cycle delivered on time, zero errors.
- **v2 (5–12 mo) — Scale + lock-in.** SPV product (volume), K-1 package generation, LP portal, GP-entity accounting bundle, SOC 2 Type I→II, EU data residency. **Validate:** 10–20 funds; one accelerator/law-firm channel partner; near-zero churn; reference-able accuracy/timeliness record. Then raise.

---

## 10. KEY RISKS & MITIGATIONS
1. **Liability** (K-1 error → 50-LP, $1M+ lawsuit) → E&O insurance day one; human-in-loop on all financial/tax outputs; immutable audit trail.
2. **Becoming a low-margin services firm** (Bench cautionary tale, dossier §3.4 — don't eliminate humans fastest; make a small excellent team 5–10x more productive) → automate the calc/extraction core hard; keep humans on judgment/sign-off only.
3. **Platform risk** (Carta/AngelList/Juniper Square build or acquire the AI layer) → win Fund-I lock-in + accuracy reputation first; AI-native + waterfall-correct from day one.
4. **Regulatory shift** (SEC could require fund-admin registration/licenses) → monitor; legal opinion on specific exposure before scaling.
5. **Custodian/integration depth** → start with Plaid-level reconciliation for sub-$500M VC; defer custodian feeds.
6. **Trust barrier with LP data** → SOC 2 early, DPAs, EU residency, immutable audit logs.

---

## 11. OPEN QUESTIONS THE FOUNDER MUST DECIDE
1. Beachhead: SPVs first (volume, easiest to automate) or Fund-I emerging VC (higher LTV, deeper lock-in)?
2. Pricing: flat fee (predictable, attractive) vs. AUM-based (scales with value) vs. hybrid?
3. Build the LP portal early (two-sided network) or GP-only first?
4. Which CPA partner / partnership structure for K-1 sign-off — and own it or refer it?
5. Raise pre-seed $500K–1M now (compliance/integration runway) or bootstrap to first 2–3 funds then raise?
6. Which single channel to wedge through first: VC Lab, Kauffman Fellows, AngelList, or a fund-formation law firm?
7. PE vs. VC first? (VC = FundSim audience overlap + simpler; PE = higher ACV + more waterfall complexity.)
