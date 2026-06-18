# BUILD PROMPT 1 — AI-Native FP&A / Financial-Modeling Platform

**Source dossier:** `01-ai-native-fpa.md` (YC idea #11) + `00-cross-cutting.md`
**For:** Solo technical founder, builder of FundSim (fundsimulate.com). You handle UI. This spec is the CORE: engine, data, AI agents, integrations, defensibility.
**Cross-cutting rank:** #2 of 3 — the "safe wedge" (faster to revenue, lower regulatory burden, but the most crowded market). Pursue with a sharp niche, not a horizontal FP&A play.

---

## 1. ONE-LINE THESIS + WEDGE

**Thesis:** An AI analyst — not an FP&A tool — that generates and continuously maintains a structurally-correct, data-connected 3-statement financial model for a company, with scenario analysis, where a deterministic calc engine does every number and Claude does intent + explanation.

**Wedge (do NOT boil the ocean):**
- **Segment:** Series A–C **SaaS startups, $1M–$10M ARR, 50–500 employees**, no FP&A team (buyer = founder, fractional CFO, or first VP Finance).
- **Job-to-be-done:** "Build and maintain a board-ready 3-statement model connected to real data (Stripe + QuickBooks + payroll), with scenario analysis, without hiring a $150K analyst."
- **Trigger event:** Just raised a Series A/B and the board now expects a real model, runway visibility, and scenarios — high urgency, finite deliverable.
- **Sub-wedge to start (per dossier §5.3 Option A):** SaaS-specific models (ARR, MRR, churn, NRR, CAC, LTV, headcount-to-revenue) so the product understands the metrics on day one. Expand to Option B (PE portfolio-company monitoring) as the higher-ACV enterprise motion later.

---

## 2. STATE OF THE SPACE + WHY NOW

- ~80% of mid-market still runs FP&A in Excel/Sheets; the **2024 Poon et al. study found 94% of decision spreadsheets contain critical errors** (JPMorgan London Whale ~$6.2B; Norway SWF ~$92M; NHS row-limit data loss). Spreadsheet fragility is the wound to exploit.
- FP&A software TAM consensus **$4–6B (2024) → $10–14B by 2033** (~10–16% CAGR); EPM bucket ~$7B (Oracle 20.3% share).
- **The window: 79% of CFOs say AI budgets rise in 2025; 42% plan >30% increases — yet 71% are NOT yet using generative AI in finance.** Intention-deployment gap is the opening.
- Most under-served tier: **mid-market $20M–$200M revenue** (too complex for simple tools, too small/skeptical for Anaplan's 12-month cycle). For the solo wedge, go below that — Series A–C SaaS that has zero good option.
- Macro shift: spreadsheets → AI agents; point-in-time → continuous planning; Excel-as-UI → natural-language-as-UI; siloed tool → semantic/planning layer on the data warehouse. Snowflake/dbt/Salesforce **Open Semantic Interchange (2025)** makes proprietary in-memory engines (Anaplan Hyperblock, Workday) a liability as data gravity moves to Snowflake/BigQuery.

---

## 3. COMPETITIVE LANDSCAPE & THREATS

**Incumbents (slow, expensive, crowded Leader quadrant):** Anaplan (Thoma Bravo, $10.7B take-private; 12–18mo implementations, $200K–$2M/yr); Workday Adaptive; Oracle EPM (20.3% share) / SAP SAC; Vena & Cube (Excel/Sheets-sync, "agentic finance layer" repositioning, Cube +$20M Apr 2026); Datarails ($175M total, **$70M Series C Jan 2026**, pivoted to "FinanceOS" finance-MCP, declared "FP&A software is dead"); Pigment ($397M raised, ~$62.8M ARR, ~$1B valuation); Planful; Prophix; OneStream (IPO Jul 2024, $4.6B). Causal → Lucanet (Oct 2024) and Mosaic → HiBob (Feb 2025) signal the modern-UX-alone players couldn't stand alone.

**AI-native threats (the real competition):**
- **Aleph (getaleph.com) — HIGH:** $46M total, $29M Series B (Khosla, Sep 2025), 10x growth, YC. Customers: Zapier, Turo, Harvey, Chess.com.
- **Concourse (concourse.co) — HIGH, most direct:** $16.7M total ($12M Series A Jan 2026, a16z/CRV/YC). AI agents for close, cash forecasting, variance. Connects warehouses (Snowflake/BigQuery/Databricks), ERPs, payroll, billing; shows SQL/Python reasoning per output (audit trail); claims 75% manual-work reduction.
- **Iris Finance:** $6.2M seed, vertical AI CFO for CPG — proof that vertical wedges work.
- **Mosaic.pe (deal modeling) — MOST STRATEGICALLY RELEVANT to your skills:** $18M Series A (Radical, Apr 2026); customers incl. Warburg Pincus, Bridgepoint, CVC, Evercore; "5 of 10 largest PE firms." They attack the deal/bank-modeling side — leave that to them; take the ongoing FP&A/monitoring side.
- **Platform threat:** Microsoft Copilot for Finance (GA Oct 2025) — bundled into M365 enterprises already pay for. But: no finance-domain calc engine (general LLM over spreadsheets), requires data in M365, can't do deterministic auditable modeling. ChatGPT/Claude as ad-hoc analysts (44% of finance teams used them by late 2025) raise expectations but don't compute deterministically.

**BIGGEST THREAT TO DEFEND AGAINST: Concourse + Aleph.** They own the "AI analyst that does the work" positioning and are well-capitalized. Your counter-moats: (a) deterministic calc-engine accuracy + published evals, (b) vertical depth (SaaS metrics, then PE portco), (c) the education-to-professional distribution pipeline they cannot buy. Do NOT try to out-feature them on breadth.

---

## 4. TRANSFORMATION THESIS + WHY FUNDSIM IS AN UNFAIR ADVANTAGE

**From tool to analyst.** Old model: finance team operates FP&A software → produces plan → presents to CFO. New model: data + business context → AI analyst → produces plan + explanation → human reviews → CFO approves. This is a labor-leverage play: one CFO + AI ≈ a 3-person FP&A team.

**FundSim assets that transfer (per cross-cutting §1, Idea 1 reuse = 7/10):**
- Deterministic calc engine (`dcf.ts` pattern, `lbo.ts`, scenario framework) → the modeling backend. Most AI competitors lack a tested, auditable calc engine — this is the rarest asset (cross-cutting §5 defensibility layer 1).
- `excelExport.ts` / `csvExport.ts` → FP&A output + board-deck data formats.
- FinFox/Claude finance-domain prompting → "explain this DCF" becomes "explain this variance to budget" (same architecture, different data).
- Scenario presets ("aggressive LBO") → FP&A scenario templates ("bull/base/bear").
- **Distribution (the Figma playbook):** finance students who learned modeling on FundSim become economic buyers at startups in 2–4 years. The seeding is already done. Brand = "the product that taught analysts to model" → inbound trust on calc rigor.
- Supabase + Vercel + FMP MCP (market data for DCF terminal value, comps) already wired.

---

## 5. CORE PRODUCT SPEC (NO UI)

### 5.1 Data model (Postgres/Supabase, multi-tenant via RLS)
- `org`, `entity` (multi-entity later), `user`, `role` (RBAC: viewer/editor/approver).
- `model` (versioned; git-like), `model_version` (immutable snapshots), `line_item`, `driver` (e.g., sales-headcount → pipeline → bookings → revenue), `assumption` (typed, ranged), `scenario` (fork of model state), `actuals` (synced from sources, timestamped), `variance`.
- `data_source_connection`, `sync_run`, `mapped_account` (COA normalization per customer).
- `calc_run` (inputs hash, engine version, output, timestamp), `audit_event` (immutable: who/what/when/source).

### 5.2 Deterministic calc / ledger engine (extend FundSim's pure-TS core)
Add to existing LBO/DCF/waterfall/IRR functions:
- **3-statement engine:** IS → BS → CF with proper circular references (debt sweep, revolver, interest on beginning vs. average balance), correct tax mechanics, working-capital logic. **The balance sheet must balance; cash must reconcile** — assert in code.
- **Driver-based planning layer:** map drivers → line items.
- **Scenario management:** branch/fork model state; Monte Carlo on key assumptions; compare outcomes.
- **Variance engine:** plan vs. actuals by line item; decompose volume vs. price vs. mix.
- **SaaS metrics module:** ARR/MRR bridges, gross/net retention, CAC, LTV, magic number, Rule of 40, burn multiple.
- Rule: **engine is pure, unit-tested to 6 decimals, zero LLM involvement.**

### 5.3 AI / agent architecture — "LLM proposes, engine computes & verifies"
```
NL intent → Claude (intent, param extraction, tool selection, structured call)
         → tool_use call to deterministic engine (typed JSON in)
         → engine executes math, returns typed JSON
         → Claude interprets/explains, drafts commentary, suggests next steps
         → audit log (every call/input/output/timestamp, immutable)
```
- **Single-agent, tool-augmented for MVP** (synchronous, auditable). Tools: `build_3statement`, `run_scenario`, `compute_variance`, `fetch_actuals`, `fetch_market_data` (FMP), `generate_board_narrative`.
- **Structured outputs only** (Claude `tool_use`/JSON) — numbers NEVER pass through an LLM as free text.
- **Model routing (cost discipline):** Sonnet 4.x for reasoning/explanation; Haiku 3.5 for doc/GL extraction; prompt caching for static company context (target ~90% cache-hit reduction); Batch API for monthly report generation (50% off).

### 5.4 Accuracy / eval / guardrails (this is the moat — cross-cutting §2.6)
- **Golden dataset:** 500+ model Q&A pairs with verifiably-correct outputs (textbooks, CFA materials, real models). Seed from FundSim's `src/utils/__tests__/`. Run every model/engine change against it; alert on >0.1% variance; publish accuracy to customers.
- **Guardrail layers:** Zod/TS input validation → structured LLM output → engine isolation → range validation (flag IRR>10,000%, margin>300%, etc.) → full-trace audit logging.
- **Circuit breakers:** assumptions producing out-of-sector-norm results flag for human review before presentation.
- **Source citation on every number:** "Revenue $4.2M from Stripe as of Apr 30, last synced 2h ago."
- Watch benchmarks: FailSafeQA, FinBench 2026.

### 5.5 Audit trail & permissions
- Every calc stores source data (timestamped) + formula + assumptions + model version. Model version control = git for financial models; "why did this number change?" = automatic version diff. RBAC + immutable audit log; never auto-publish to a board deck without human approval.

---

## 6. DATA & INTEGRATIONS (priority order, with gotchas)

1. **QuickBooks Online + Xero** (~70% of SMB/startup accounting) — via **Merge.dev or Codat** (do NOT integrate each separately; ~6 months saved). Gotcha: unified APIs add latency/cost; some enterprises refuse third-party intermediaries; write-back is dangerous (one bad journal entry corrupts books — read-only first).
2. **Stripe / Maxio** (SaaS billing = revenue truth).
3. **Rippling / Gusto / ADP** (payroll = largest tech expense) via Merge HRIS.
4. **NetSuite** (mid-market ERP, $20M+) — budget 2–3x QuickBooks effort; enterprise-grade complexity.
5. **Salesforce / HubSpot** (pipeline → revenue).
6. **Plaid** (cash position/sweep). Gotchas: $0.30–$1.50/connection/mo adds up multi-entity; Mercury/Brex/Relay limited coverage; ToS restrictions.
7. **Snowflake / BigQuery / Databricks** (enterprise warehouses; align to Open Semantic Interchange).
8. **Market data:** FMP (already integrated) for multiples/terminal value; FRED for risk-free rate.

---

## 7. DEFENSIBILITY & MOAT (cross-cutting §5 stack)
1. **Correct, tested calc engine + proprietary evals** (hardest to copy; FundSim head start).
2. **Workflow lock-in as system of record** — once 12 months of history + calibrated drivers live in your system, switching = re-building institutional knowledge.
3. **Compliance posture** — SOC 2 Type II + audit trails as procurement blocker (Vanta/Drata, ~$20–30K all-in; table stakes — 98% of Fortune 500 require it). Model-risk angle: SR 11-7 / model-audit positioning (dossier §9.4).
4. **Education-to-professional distribution** (FundSim pipeline) — years to build, can't be bought.
5. **Benchmarking network effects** — anonymized opt-in cross-customer data ("SaaS at $5M ARR with your growth spends X% on S&M"); weak early, real at 50+ customers; sellable to VCs as second revenue stream.
Not defensible: nice UI, being first to use Claude, fine-tuned base model.

---

## 8. GTM & PRICING + UNIT ECONOMICS
- **Phase 1 ($0→$10K MRR):** Series A/B SaaS founders just-raised. Channels: YC alumni, OnDeck, Cerebral Valley, r/startups, build-in-public on X. White-glove "first model set up with you" for first 20 customers (learn the workflow before automating). **Distribution hack: fractional CFO networks (Escalon, Graphite, Burkland) — each serves 5–15 clients; 10 of them = 50–150 clients.**
- **Phase 2 ($10K→$50K MRR):** add PE portfolio-company monitoring ($50K–$200K/yr per firm, covers all portcos). Integration-marketplace listings (QuickBooks/Stripe/Rippling) for inbound.
- **Pricing (revenue-band, NOT per-seat early):** Startup $499–$799/mo (≤$20M ARR); Growth $1,500–$2,500/mo ($20–100M ARR); Enterprise/PE $5,000+/mo. Usage component for high-volume AI runs.
- **Unit economics:** target NRR >120%; key stickiness signal = % of budget exported to actuals; engine-first design keeps inference cost low. Bootstrappable to ~$500K ARR (universities + pro tiers) before raising; VC at $1–2M ARR (Bessemer/Ribbit/Coatue).
- **Non-obvious wedges (dossier §9):** one-click board-deck automation (emotionally resonant, no one nailed it end-to-end); "FP&A-as-a-service" ($2–4K/mo vs $10–15K human fractional CFO, Pilot.com playbook); model-auditor compliance product; PE portfolio multiplier; finance-certification flywheel; open finance-MCP server.

---

## 9. BUILD MILESTONES
- **v0 (0–8 wks) — Prove correctness.** Wrap FundSim engine + add 3-statement engine; QuickBooks + Stripe read-only via Merge; Claude tool-use loop with structured outputs; 100-scenario golden eval. **Validate:** generate a correct, connected 3-statement model + 3 scenarios for one real SaaS startup; balance sheet balances; every number cites source.
- **v1 (2–5 mo) — First revenue.** Add payroll, variance engine, SaaS-metrics module, board-narrative generation, audit trail, RBAC, version diff. 500-scenario eval published. **Validate:** 10 paying startups at $499–$799/mo; close 1 fractional-CFO channel partner; NRR signal positive.
- **v2 (5–12 mo) — Expand + defend.** PE portfolio-monitoring motion; NetSuite + warehouse connectors; benchmarking dataset (opt-in); SOC 2 Type I→II. **Validate:** first PE firm at $50K+/yr; >120% NRR; published accuracy stats used in sales.

---

## 10. KEY RISKS & MITIGATIONS
1. **Accuracy liability** (wrong assumption → bad board deck) → confidence levels, source citations, "verify before using," no auto-publish.
2. **Crowded market / Concourse-Aleph** → vertical depth + calc accuracy + distribution, never breadth.
3. **Incumbent bundling (Copilot)** → go deep on calc accuracy + audit trails Microsoft can't match.
4. **Data-trust barrier** → SOC 2 early, DPAs, VPC option for enterprise.
5. **Competing with free (Excel+ChatGPT)** → free read-only tier (see forecast, can't edit/export) until pain is acute.
6. **Long enterprise sales cycles** → win on the startup wedge first; don't start enterprise until the product is repeatable.
7. **Scope dilution** (manufacturing/supply-chain/HR planning) → resist until $3M ARR.

---

## 11. OPEN QUESTIONS THE FOUNDER MUST DECIDE
1. Sub-wedge first: SaaS-startup models (volume) vs. PE portco monitoring (ACV, plays to FundSim DNA)?
2. Pure SaaS vs. "FP&A-as-a-service" (human-in-loop, higher margin/stickier, Pilot playbook)?
3. Sit on the customer's warehouse (Snowflake-first) or own a proprietary store early?
4. Build the open finance-MCP server (picks-and-shovels, distribution+data) or stay app-only?
5. Bootstrap to $500K ARR via universities/pro tiers, or raise immediately to outrun Aleph/Concourse?
6. Keep the FundSim brand as trust anchor, or launch a clean B2B brand?
