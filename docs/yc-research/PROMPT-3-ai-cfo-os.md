# BUILD PROMPT 3 — AI CFO / Autonomous Finance Operating System

**Source dossier:** `03-ai-cfo-os.md` (YC idea #15) + `00-cross-cutting.md`
**For:** Solo technical founder, builder of FundSim (fundsimulate.com). You handle UI. This spec is the CORE.
**Cross-cutting rank:** #3 of 3 — the "BIG SWING." Largest TAM, weakest distribution bridge from FundSim, most capital-intensive. **Verdict from dossier §9B: building the FULL AI CFO OS solo is a strategic mistake; build a focused WEDGE that plays to the FundSim simulation/calc edge, with the OS as the 5-year vision.** Best pursued after fund-admin (Idea 2) has 50+ funds and $2M+ ARR — OR pursued now ONLY as the narrow wedge below.

---

## 1. ONE-LINE THESIS + WEDGE

**Thesis:** The decision/simulation + correctness layer of the finance OS — the "system of intelligence" that reads a company's real financial data and answers what-if questions deterministically, while everyone else races to own the recording layer (ledger/spend).

**Wedge (do NOT build the full OS — pick ONE; both play to FundSim):**
- **Wedge A — Revenue-recognition automation for SaaS/subscription (dossier §5 wedge 1, §9A.2):** ASC 606, deferred-revenue schedules, contract modifications. Grotesquely under-served; NetSuite ARM is a $10–30K/yr add-on needing a consultant; Maxio/Chargebee handle billing but outputs need manual GAAP mapping. **Buyer:** controller/VP Finance at Series A–C SaaS, 50–500 employees. Natural expansion into FP&A.
- **Wedge B — Financial scenario/simulation layer (dossier §9A.8, the most FundSim-native):** sits on top of existing accounting (reads actuals), competes with neither ERP nor spend. Answers "what happens to runway if we hire 5 engineers in Q3?", "do we hit profitability by Q4 at 50% of quoted price?", "probability we need to raise in 18 months given burn?" **Pricing $1K–$3K/mo, direct to CFO/VP Finance.**

**Recommendation:** Start with **Wedge B** (zero write-access barrier, fastest trust, direct reuse of FundSim's engine), use it to earn data + trust, then add Wedge A (rev-rec) as the first "execution" capability. Job-to-be-done: "Give me a CFO-grade answer to a financial what-if, grounded in my real numbers, that I can show the board."

---

## 2. STATE OF THE SPACE + WHY NOW

- A Series A–C company runs 8–15 disconnected tools (GL, banking, cards, AP, AR, payroll, FP&A, close, reporting); **finance teams spend 60–70% of time moving data between systems.** Layers exchange files, not context.
- **System of record (NetSuite/QB) vs. system of action (Ramp/Slack) vs. system of intelligence (the emerging layer everyone races to own).** 51% of finance leaders cite limited data visibility as the top pain; only 10% fully trust AI-generated finance data.
- **Market:** ERP $71–93B → $121–282B; spend management $25.8B → $45.9B; **agentic AI in financial services $7.8B (2026) → $43.5B (2031), 41% CAGR.** SAM at the ERP×spend×agentic intersection: ~$150–200B by 2030.
- **Why now:** agentic finance is real (Ramp Agents: 85% of expense reviews automated at 99%; AP agents flagged $1M+ fraud in 90 days; Accounting Agent 90%+ auto-coding, 3x faster close; Pilot AI Accountant zero-human bookkeeping, Feb 2026). BUT strategic forecasting/planning + multi-entity international close remain unsolved — **91% of finance teams reported low AI impact in planning (Gartner 2025).** That unsolved planning/decision gap IS the wedge.

---

## 3. COMPETITIVE LANDSCAPE & THREATS

**Spend/banking racing to own the OS:**
- **Ramp — STRONGEST, the threat to respect:** $32B (Nov 2025) → in talks for $40B+ (May 2026); $1B+ revenue, 50,000+ customers, $100B+ purchase volume, FCF-positive. Agents for Controllers/AP/Accounting + Treasury + reconciliation agents. Richest behavioral training data in the space.
- **Brex → acquired by Capital One (Jan 2026, $5.15B, ~April close)** at a discount to $12.3B peak. AI-Native Accounting API (two-way ERP sync), powered OpenAI's spend. Large-bank bureaucracy may slow it → opening in upper-mid-market.
- **Mercury:** $5.2B (May 2026 Series D), 300K+ customers, 1-in-3 US startups; Mercury Command (NL treasury/accounting actions) + acquired payroll (Central). Distribution leader at the startup layer.
- **Rho:** smaller all-in-one banking+spend.

**AI-native ERPs (system-of-record legitimacy):**
- **Rillet:** $108.5M in <12mo (Sequoia, a16z+ICONIQ); AI-native ERP for complex/SaaS accounting; PostScript closes in 3 days; Brex API launch partner.
- **Campfire:** $100M+ (Accel, Ribbit); replacing NetSuite, 2–6 wk migrations; angels = Ramp CTO, Snowflake VP Finance, Supabase CFO.
- **Digits:** ~$100M; Autonomous General Ledger (Mar 2025) + AI agents; trained on $825B+ transactions; NVIDIA partner.
- **Numeric:** ~$89M; close/reconciliation → multi-product. **Light:** ~$43M, EU, hypergrowth. **Puzzle:** $66.5M, startups. **Pilot:** $222M, AI Accountant (fully autonomous, Feb 2026).

**Legacy (weakest for autonomy):** NetSuite/SAP/QuickBooks — built for human form-clicking, concurrency-limited, AI bolted on. Microsoft Copilot for Finance (GA Oct 2025) = read/explain/draft assistant, not autonomous executor. Switching costs (data gravity) protect incumbency but the net-new/switcher window is open.

**BIGGEST THREAT: Ramp.** $40B, FCF-positive, can replicate any workflow in 6–9 months. **Do NOT compete on spend management.** Compete where Ramp doesn't play: planning/decision-support (Wedge B) and complex rev-rec (Wedge A) for non-Ramp customers and mid-market (100–500 employees, underserved — too complex for Pilot/Puzzle, too small for NetSuite, not Ramp's sweet spot of 10–50).

---

## 4. TRANSFORMATION THESIS + WHY FUNDSIM IS AN UNFAIR ADVANTAGE

**Arc:** best-in-class tools (2018–22) → AI copilots in each tool (2023–25) → agents run whole workflows end-to-end (2026–28) → finance is a policy layer, AI executes, close is real-time (2029+). The endgame ("company as a graph": every vendor/contract/invoice/JE a node; humans set policy + handle exceptions) is what Ramp/Brex approximate.

**Why FundSim wins the wedge (cross-cutting Idea 3 reuse = 6/10, AI leverage = 9/10):**
- Everyone is building the **recording** layer; almost no one builds the **prediction/decision** layer. FundSim IS a decision/simulation engine — its core is exactly Wedge B.
- Deterministic calc engines (LBO, DCF, IRR, waterfall, scenarios) + FMP market data + FinFox (an AI that already reasons about financial-model outputs) = the upgrade path to "AI CFO" is: more context (real financials) + more tools (accounting APIs) + staged autonomous action.
- Correctness + explainability are the two things CFOs fear losing to AI — FundSim's brand ("years making finance calculations correct and explainable") directly addresses that fear.
- Rev-rec (Wedge A) needs a provably-correct calc engine — most AI tools hallucinate on ASC 606; FundSim's engine discipline is the edge.

---

## 5. CORE PRODUCT SPEC (NO UI)

### 5.1 Layer 1 — Integration & ingestion (the underestimated hard part)
- MVP: ONE pair only — **QuickBooks + Stripe** (Wedge B), or **Stripe/Chargebee + QuickBooks/NetSuite** (Wedge A rev-rec).
- Use **Merge.dev / Codat / Rutter** for breadth-fast, accept lower depth. Direct QuickBooks API; NetSuite/Sage poorly documented, rate-limited, budget 3–6mo each. Plaid (+ Plaid for Business) / Finicity for cash. Gusto/Rippling/ADP via Merge HRIS.

### 5.2 Layer 2 — Unified financial data model / graph (core IP)
Map every source into: **Entities** (companies/subs/vendors/customers/employees); **Accounts** (COA, reconcilable to GAAP/IFRS); **Transactions** (JEs: debit/credit, date, amount, currency, entity, cost center, tags); **Documents** (invoices/POs/contracts linked to txns); **Rules** (rev-rec schedules, amortization, allocation); **Events** (Stripe revenue events, payroll runs, bank feeds — raw inputs pre-posting). Graph representation lets an agent traverse vendor→invoice→payment→JE→bank-match in one context. Solve: COA normalization, cash-vs-accrual dates, multi-currency FX, intercompany eliminations, historical ingest without breaking audit trail.

### 5.3 Layer 3 — Agent orchestration ("LLM proposes, engine computes & verifies")
```
NL question → Claude (intent, extract params, select tool, structure call)
           → tool_use → deterministic engine (rev-rec calc / scenario sim / variance)
           → typed JSON result
           → Claude explains, drafts board narrative
           → verification (balance checks, range checks) → immutable audit log
```
- Wedge B tools: `simulate_runway`, `run_scenario`, `monte_carlo_raise_probability`, `headcount_impact`, `fetch_actuals`, `fetch_market_data`. Wedge A tools: `apply_asc606_schedule`, `post_deferred_revenue`, `recognize_on_schedule`, `reconcile_billing_to_gl`.
- **Staged autonomy (required):** read-only → write-with-1-click-approval → autonomous-under-threshold. Confidence scoring per action; dollar thresholds; exception queue showing the agent's reasoning + one-click approve/reject. Frameworks: LangGraph or Anthropic agent tooling.
- **Structured outputs only**; numbers never pass through an LLM as free text. Sonnet for reasoning, Haiku for extraction, prompt caching + Batch API for cost.

### 5.4 Layer 4 — Self-improving loop
Agent action → human approve/correct → correction stored as labeled data (vendor/description/amount/context) → auto-applied next time → after N corrections, generalize (RAG/fine-tune). The longer a customer runs it, the more accurate for THEIR context → switching cost competitors can't replicate.

### 5.5 Layer 5 — Eval, accuracy, guardrails (accuracy IS the product)
- Golden dataset (seed from FundSim `__tests__`); precision/recall per GL account/vendor/txn type; **shadow mode** (run agents parallel to humans, measure agreement before granting autonomy); regression-test historical txns before deploy.
- Guardrails: dollar thresholds (auto ≤ $X; $50K → 1-click; $500K → multi-approver); **immutability of posted/reconciled JEs** without human approval (GAAP/audit); dual-control for new vendor bank accounts; anomaly tripwires; full audit trail (timestamp, agent ID, reasoning, inputs, output, human action).

---

## 6. DATA & INTEGRATIONS (gotchas)
- **Accounting/ERP:** QuickBooks (SMB), NetSuite REST + SuiteScript (mid-market, brittle/rate-limited), Xero, Sage Intacct.
- **Banking/cash:** Plaid for Business, Finicity; Merge/Codat/Rutter for fast MVP coverage; direct bank partnerships only if moving money.
- **Billing/revenue (critical for Wedge A):** Stripe webhooks/APIs, Chargebee, Maxio, Recurly, Zuora.
- **Payroll/HR:** Gusto, Rippling, ADP, Paychex via Merge.
- **Cards/spend:** read Ramp/Brex/Mercury feeds (you read their data, don't own the txn).
- **Market data:** FMP (already integrated) for comps/multiples; FRED for rates.
- Gotcha: every customer's COA/Stripe catalog/payroll config differs — the long tail of integration edge cases will eat 60%+ of time; constrain to one pair for MVP.

---

## 7. DEFENSIBILITY & MOAT
- **System-of-record status** is the strongest moat — but as a solo founder you likely sit ABOVE the ledger (decision layer), so lean on: **proprietary correction/behavioral data** (self-improving loop), **integration depth** (40-integration ecosystem can't be cloned in 6mo), **trust/accuracy track record** (12+ months of 99%+ = reference-able moat), **human-in-the-loop UX** as a feature, and **the deterministic simulation engine** (FundSim) that recording-layer competitors lack. Compliance: SOC 2 Type II ($50–100K, 6–12mo, Vanta/Drata) from day one; GDPR/CCPA; audit-trail-as-product angle (dossier §9A.6). Weak-but-real: vendor-risk and benchmark network effects. NOT a moat: UI, basic AI features, any single integration.

---

## 8. GTM & PRICING + UNIT ECONOMICS
- **Buyer:** controller (50–200 emp) or VP Finance/CFO (200–500). Risk-averse, evaluate on accuracy, trust references + pilots, not demos. **PLG is nearly impossible** for tools touching the GL.
- **Motion:** direct outreach to controllers/CFOs at Series A–B who hit a pain event (failed NetSuite implementation, audit finding, controller departure — urgency shortens 3–6mo cycles). **Channel: outsourced CFO/controller firms (Burkland, Escalon, Acuity) — each serves 20–100 companies; build for the accountant, the company is the end-user (Pilot's model).** YC network as early adopters.
- **Pricing:** Wedge B $1K–$3K/mo SaaS (per-company/per-entity, predictable); Wedge A value-based possible (% of correctly-recognized revenue value / consultant fees saved). Realistic solo target: $500–$1,500/mo, $50K–$150K ACV high end; **50 customers = $3M–$7.5M ARR.** Per-spend pricing (Ramp model) not viable without card issuance.
- **Unit economics:** keep inference low via engine-first + caching; gross margin improves as correction-loop reduces human review. This idea generally needs VC from day one to build credibly (cross-cutting §6).

---

## 9. BUILD MILESTONES
- **v0 (0–10 wks) — Prove the decision layer.** Wedge B: QuickBooks + Stripe read-only; ingest actuals into the data model; FundSim engine wired to real data; Claude tool-use loop for runway/scenario/raise-probability; balance + range checks; 100-scenario eval. **Validate:** answer 5 real what-ifs for one company, board-presentable, every number sourced; CFO says "I'd show this to my board."
- **v1 (2.5–6 mo) — First revenue + first execution.** Add Monte Carlo, variance, board-narrative, audit trail, RBAC, shadow mode. Begin Wedge A (ASC 606 rev-rec) read-only with reconciliation. **Validate:** 5–10 paying companies at $1–3K/mo; one channel (outsourced CFO firm); rev-rec shadow-mode agreement >95%.
- **v2 (6–15 mo) — Staged autonomy + expand.** Turn on write-with-approval for rev-rec posting; add NetSuite + payroll; self-improving loop live; SOC 2 Type I→II. **Validate:** autonomous-under-threshold in production 3+ months error-free; >120% NRR; mid-market (100–500 emp) logo.

---

## 10. KEY RISKS & MITIGATIONS
1. **Fiduciary/trust of autonomous money actions (CRITICAL, existential)** — one wrong $500K payment or 3-month-compounding misclassification kills the company; liability is legally unresolved → human-in-loop above thresholds, full audit trail, professional-liability insurance (verify it covers AI actions). Start with read-only Wedge B (no money movement).
2. **Integration hell** (60%+ of time) → Merge/Codat/Rutter; one integration pair for MVP.
3. **Accuracy-expectation mismatch** (buyers want 100%; 99% = 1 error/100 txns) → ship shadow mode first; never claim autonomy until 3+ months proven in production.
4. **Long sales cycles** (3–6mo) → target post-pain-event companies; can't run 10 in parallel solo.
5. **Ramp / Capital One incumbency** → compete only in workflows they don't own (rev-rec, planning, multi-entity close for non-Ramp).
6. **Data residency / SOC 2** → plan from day one; Vanta/Drata.

---

## 11. OPEN QUESTIONS THE FOUNDER MUST DECIDE
1. Wedge A (rev-rec, execution, measurable ROI, harder) vs. Wedge B (simulation, FundSim-native, no write-access barrier) first? (Recommendation: B → A.)
2. Pursue now as a wedge, or wait until fund-admin (Idea 2) provides data/trust/integrations and expand into it as the 5-year vision?
3. Agent-of-record middleware (lower trust barrier, disintermediation risk) vs. own a system of record?
4. Which beachhead segment: AI-native startups (Mercury 2.5x app growth, cost-conscious, FundSim-aligned) vs. mid-market 100–500?
5. Raise immediately (this idea is capital-intensive and needs to outrun Ramp) — and is solo even viable, or is a co-founder (enterprise sales / deep integration eng) required, per dossier §9B?
6. Keep FundSim brand (correctness/explainability trust anchor) or new brand?
