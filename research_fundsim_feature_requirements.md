# FundSim Feature Research Report

# Finance Practitioner and Student Needs Analysis

# Date: April 29, 2026

---

## Executive Summary

This report synthesizes deep research across six domains to define what finance practitioners and students actually want from a financial modeling simulator. The findings are grounded in practitioner feedback, interview preparation requirements, employer expectations, and subject-matter-specific modeling standards. Each section closes with specific, prioritized feature recommendations for FundSim.

---

## Section 1: What IB Analysts Actually Do in Excel Models

### Standard M&A Model Tab Structure

A production-quality investment banking M&A model is not a single sheet. Real sell-side and buy-side models used in pitchbooks and committee memos follow a highly standardized tab architecture:

| Tab                      | Purpose                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Cover / TOC              | Deal summary, model navigation, version control                                               |
| Assumptions              | All hardcoded inputs in one place (color-coded blue)                                          |
| Income Statement         | Revenue build, COGS, EBITDA, D&A, EBIT, interest, taxes, net income                           |
| Balance Sheet            | Historical and projected, tied to CF statement                                                |
| Cash Flow Statement      | Operating, investing, financing cash flows; FCF build                                         |
| Debt Schedule            | Tranche-by-tranche: revolver, TLA, TLB, senior notes; amortization, PIK toggle, cash interest |
| Working Capital Schedule | DSO, DIO, DPO build driving changes in NWC                                                    |
| PP&E / Capex Schedule    | Gross PP&E roll, depreciation by asset class, maintenance vs. growth capex                    |
| Sources & Uses           | Acquisition price (equity value + net debt), fees, financing sources reconciliation           |
| Returns Analysis         | IRR, MoM, EV bridge, sponsor returns, management returns                                      |
| Scenarios                | Base, Upside, Downside, Lender Case (pulled via dropdown/INDEX-MATCH)                         |
| Sensitivity Tables       | Two-variable data tables (e.g., entry multiple vs. exit multiple; EBITDA growth vs. leverage) |
| Football Field           | Valuation summary: DCF, comps, precedents, LBO implied, 52-week range                         |
| Merger / Acc-Dil         | Pro forma combined income statement, EPS accretion/dilution analysis                          |
| Contribution Analysis    | What each party contributes in revenue, EBITDA, net income, book value vs. ownership stake    |
| Output / Summary         | One-page deal summary for MD review                                                           |

**Real models used on deals have 15-20 tabs minimum.** Students and candidates typically build 4-6 tab models. This gap is the single biggest signal that a candidate has not worked on live deals.

### The FCF Build: How IB Analysts Actually Do It

The free cash flow build is one of the most error-prone sections for students. Analysts build it from EBIT, not from net income (which is the textbook approach), because the debt schedule runs in parallel:

```
EBIT
- Cash Taxes (on EBIT, not EBT, because interest is modeled separately)
+ D&A
- Capex
+/- Change in Working Capital
= Unlevered Free Cash Flow (UFCF)
- Cash Interest (from Debt Schedule)
+ Interest Tax Shield
- Mandatory Debt Amortization
+/- Revolver Draws / Repayments
= Levered Free Cash Flow / Cash Available for Distribution
```

The interest-EBIT circularity (interest expense affects taxes, which affect cash available, which affects debt paydown, which affects next year's interest) is handled via an Excel circular reference or an iterative solver. Most candidates do not know how to handle this correctly.

### Most Common Student Errors (Practitioner-Identified)

1. **Circular reference errors** - Not knowing how to handle the interest / debt paydown loop; either breaking the link or crashing Excel
2. **Hardcoding numbers inside formulas** - e.g., `=B12*0.35` instead of `=B12*$E$5` (tax rate assumption cell)
3. **Wrong treatment of working capital** - Treating an increase in accounts receivable as a source of cash (it is a use)
4. **Double-counting synergies** - Adding revenue synergies to EBITDA without removing the costs required to generate them
5. **Terminal value denominator error** - Using `WACC - g` where g equals or exceeds WACC, producing infinite or negative values
6. **Net debt sign errors** - Adding net debt (instead of subtracting) when bridging from EV to equity value; common in accretion/dilution models
7. **Debt schedule not linked** - Interest expense in the income statement not pulling from the debt schedule; manually hardcoded
8. **Ignoring cash taxes vs. book taxes** - Using income tax expense from the P&L instead of building a deferred tax schedule
9. **No balance sheet check** - Model does not balance (Assets = Liabilities + Equity), making it impossible to audit
10. **Wrong diluted share count** - Using basic shares in EPS calculation; ignoring in-the-money options via treasury stock method

### Specific Interview Questions on Model Mechanics (IB)

- "Walk me through the three statements and how they link."
- "If depreciation increases by $10M, what happens to each statement and to FCF?"
- "How do you handle the interest expense circularity in an LBO model?"
- "Why do you use UFCF in a DCF instead of levered FCF?"
- "What is the difference between EBITDA and cash EBITDA? When does it matter?"
- "If the target has $50M of net debt, does that increase or decrease what the acquirer pays per share?"
- "In an accretion/dilution analysis, what are the three drivers of whether a deal is accretive?"
- "What is the purchase price allocation and how does goodwill arise?"
- "How does a revolver work in a model and when does it draw?"
- "What is a normalized EBITDA and why do bankers adjust for it?"

---

## Section 2: PE/VC-Specific Modeling Needs

### GP/LP Economics Questions in Interviews

The GP/LP economics section is consistently tested at megafunds and upper-middle-market shops. Candidates must be able to model the entire fund waterfall from memory:

**Four-Tier American Waterfall (deal-by-deal carry):**

1. **Return of Capital**: LP receives 100% of distributions until all invested capital is returned
2. **Preferred Return (Hurdle Rate)**: LP receives 8% annualized preferred return on invested capital
3. **GP Catch-Up**: GP receives 80-100% of distributions until GP has received 20% of total profits distributed so far
4. **Carried Interest Split**: Remaining profits split 80% LP / 20% GP

**European Waterfall (whole-fund carry):**

- GP receives no carry until ALL LP capital is returned across ALL deals
- More LP-friendly; standard in European funds

**Common GP/LP Interview Questions:**

- "What is the difference between American and European waterfall structures and which is more GP-friendly?"
- "A fund invests $100M across 5 deals. Deal 1 exits at 3x, Deal 2 is a zero. Walk me through distributions under an American waterfall."
- "What is a clawback provision and when is it triggered?"
- "If a GP has a 20% carry with an 8% hurdle and a 100% catch-up, what is the GP's effective carry percentage across the total fund?"
- "What is the difference between gross IRR and net IRR to the LP?"
- "A fund has a management fee of 2% on committed capital for 5 years then 2% on invested capital. Fund size is $500M. What are total fees over a 10-year fund life?"

**Portfolio Construction Exercise (used at top PE firms):**
Candidates are given a portfolio of 8-10 hypothetical deals with entry multiples, hold periods, exit scenarios, and capital deployment schedules. They must calculate:

- Fund-level gross IRR and MoM
- Net IRR after management fees and carry (using XIRR on actual cash flows)
- DPI (Distributed to Paid-In), TVPI (Total Value to Paid-In), RVPI (Residual Value to Paid-In)
- J-curve projection (negative early years from fees and slow deployment, recovery as exits occur)
- Impact of recycling provisions (reinvesting realized proceeds)

### LBO Model Test Structures

**30-Minute Paper LBO** (used at early screening rounds):

- Mental math: entry EV, equity check, 5-year EBITDA projection, debt paydown, exit EV, MoM and approximate IRR
- No Excel; done on whiteboard or paper
- Tests whether candidate understands the mechanics before being given tools

**60-Minute Standard LBO Test** (used at most MF/UMM first rounds):

- Excel provided with pre-populated income statement
- Build: Sources & Uses, debt schedule (usually 2-3 tranches), FCF build, returns table
- Output: IRR and MoM at various entry/exit multiples (2x2 or 3x3 sensitivity table)
- Common pitfall: spending too long on formatting vs. getting to returns

**3-Hour Full LBO Model** (used at final rounds):

- Blank Excel or populated historical financials
- Full operating model, detailed debt schedule (TLA, TLB, revolver, PIK notes), cash interest vs. PIK toggle
- Management equity rollover and options modeling
- Full scenario analysis (base, upside, downside)
- IRR attribution: how much of returns comes from EBITDA growth vs. multiple expansion vs. leverage/debt paydown
- Expected output: polished, investment committee-ready model

**IRR Attribution (frequently tested, rarely understood):**

```
Entry EV = Entry Multiple x Entry EBITDA
Exit EV  = Exit Multiple  x Exit EBITDA

EBITDA growth contribution   = (Exit Multiple x Entry EBITDA) - Entry EV
Multiple expansion contribution = (Exit Multiple - Entry Multiple) x Exit EBITDA  [simplified]
Leverage contribution        = Debt paid down during hold period (reduces equity needed)
FCF contribution             = Dividends / distributions received during hold
```

---

## Section 3: Infrastructure Finance Specifics

### How Infrastructure M&A Differs from Corporate M&A

The practitioner feedback that "80% of value sits above EBITDA forecasting" is precisely correct and reflects a structural difference in how infrastructure assets generate and protect cash flows.

**Corporate M&A**: Valuation anchors on EBITDA multiples derived from comparable companies. Revenue and cost assumptions drive everything. Competition risk is high. Terminal value assumes indefinite going-concern.

**Infrastructure M&A**: Valuation anchors on the **concession term** or the **regulatory settlement cycle**. The asset has a finite contractual life. Cash flows are determined largely by:

- Traffic/volume demand forecasts (airports, toll roads, ports)
- Regulatory determinations (utilities, water, energy networks)
- Contract terms (PPP/PFI availability payments)
- Inflation indexation (many revenues are CPI-linked)

EBITDA is an output, not a driver. The value-critical inputs are the specialist advisory inputs that feed into revenue:

- **Traffic advisors** (Steer, AECOM, Jacobs, CDM Smith) for volume ramp-up curves, elasticity, alternative route competition
- **Technical advisors** for capex validation, asset life assessments, lifecycle cost modeling
- **Regulatory advisors** for allowed rate of return, RAB roll-forward methodology, revenue cap structure
- **Insurance advisors** for force majeure assumptions, business interruption coverage levels

### Regulatory Asset Base (RAB) Valuation

RAB is the cornerstone of regulated utility valuation (water, electricity networks, gas pipelines, airports under economic regulation):

**RAB Roll-Forward:**

```
Opening RAB (t) = Closing RAB (t-1)
Closing RAB (t) = Opening RAB (t) + Regulatory CAPEX (t) - Regulatory Depreciation (t) +/- Inflation Indexation (t)
```

**Building Block Revenue Model:**

```
Allowed Revenue (t) = Regulatory Opex (t)
                    + Regulatory Depreciation (t)
                    + (Opening RAB (t) x Allowed WACC (t))
                    +/- Efficiency incentive adjustments
                    +/- Volume/uncertainty mechanisms
```

**RAB Multiple Valuation:**

- Regulated utilities trade at a premium or discount to RAB (RAB multiple)
- If WACC allowed by regulator > actual cost of capital, asset trades above RAB (premium)
- RAB multiple is the primary valuation sanity check alongside DCF
- Typical range: 1.0x - 1.5x RAB for UK/European regulated assets

**Key modeling considerations:**

- Regulatory period (typically 5 years for price reviews; AMP in UK water, RIIO in UK energy)
- Outcome Delivery Incentives (ODIs) and performance rewards/penalties
- Totex (total expenditure) vs. opex/capex distinction under RIIO framework
- Financeability test: whether projected interest coverage and credit metrics are consistent with investment-grade rating assumed by regulator

### Project Finance vs. Corporate Finance Modeling

| Dimension           | Corporate Finance                        | Project Finance / Infrastructure                                    |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Debt basis          | EBITDA multiples, leverage ratio         | DSCR (Debt Service Coverage Ratio), LLCR (Loan Life Coverage Ratio) |
| Cash flow measure   | EBITDA or EBIT                           | CFADS (Cash Flow Available for Debt Service)                        |
| Recourse            | Full recourse to corporate balance sheet | Limited / non-recourse; ring-fenced SPV                             |
| Asset life          | Going concern / perpetuity               | Finite concession (20-50 years)                                     |
| Terminal value      | Perpetuity growth model or exit multiple | Typically zero or concession end-value only                         |
| Interest tax shield | WACC adjustment                          | Less relevant; SPV often structures to minimize taxable income      |
| Lender covenants    | Net leverage, interest coverage          | DSCR floor (e.g., 1.15x-1.40x), LLCR floor, PLCR                    |
| Equity returns      | IRR to exit                              | Equity IRR over concession life; dividend yield analysis            |

**DSCR Mechanics (critical for infrastructure lender modeling):**

```
CFADS (t) = Revenue (t) - Opex (t) - Taxes (t) - Capex in period (t) +/- Working Capital (t)
DSCR (t) = CFADS (t) / Debt Service (t)
Debt Service = Scheduled Principal Repayment (t) + Cash Interest (t)

[Note: cash sweeps / voluntary prepayments excluded from denominator]
```

**Minimum DSCR thresholds by infrastructure sub-sector:**

- Toll roads (greenfield): 1.35x - 1.50x
- Toll roads (brownfield, established traffic): 1.20x - 1.30x
- Regulated utilities: 1.10x - 1.20x (low risk, regulatory backstop)
- Airports: 1.25x - 1.40x (depends on traffic diversification)
- Renewables (contracted): 1.15x - 1.25x

**Lender Case Modeling:**
Infrastructure debt lenders always require a dedicated "Lender Case" or "Bank Case" model that applies:

- Downside traffic/volume adjustments (P90 scenario vs. base P50)
- Capex stress (10-20% cost overrun assumption)
- Interest rate sensitivity (floating rate debt with rate caps)
- Inflation sensitivity (CPI-linked revenues vs. fixed cost base)
- Covenant headroom analysis (DSCR over time with minimum buffer)

The typical scenario stack in infrastructure M&A:

1. **Base Case**: Management projections, consultant-verified assumptions
2. **Upside Case**: Favorable regulatory outcome, traffic outperformance
3. **Downside Case**: Traffic/volume miss, capex overrun, regulatory reset below expectation
4. **Lender / Bank Case**: Conservative P90 traffic, higher capex, used to size debt
5. **Economic Shock Case**: Recession scenario (COVID-type demand shock), stress tests debt covenants
6. **Regulatory Reset Case**: Adverse regulatory determination (low WACC, high depreciation requirement)

---

## Section 4: VC-Specific Modeling

### Cap Table Structure and Waterfall Mechanics

A complete VC cap table tracks ownership through every round. The key structural elements that must be modeled:

**Share Classes (typical order of seniority in liquidation):**

1. Senior Preferred (most recent round, often highest preference)
2. Series B Preferred
3. Series A Preferred
4. Seed / Convertible Note converts
5. Common (founders, employees, advisors)
6. Option Pool (ESOP / ESSP)

**Anti-Dilution Provisions:**

_Full Ratchet_: If a down round occurs, earlier investors' conversion price resets to the new lower price. Maximally punitive for founders and common holders. Example: Series A invested at $2/share; down round at $1/share; Series A converts as if they paid $1/share.

_Broad-Based Weighted Average_ (most common in practice):

```
New Conversion Price = Old Conversion Price x (A + B) / (A + C)
Where:
A = Shares outstanding before new issuance (fully diluted)
B = Shares issuable at old price for total new money raised
C = Shares actually issued in new round
```

_Narrow-Based Weighted Average_: Same formula but A = only preferred shares outstanding (excludes common and options). More dilutive to founders than broad-based.

### Liquidation Preference and Participation

**Non-Participating Preferred** (standard in later-stage VC):

- Investor chooses the greater of: (i) liquidation preference (usually 1x invested capital) OR (ii) as-converted equity value
- At high exit multiples, investor converts to common; at low exit multiples, investor takes preference

**Participating Preferred** (more aggressive, seen in down rounds / bridge rounds):

- Investor receives liquidation preference FIRST, then participates pro-rata with common in remaining proceeds
- Effectively double-dips: gets principal back plus upside participation

**Capped Participating Preferred**:

- Participates until total return reaches a cap (e.g., 3x invested), then converts to non-participating
- Creates a kink in the waterfall at the cap multiple

**Waterfall Modeling in Practice:**
For a $50M exit with $10M Series A (1x pref, non-participating) and $5M Seed (1x pref, participating, 2x cap):

```
Step 1: Seed gets $5M preference (1x)
Step 2: Series A compares $10M preference vs. as-converted value
Step 3: Remaining $35M distributes to common + Seed (participating) on pro-rata basis
Step 4: Check if Seed has hit 2x cap ($10M total); if yes, stops participating
```

### Option Pool Mechanics

**Pre-Money vs. Post-Money Option Pool:**

- Investors typically require option pool expansion BEFORE their investment is priced
- Pre-money option pool: dilution borne by existing shareholders (founders)
- Post-money option pool: dilution borne by all including new investor

**Option Pool Sizing:**

- Pre-seed to seed: 10-15% post-money fully diluted
- Seed to Series A: refreshed to 15-20% post-money
- Series A to B: typically refreshed to 10-15% (lower because team largely in place)

**Key interview questions (VC modeling):**

- "A startup raises a $5M Series A at a $20M pre-money valuation with a 15% option pool refresh. What is the effective pre-money valuation for the founders?"
- "Explain the difference between full ratchet and broad-based weighted average anti-dilution."
- "A company has two series of participating preferred with different liquidation multiples. Construct the waterfall for a $30M exit."
- "If the option pool is set pre-money, who bears the dilution?"
- "What is the difference between a SAFE and a priced round, and how do conversion mechanics differ?"
- "Model the impact of a 1x non-participating vs. 1x participating preferred on founder economics at 2x, 3x, and 5x exit multiples."

---

## Section 5: Features That Make FundSim a Must-Have for Finance Interviews

### Interview Prep Feature Architecture

**1. Timed Model Tests with Structured Formats**

Three time formats mirroring real interview conditions:

- **Paper LBO Mode (15-20 min)**: No Excel. Guided mental math flow with input boxes. Candidate enters assumptions step by step (entry EV, equity check, revenue CAGR, EBITDA exit, debt paydown). System scores accuracy of final IRR/MoM vs. "correct" answer. Shows step-by-step solution with explanation.
- **Standard Model Test (60-90 min)**: Full model build inside FundSim's interface. Pre-populated historical financials provided. Candidate builds Sources & Uses, debt schedule, FCF, and returns table from scratch. Timer visible. Model is auto-graded on formula logic, structural correctness, and final output accuracy.
- **Full Deal Model Test (3 hours)**: Blank model. Candidate builds everything. Case study PDF provided (company description, financial data, deal terms). Full solution walkthrough afterward with side-by-side comparison.

**2. Common Interview Question Bank**

Organized by deal type and topic:

- IB Technical: 3-statement linkages, DCF mechanics, accretion/dilution
- LBO: Paper LBO questions, debt schedule mechanics, IRR drivers
- PE: GP/LP economics, waterfall, carry calculation, portfolio construction
- VC: Cap table, anti-dilution, liquidation preference, SAFE mechanics
- Infrastructure: RAB, DSCR, project finance vs. corporate finance
- Credit: DSCR, ICR, leverage ratios, covenant headroom

Each question includes: answer framework, common mistakes, follow-up questions, and a related model exercise.

**3. Benchmarking and Scoring Engine**

When a candidate completes a model test:

- **Formula Accuracy Score**: Percentage of cells with correct formula logic (not just correct values)
- **Structural Score**: Are the right tabs present? Are inputs separated from calculations? Is there a balance sheet check?
- **Output Accuracy Score**: How close is the final IRR/MoM/EPS accretion to the correct answer?
- **Speed Percentile**: Where the candidate ranks against all users who completed the same test
- **Error Taxonomy**: Specific list of errors made, mapped to the "common errors" database
- **Skill Gap Map**: Radar chart showing strength/weakness across: debt scheduling, FCF build, terminal value, scenario analysis, merger mechanics, waterfall

**4. Mock Case Study Generator**

Parameterized case study generator with configurable inputs:

- Industry (TMT, healthcare, industrials, infrastructure, consumer, financial services)
- Deal type (LBO, M&A, minority growth equity, infrastructure concession, VC)
- Complexity (basic, intermediate, advanced)
- Time limit (30 min, 60 min, 3 hours)
- Specific mechanics to test (e.g., "include PIK toggle debt, revenue earn-out, management rollover")

Generator produces: company description, last 3 years of financials, deal term sheet, and a list of specific questions to answer. Seeded from a library of 50+ realistic fictional companies across sectors.

**5. Scenario Comparison Mode (High Priority - IB-Specific)**

Side-by-side display of up to 5 scenarios (Base, High, Low, Lender Case, Economic Shock):

- Key metrics comparison table: Revenue CAGR, EBITDA margin, FCF yield, Net Leverage, IRR, EV, Equity Value per share
- Waterfall charts showing how assumptions flow to returns in each scenario
- Tornado chart showing which single assumption has the largest impact on IRR
- Correlation matrix of key assumptions
- Lender case specifically: auto-applies conservative adjustments (volume -10%, capex +15%, interest rate +100bps) with toggle to customize

---

## Section 6: Excel Export and Download Features

### What Employers Actually Test in Excel

Finance employers do not just test whether candidates know the answers. They test whether candidates can build audit-ready, navigable, professional Excel models. Specific skills tested:

- **Hotkeys**: Can the candidate navigate without a mouse? (Ctrl+Arrow, F2, F4, Ctrl+Shift+End)
- **Formula structure**: Are inputs blue, formulas black, external links green (standard color convention)?
- **Name Manager / Named Ranges**: Used for key assumptions so formulas read as `=Revenue_Growth` not `=$B$14`
- **INDEX-MATCH vs. VLOOKUP**: Employers at top firms consider VLOOKUP a red flag (brittle, slow)
- **Data Tables**: Can candidate build a two-variable sensitivity table using Excel's native Data Table function?
- **XIRR vs. IRR**: Does candidate know when to use XIRR (irregular cash flow timing)? Almost always the correct answer in PE.
- **Circular reference handling**: Can candidate set up iterative calculation mode and understand the risk?
- **Conditional formatting for error checks**: Balance sheet check cell that turns red if Assets ≠ L+E

### Excel Export Feature Requirements

**Priority 1: Full XLSX with Formulas (highest practitioner demand)**

- Export the entire FundSim model to a properly formatted Excel workbook
- Color coding: inputs (blue font), formulas (black font), hardcoded constants (red - to be reviewed)
- Tab structure mirrors real IB model architecture (Cover, Assumptions, IS, BS, CF, Debt Schedule, Returns, Scenarios, Sensitivity)
- Formulas must be live (not static values) so the interviewer can audit the logic
- Named ranges for all key assumptions
- Balance sheet check row included
- Model version and date stamped in Cover tab
- The XLSX should be immediately usable as a take-home test submission

**Priority 2: PDF Tearsheet / Summary Report**

- One-page executive summary: deal overview, key assumptions, returns summary, scenario comparison
- Football field valuation chart (horizontal bar chart showing valuation range by methodology)
- Waterfall chart (equity value bridge from entry to exit)
- J-curve chart for PE/infrastructure
- Suitable for attaching to pitch decks or using as a leave-behind in interviews

**Priority 3: Assumptions Audit Report**

- CSV or formatted PDF listing every assumption used in the model
- Source attribution (e.g., "Company guidance," "Industry benchmark," "Analyst estimate")
- Sensitivity rank: which assumptions have the highest impact on IRR (based on one-at-a-time perturbation)
- Useful for deal committee presentations and lender due diligence

**Priority 4: Scenario Comparison Export**

- Excel workbook with one tab per scenario, plus a Summary tab comparing all scenarios side by side
- Automatically populated when user has run multiple scenarios in FundSim
- Color-coded to highlight where scenarios diverge most significantly

### What Employers Expect Candidates to Demonstrate in Excel

Synthesized from employer assessments and IB recruiting forums:

1. **Model from blank in under 2 hours** for a standard LBO (entry EV up to returns)
2. **No hardcoded numbers in formula cells** (all inputs in a dedicated assumptions section)
3. **Formulas that work when rows are inserted or deleted** (no fixed row references that break)
4. **Logical tab flow** left to right: Inputs -> Operating Model -> Financing -> Returns -> Scenarios
5. **Output that is immediately readable** by a senior banker without explanation
6. **Scenarios that toggle via a single dropdown cell** (not multiple manual changes)
7. **Error checks included** (balance sheet check, cash flow reconciliation)
8. **Consistent treatment of time conventions** (beginning-of-period vs. end-of-period discounting; mid-year convention for DCF)

---

## Consolidated Feature Recommendations for FundSim

### Immediate Priority (Highest ROI for Interview Prep Users)

| Feature                                                                | Justification                                                                                                  | Complexity |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| Scenario comparison panel (Base/Upside/Downside/Lender/Economic Shock) | IB practitioner feedback; standard in every pitchbook                                                          | Medium     |
| XLSX export with live formulas and IB color coding                     | Most-requested practitioner feature; differentiates from static simulators                                     | High       |
| Timed model test mode (15/60/180 min variants)                         | Mirror real interview conditions; highest engagement driver                                                    | Medium     |
| Paper LBO mode with scoring                                            | Tested at virtually every PE first round; no direct competitor offers this interactively                       | Low        |
| Common errors detection engine                                         | Auto-flag mistakes (wrong WC sign, hardcoded cells, broken balance sheet) against known student error database | High       |

### Next Priority (Domain-Specific Depth)

| Feature                                                                                      | Justification                                                                          | Complexity |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| Infrastructure-specific model template (RAB roll-forward, DSCR, CFADS, concession waterfall) | Significant underserved market; practitioners have no good simulator for this          | High       |
| GP/LP waterfall calculator (American vs. European, catch-up, clawback)                       | Tested in every PE interview; calculators exist but none are interactive + educational | Medium     |
| VC cap table with anti-dilution, participating preferred, option pool                        | Complex mechanics; students consistently mismodel these                                | Medium     |
| IRR attribution waterfall (EBITDA growth vs. multiple expansion vs. leverage)                | Standard in PE investment committee; not modeled in any simulator                      | Medium     |
| Lender case auto-generator (apply conservative inputs on top of base case)                   | Addresses infrastructure practitioner feedback directly                                | Low        |

### Strategic Differentiators (Long-Term)

| Feature                                                                                       | Justification                                                                      | Complexity |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| Mock case study generator with parameterized industries and deal types                        | Creates infinite practice material; drives repeat engagement                       | High       |
| Benchmarking and scoring engine with skill gap radar chart                                    | Makes progress visible; drives subscription retention                              | High       |
| Interview question bank with model-linked exercises                                           | Contextualizes model mechanics to real interview context                           | Medium     |
| Specialist advisory input simulators (traffic advisor, regulatory advisor) for infrastructure | Unique to infrastructure M&A; no competitor has this                               | Very High  |
| PDF tearsheet / football field valuation export                                               | Polishes output to pitch-deck quality; useful for portfoilio presentation practice | Medium     |

---

## Infrastructure-Specific Feature Detail (Expanded for Reviewer's Domain)

Given the practitioner feedback that infrastructure deals derive 80% of value from above-EBITDA inputs, FundSim should build a dedicated infrastructure module with:

**1. Traffic / Volume Forecast Module**

- Input: Base traffic (vehicles/day or passengers/year), elasticity to GDP, ramp-up curve (years 1-5 typically below steady state)
- Output: Annual traffic volumes, toll revenue (volume x real toll rate x CPI escalator)
- P50 vs. P90 toggle (P90 = pessimistic 90th percentile outcome, used by lenders)
- Comparison of consultant scenarios side by side

**2. RAB Model**

- Opening RAB input
- Annual capex input (regulatory allowed vs. actual)
- Regulatory depreciation (straight-line over regulatory asset life)
- CPI/RPI indexation input
- Allowed WACC input (set by regulator)
- Outputs: closing RAB each year, regulatory allowed revenue, actual vs. allowed revenue gap

**3. DSCR Dashboard**

- CFADS build (automated from operating model)
- Debt service schedule (principal + interest each period)
- Annual DSCR, average DSCR over loan life (ADSCR), LLCR
- Red/amber/green traffic light against covenant thresholds
- Lock-up and default trigger visualization
- Debt sizing calculator: given minimum DSCR, what is maximum debt capacity?

**4. Concession Waterfall**

- Model cash distributions from SPV to equity investors across concession life
- Distributions constrained by: DSCR lock-up, reserve account funding requirements, lender consent
- Equity IRR over concession life (not just to arbitrary exit)
- Refinancing scenario: what happens to equity IRR if debt is refinanced in year 7?

**5. Scenario Stack (Infrastructure-Specific)**

- Base Case (P50 traffic, base WACC, base capex)
- Upside Case (P30 traffic, favorable regulatory reset)
- Downside Case (P70 traffic, capex overrun +15%)
- Lender / Bank Case (P90 traffic, capex +20%, interest rate +100bps)
- Economic Shock Case (traffic -30% for 2 years recovering over 3 years, modeled as COVID-type event)
- Regulatory Adverse Case (WACC cut by 50bps, depreciation life shortened)

---

## Data Sources and Benchmarks Used in This Research

**Interview question banks and model mechanics:**

- Wall Street Prep (wallstreetprep.com) - industry standard for IB/PE training
- Breaking Into Wall Street (breakingintowallstreet.com) - LBO and VC modeling courses
- Mergers & Inquisitions (mergersandinquisitions.com) - 3-statement model structure
- Financial Edge (fe.training) - financial modeling errors and DSCR
- Peak Frameworks (peakframeworks.com) - paper LBO methodology

**Infrastructure-specific:**

- Banyan Infrastructure - DSCR project finance mechanics
- Wall Street Prep - debt sizing in project finance
- OECD / ITF - RAB vs. project finance comparative analysis
- Iberdrola / GIIA - RAB model structure
- financial-modeling.com - infrastructure DCF for regulated utilities

**PE/VC mechanics:**

- Allied Venture Partners - liquidation preference modeling
- Carta - distribution waterfall mechanics
- Alter Domus - PE waterfall, GP/LP structures
- Ropes & Gray - waterfall legal structure

**Common errors and employer expectations:**

- Wall Street Oasis forums - practitioner-reported common mistakes
- Alpha Apex Group - financial modeling error taxonomy
- CFI (corporatefinanceinstitute.com) - DCF error analysis
- TestGorilla - employer assessment expectations

---

_Report prepared for FundSim (fundsimulate.com) product development._
_Research date: April 29, 2026._
