import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IBLanding } from "./IBLanding";

// ─── Theme ────────────────────────────────────────────────────────────────────
const A = {
  primary: "#B45309",
  light: "#F59E0B",
  dim: "rgba(245,158,11,0.12)",
  border: "rgba(245,158,11,0.25)",
  glow: "rgba(245,158,11,0.3)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId =
  | "setup"
  | "valuation"
  | "offer"
  | "accretion"
  | "synergies"
  | "credit"
  | "returns"
  | "contribution"
  | "score"
  | "glossary";

interface DealInputs {
  // Acquirer
  acqName: string;
  acqRevenue: number;
  acqEBITDA: number;
  acqNI: number;
  acqShares: number;
  acqPrice: number;
  acqNetDebt: number;
  // Target
  tgtName: string;
  tgtRevenue: number;
  tgtEBITDA: number;
  tgtNI: number;
  tgtShares: number;
  tgtPrice: number;
  tgtNetDebt: number;
  tgtFCF: number; // Target free cash flow ($M)
  // Deal parameters
  sector: string;
  dealType: string;
  offerPremium: number;
  cashPct: number;
  debtRate: number;
  // Advanced deal terms
  transactionFees: number; // % of deal value (advisory + financing)
  earnoutAmount: number; // Contingent consideration ($M)
  breakupFee: number; // Termination fee ($M)
  managementRollover: number; // % of target equity rolling (MBO)
  minorityStakePct: number; // % stake acquired (minority deals)
  // LBO / Credit
  seniorLeverage: number; // Senior debt as x EBITDA
  mezzLeverage: number; // Mezz debt as x EBITDA
  seniorRate: number; // Senior debt interest rate %
  mezzRate: number; // Mezz interest rate %
  revolver: number; // Revolver availability ($M)
  holdPeriod: number; // LBO hold period (years)
  exitMultipleOverride: number; // Override exit EBITDA multiple (0 = use comps)
  noBalance: number; // NOL carryforward balance ($M)
  // DCF / Valuation
  costSynergies: number;
  revSynergies: number;
  wacc: number;
  revenueGrowth: number;
  terminalGrowth: number;
  ebitdaMarginPct: number;
  capexPct: number;
  taxRate: number;
}

// ─── Default extra fields ─────────────────────────────────────────────────────
const DEAL_DEFAULTS = {
  tgtFCF: 0,
  transactionFees: 1.5,
  earnoutAmount: 0,
  breakupFee: 0,
  managementRollover: 0,
  minorityStakePct: 100,
  seniorLeverage: 4.0,
  mezzLeverage: 1.5,
  seniorRate: 6.5,
  mezzRate: 10.5,
  revolver: 50,
  holdPeriod: 5,
  exitMultipleOverride: 0,
  noBalance: 0,
};

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS: Record<string, DealInputs> = {
  tech: {
    ...DEAL_DEFAULTS,
    acqName: "NovaSphere",
    acqRevenue: 5000,
    acqEBITDA: 1500,
    acqNI: 900,
    acqShares: 500,
    acqPrice: 80,
    acqNetDebt: 2000,
    tgtName: "CloudAxis",
    tgtRevenue: 800,
    tgtEBITDA: 200,
    tgtNI: 120,
    tgtShares: 100,
    tgtPrice: 45,
    tgtNetDebt: 300,
    tgtFCF: 130,
    sector: "tech",
    dealType: "strategic",
    offerPremium: 35,
    cashPct: 60,
    debtRate: 6,
    costSynergies: 40,
    revSynergies: 30,
    wacc: 10,
    revenueGrowth: 15,
    terminalGrowth: 3,
    ebitdaMarginPct: 25,
    capexPct: 5,
    taxRate: 25,
    breakupFee: 120,
    transactionFees: 1.5,
  },
  biotech: {
    ...DEAL_DEFAULTS,
    acqName: "OmegaPharma",
    acqRevenue: 12000,
    acqEBITDA: 4000,
    acqNI: 2800,
    acqShares: 800,
    acqPrice: 120,
    acqNetDebt: 5000,
    tgtName: "ViriGen",
    tgtRevenue: 1200,
    tgtEBITDA: 280,
    tgtNI: 180,
    tgtShares: 150,
    tgtPrice: 60,
    tgtNetDebt: 400,
    tgtFCF: 170,
    sector: "healthcare",
    dealType: "strategic",
    offerPremium: 55,
    cashPct: 50,
    debtRate: 5,
    costSynergies: 80,
    revSynergies: 50,
    wacc: 9,
    revenueGrowth: 12,
    terminalGrowth: 3,
    ebitdaMarginPct: 22,
    capexPct: 6,
    taxRate: 21,
    breakupFee: 280,
    transactionFees: 1.2,
  },
  lbo: {
    ...DEAL_DEFAULTS,
    acqName: "Cascade Capital",
    acqRevenue: 0,
    acqEBITDA: 0,
    acqNI: 0,
    acqShares: 0,
    acqPrice: 0,
    acqNetDebt: 0,
    tgtName: "Ridgemont Industrial",
    tgtRevenue: 600,
    tgtEBITDA: 150,
    tgtNI: 80,
    tgtShares: 80,
    tgtPrice: 30,
    tgtNetDebt: 200,
    tgtFCF: 100,
    sector: "industrial",
    dealType: "financial",
    offerPremium: 30,
    cashPct: 100,
    debtRate: 7,
    costSynergies: 20,
    revSynergies: 10,
    wacc: 12,
    revenueGrowth: 5,
    terminalGrowth: 2,
    ebitdaMarginPct: 24,
    capexPct: 4,
    taxRate: 25,
    seniorLeverage: 4.5,
    mezzLeverage: 1.5,
    seniorRate: 7.0,
    mezzRate: 11.5,
    holdPeriod: 5,
    revolver: 75,
    transactionFees: 2.0,
  },
  hostile: {
    ...DEAL_DEFAULTS,
    acqName: "Apex Corp",
    acqRevenue: 18000,
    acqEBITDA: 4500,
    acqNI: 3000,
    acqShares: 1200,
    acqPrice: 95,
    acqNetDebt: 6000,
    tgtName: "Summit Media",
    tgtRevenue: 3200,
    tgtEBITDA: 720,
    tgtNI: 420,
    tgtShares: 280,
    tgtPrice: 52,
    tgtNetDebt: 800,
    tgtFCF: 480,
    sector: "consumer",
    dealType: "hostile",
    offerPremium: 42,
    cashPct: 100,
    debtRate: 5.5,
    costSynergies: 120,
    revSynergies: 60,
    wacc: 9,
    revenueGrowth: 7,
    terminalGrowth: 2.5,
    ebitdaMarginPct: 22,
    capexPct: 5,
    taxRate: 25,
    breakupFee: 220,
    transactionFees: 1.8,
  },
  spac: {
    ...DEAL_DEFAULTS,
    acqName: "Vantage Acquisition Corp",
    acqRevenue: 0,
    acqEBITDA: 0,
    acqNI: 0,
    acqShares: 200,
    acqPrice: 10,
    acqNetDebt: -400,
    tgtName: "EcoCharge EV",
    tgtRevenue: 180,
    tgtEBITDA: -20,
    tgtNI: -35,
    tgtShares: 120,
    tgtPrice: 0,
    tgtNetDebt: 50,
    tgtFCF: -30,
    sector: "tech",
    dealType: "spac",
    offerPremium: 20,
    cashPct: 100,
    debtRate: 8,
    costSynergies: 0,
    revSynergies: 40,
    wacc: 14,
    revenueGrowth: 80,
    terminalGrowth: 4,
    ebitdaMarginPct: 18,
    capexPct: 12,
    taxRate: 21,
    transactionFees: 3.5,
    earnoutAmount: 150,
  },
  carveout: {
    ...DEAL_DEFAULTS,
    acqName: "StrategicCo",
    acqRevenue: 22000,
    acqEBITDA: 5500,
    acqNI: 3800,
    acqShares: 900,
    acqPrice: 110,
    acqNetDebt: 4000,
    tgtName: "DataPro Division",
    tgtRevenue: 1400,
    tgtEBITDA: 340,
    tgtNI: 200,
    tgtShares: 0,
    tgtPrice: 0,
    tgtNetDebt: 100,
    tgtFCF: 240,
    sector: "tech",
    dealType: "carveout",
    offerPremium: 20,
    cashPct: 100,
    debtRate: 5.8,
    costSynergies: 90,
    revSynergies: 70,
    wacc: 10,
    revenueGrowth: 12,
    terminalGrowth: 3,
    ebitdaMarginPct: 24,
    capexPct: 4,
    taxRate: 25,
    transactionFees: 1.8,
    earnoutAmount: 100,
  },
  distressed: {
    ...DEAL_DEFAULTS,
    acqName: "Phoenix Capital",
    acqRevenue: 0,
    acqEBITDA: 0,
    acqNI: 0,
    acqShares: 0,
    acqPrice: 0,
    acqNetDebt: 0,
    tgtName: "RidgeRetail Corp",
    tgtRevenue: 2800,
    tgtEBITDA: 180,
    tgtNI: -120,
    tgtShares: 400,
    tgtPrice: 3,
    tgtNetDebt: 1400,
    tgtFCF: 60,
    sector: "consumer",
    dealType: "distressed",
    offerPremium: 35,
    cashPct: 100,
    debtRate: 9,
    costSynergies: 140,
    revSynergies: 20,
    wacc: 13,
    revenueGrowth: 3,
    terminalGrowth: 1.5,
    ebitdaMarginPct: 10,
    capexPct: 3,
    taxRate: 0,
    noBalance: 800,
    transactionFees: 2.5,
    seniorLeverage: 3.0,
    mezzLeverage: 1.0,
    seniorRate: 9.5,
    mezzRate: 14.0,
  },
  mbo: {
    ...DEAL_DEFAULTS,
    acqName: "Apex Partners + Mgmt",
    acqRevenue: 0,
    acqEBITDA: 0,
    acqNI: 0,
    acqShares: 0,
    acqPrice: 0,
    acqNetDebt: 0,
    tgtName: "NexGen Software",
    tgtRevenue: 480,
    tgtEBITDA: 145,
    tgtNI: 90,
    tgtShares: 60,
    tgtPrice: 38,
    tgtNetDebt: 80,
    tgtFCF: 105,
    sector: "tech",
    dealType: "mbo",
    offerPremium: 28,
    cashPct: 100,
    debtRate: 7.5,
    costSynergies: 15,
    revSynergies: 20,
    wacc: 12,
    revenueGrowth: 10,
    terminalGrowth: 3,
    ebitdaMarginPct: 30,
    capexPct: 3,
    taxRate: 25,
    managementRollover: 15,
    seniorLeverage: 4.5,
    mezzLeverage: 1.5,
    seniorRate: 7.5,
    mezzRate: 12.0,
    holdPeriod: 4,
    transactionFees: 2.2,
  },
  crossborder: {
    ...DEAL_DEFAULTS,
    acqName: "US MedTech Inc",
    acqRevenue: 8500,
    acqEBITDA: 2200,
    acqNI: 1500,
    acqShares: 600,
    acqPrice: 88,
    acqNetDebt: 3000,
    tgtName: "EuroBio GmbH",
    tgtRevenue: 920,
    tgtEBITDA: 230,
    tgtNI: 145,
    tgtShares: 110,
    tgtPrice: 58,
    tgtNetDebt: 180,
    tgtFCF: 165,
    sector: "healthcare",
    dealType: "crossborder",
    offerPremium: 40,
    cashPct: 70,
    debtRate: 5.2,
    costSynergies: 60,
    revSynergies: 80,
    wacc: 9.5,
    revenueGrowth: 11,
    terminalGrowth: 3,
    ebitdaMarginPct: 25,
    capexPct: 5,
    taxRate: 22,
    transactionFees: 2.0,
    breakupFee: 180,
  },
  minority: {
    ...DEAL_DEFAULTS,
    acqName: "General Atlantic",
    acqRevenue: 0,
    acqEBITDA: 0,
    acqNI: 0,
    acqShares: 0,
    acqPrice: 0,
    acqNetDebt: 0,
    tgtName: "FastPay Fintech",
    tgtRevenue: 320,
    tgtEBITDA: 55,
    tgtNI: 30,
    tgtShares: 200,
    tgtPrice: 18,
    tgtNetDebt: -40,
    tgtFCF: 35,
    sector: "tech",
    dealType: "minority",
    offerPremium: 25,
    cashPct: 100,
    debtRate: 8,
    costSynergies: 0,
    revSynergies: 30,
    wacc: 13,
    revenueGrowth: 40,
    terminalGrowth: 4,
    ebitdaMarginPct: 20,
    capexPct: 3,
    taxRate: 25,
    minorityStakePct: 30,
    transactionFees: 1.0,
  },
};

// ─── Glossary ─────────────────────────────────────────────────────────────────
const GLOSSARY = [
  {
    term: "Accretion",
    def: "When a deal increases the acquirer's EPS after closing. The opposite of dilution. Deals are accretive when the target's earnings yield exceeds the cost of financing.",
  },
  {
    term: "Break-Up Fee",
    def: "A fee paid by one party if the deal falls apart — usually 1–3% of deal value. Protects the other side from wasted due diligence costs.",
  },
  {
    term: "Capex (Capital Expenditure)",
    def: "Cash spent on buying or upgrading physical assets. Subtracted from EBITDA when calculating free cash flow.",
  },
  {
    term: "Comparable Company Analysis (Comps)",
    def: "Values a company by applying EV/EBITDA or P/E multiples from publicly traded peers. Fast but sensitive to current market conditions.",
  },
  {
    term: "Control Premium",
    def: "The extra price paid above the current stock price to acquire a controlling stake. Typically 20–40% for strategic buyers, higher in contested auctions.",
  },
  {
    term: "Cost Synergies",
    def: "Expense reductions from eliminating redundant functions, combining procurement, or rationalizing facilities. Typically 2–5% of combined revenue.",
  },
  {
    term: "D&A Step-Up",
    def: "In an acquisition, assets are revalued to fair value. The additional depreciation/amortization reduces post-close earnings and must be modeled in accretion/dilution.",
  },
  {
    term: "DCF (Discounted Cash Flow)",
    def: "Values a company by projecting future free cash flows (FCFF) and discounting them back to present value using WACC. More precise but highly sensitive to assumptions.",
  },
  {
    term: "Dilution",
    def: "When a deal decreases the acquirer's EPS after closing. Common in all-stock deals where the acquirer's P/E is lower than the target's implied P/E.",
  },
  {
    term: "EBITDA",
    def: "Earnings Before Interest, Taxes, Depreciation & Amortization. A proxy for operating cash flow and the most common base for M&A valuation multiples.",
  },
  {
    term: "Enterprise Value (EV)",
    def: "Market cap + net debt + preferred equity + minority interest. Represents the total cost to acquire a business, independent of its capital structure.",
  },
  {
    term: "EPS (Earnings Per Share)",
    def: "Net income divided by diluted shares outstanding. The primary metric for accretion/dilution analysis in M&A.",
  },
  {
    term: "Equity Value",
    def: "Share price × shares outstanding. What shareholders own. Derived from EV by subtracting net debt.",
  },
  {
    term: "EV/EBITDA Multiple",
    def: "Enterprise Value divided by EBITDA. The most common M&A multiple: tech 15–25x, healthcare 12–18x, industrial 8–12x, consumer 10–14x.",
  },
  {
    term: "Exchange Ratio",
    def: "In a stock deal, the number of acquirer shares offered per target share. Calculated as: Offer Price ÷ Acquirer Stock Price.",
  },
  {
    term: "Fairness Opinion",
    def: "A formal document from an investment bank stating the deal price is fair from a financial standpoint. Required by most public company boards.",
  },
  {
    term: "FCFF (Free Cash Flow to Firm)",
    def: "Cash flow available to all capital providers. FCFF = EBIT(1 – tax rate) + D&A – Capex – Change in NWC.",
  },
  {
    term: "Financial Buyer",
    def: "A private equity firm or investor that acquires a company primarily to generate a financial return, typically through an LBO, over a 3–7 year hold period.",
  },
  {
    term: "Football Field Chart",
    def: "A horizontal bar chart showing valuation ranges from multiple methods (DCF, comps, precedents, LBO) side by side. The standard IB valuation summary output.",
  },
  {
    term: "Goodwill",
    def: "The excess of the purchase price over the fair value of net identifiable assets acquired. Recorded on the balance sheet and tested annually for impairment.",
  },
  {
    term: "Hostile Takeover",
    def: "An acquisition attempt made directly to shareholders without board approval. Usually triggers a bidding war or defensive measures like a poison pill.",
  },
  {
    term: "Interest Coverage Ratio",
    def: "EBITDA ÷ Interest Expense. Measures a company's ability to service debt. Lenders typically require > 2x; investment grade targets > 4x.",
  },
  {
    term: "IRR (Internal Rate of Return)",
    def: "The annualized return on an investment. PE funds target 20–30% IRR in LBOs over a 5-year hold. The rate at which NPV = 0.",
  },
  {
    term: "LBO (Leveraged Buyout)",
    def: "A private equity acquisition funded mostly with debt. Returns come from debt paydown (deleveraging), EBITDA growth, and multiple expansion at exit.",
  },
  {
    term: "Leverage Ratio",
    def: "Total Debt ÷ EBITDA. A key metric in deal financing. <3x is investment grade; 4–6x is typical leveraged; >6x is highly leveraged (LBO territory).",
  },
  {
    term: "MOIC (Multiple on Invested Capital)",
    def: "Exit equity value ÷ initial equity invested. A 2.5x MOIC over 5 years ≈ 20% IRR. PE funds target 2.5–3.5x in LBOs.",
  },
  {
    term: "Net Debt",
    def: "Total financial debt minus cash and cash equivalents. Added to equity value to get enterprise value. A negative net debt means the company has more cash than debt.",
  },
  {
    term: "Net Working Capital (NWC)",
    def: "Current assets minus current liabilities (excluding cash and debt). Changes in NWC affect free cash flow — growing companies typically consume NWC.",
  },
  {
    term: "NOPAT",
    def: "Net Operating Profit After Tax. EBIT × (1 – tax rate). The starting point for FCFF — measures operating earnings available to all capital providers.",
  },
  {
    term: "Offer Premium",
    def: "The percentage above the target's current stock price that the acquirer pays. Typical range: 20–50%. Too low = deal rejection; too high = destroys acquirer value.",
  },
  {
    term: "P/E Multiple",
    def: "Price-to-Earnings ratio. Key in accretion/dilution: if the acquirer's P/E > target's implied acquisition P/E, a stock deal is accretive.",
  },
  {
    term: "Poison Pill",
    def: "A shareholder rights plan triggered when a raider acquires a large stake, allowing other shareholders to buy more shares cheaply — diluting the raider.",
  },
  {
    term: "Precedent Transactions",
    def: "Values a company using multiples paid in past M&A deals. Includes a control premium over public comps. More relevant than comps for deal pricing.",
  },
  {
    term: "Pro Forma",
    def: "Projected financial statements combining two companies as if the deal had already closed, including synergies, financing costs, and D&A step-ups.",
  },
  {
    term: "Purchase Price Allocation (PPA)",
    def: "After closing, the deal price is allocated to acquired assets and liabilities at fair value. The excess becomes goodwill on the balance sheet.",
  },
  {
    term: "Revenue Synergies",
    def: "Additional revenue from cross-selling, expanded distribution, or new products post-merger. Harder to achieve than cost synergies and often discounted 50% by analysts.",
  },
  {
    term: "Run-Rate",
    def: "Annualized version of a shorter period's financials. e.g., Q1 EBITDA × 4 = run-rate annual EBITDA. Used to estimate synergies at full implementation.",
  },
  {
    term: "Strategic Buyer",
    def: "A company in the same or adjacent industry acquiring a target for operational reasons (market share, technology, talent) rather than purely financial returns.",
  },
  {
    term: "Synergies",
    def: "Value created by combining two companies — either cost savings (G&A, headcount, procurement) or revenue gains (cross-selling, new markets, pricing power).",
  },
  {
    term: "Terminal Value",
    def: "The present value of all cash flows beyond the explicit forecast period. Often 60–80% of total DCF value. TV = FCF(1+g) ÷ (WACC – g) using Gordon Growth Model.",
  },
  {
    term: "Tuck-In Acquisition",
    def: "A small bolt-on deal where a larger company acquires a smaller one for a specific product, geography, or team. Usually strategic with high premiums.",
  },
  {
    term: "WACC",
    def: "Weighted Average Cost of Capital. The blended discount rate = Cost of Equity × (E/V) + Cost of Debt × (D/V) × (1 – tax). Used to discount FCFFs in DCF.",
  },
  {
    term: "Bear Hug Letter",
    def: "A formal takeover offer sent directly to a target's board, often disclosed publicly, that offers a premium so high the board finds it difficult to reject without shareholder backlash.",
  },
  {
    term: "Collar (Deal Collar)",
    def: "A provision in a stock deal that caps and floors the exchange ratio within a band as the acquirer's stock moves. Protects both parties from extreme price swings before closing.",
  },
  {
    term: "Contribution Analysis",
    def: "A table showing what % of combined revenue, EBITDA, and net income each company contributes, vs. the % of equity ownership implied by the deal. Reveals value transfer.",
  },
  {
    term: "Debt Capacity",
    def: "The maximum debt a company can service given its EBITDA and cash flow. Lenders typically allow 4–6x EBITDA in leveraged deals; investment-grade targets 2–3x.",
  },
  {
    term: "Dividend Recapitalization",
    def: "A PE technique where a portfolio company takes on new debt to pay a large dividend to its PE sponsor, returning capital before exit. Increases leverage risk.",
  },
  {
    term: "DSCR (Debt Service Coverage Ratio)",
    def: "EBITDA ÷ (principal + interest). Must exceed 1.0x for a company to service debt; lenders typically require 1.2–1.5x minimum with covenant headroom.",
  },
  {
    term: "Earnout",
    def: "Contingent deal consideration paid to sellers if the target hits agreed milestones post-closing (revenue, EBITDA, clinical trial success). Bridges valuation gaps.",
  },
  {
    term: "FCF Yield",
    def: "Free Cash Flow ÷ Enterprise Value. A key credit metric — higher FCF yield means faster deleveraging. LBO lenders often require > 8–10% FCF yield.",
  },
  {
    term: "Goodwill",
    def: "Purchase price minus fair value of net identifiable assets. Recorded on the balance sheet, tested annually for impairment. Large goodwill balances signal overpayment risk.",
  },
  {
    term: "Management Buyout (MBO)",
    def: "A buyout led by the existing management team, typically with PE backing. Management rolls equity (5–20%) to align incentives, while PE provides most of the capital.",
  },
  {
    term: "Management Rollover",
    def: "Equity contribution from target management in a buyout — managers reinvest a portion of their deal proceeds rather than taking all cash. Typically 5–20% of target equity.",
  },
  {
    term: "Mezz (Mezzanine Debt)",
    def: "Subordinated debt sitting between senior debt and equity in the capital structure. Higher risk (and return) than senior — typically 10–14% interest, often with PIK or warrants.",
  },
  {
    term: "Minority Investment",
    def: "Acquiring less than 50% of a company's equity, typically for growth capital or strategic access. No control premium; investor relies on drag-along and tag-along rights.",
  },
  {
    term: "Net Operating Loss (NOL)",
    def: "Tax losses that can be carried forward to offset future taxable income. Distressed acquisitions often capture significant NOL value, reducing post-acquisition taxes.",
  },
  {
    term: "PIK (Payment in Kind)",
    def: "Interest that accrues and compounds rather than being paid in cash. Used in highly leveraged deals to preserve cash flow. Increases principal over time — very risky.",
  },
  {
    term: "PIPE (Private Investment in Public Equity)",
    def: "A private placement of equity or convertible debt in a public company. Common in SPAC deals — institutional investors commit capital to ensure the deal closes.",
  },
  {
    term: "Revolver (Revolving Credit Facility)",
    def: "A flexible credit line a company draws and repays as needed — like a corporate credit card. Typically the cheapest source of debt; drawn to fund working capital or acquisitions.",
  },
  {
    term: "Sensitivity Analysis",
    def: "Testing how deal outcomes (MOIC, IRR, EPS) change as key assumptions vary (exit multiple, leverage, EBITDA growth). Essential for understanding risk in any transaction.",
  },
  {
    term: "SPAC (Special Purpose Acquisition Company)",
    def: "A shell company that raises capital in an IPO specifically to acquire a private target within ~2 years. The target 'goes public' by merging with the SPAC — bypassing a traditional IPO.",
  },
  {
    term: "Stalking Horse Bid",
    def: "In a bankruptcy auction, the initial bid that sets a floor price. The stalking horse bidder gets deal protections (break-up fee) in exchange for going first.",
  },
  {
    term: "Standstill Agreement",
    def: "A contract preventing a potential acquirer from increasing its stake or making further offers for a set period. Used to control hostile takeover dynamics.",
  },
  {
    term: "Sum-of-the-Parts (SOTP)",
    def: "Values each business segment separately using appropriate multiples, then adds them. Used for conglomerates where different divisions deserve different valuation approaches.",
  },
  {
    term: "Term Loan B (TLB)",
    def: "A senior secured leveraged loan sold to institutional investors (CLOs, hedge funds). Amortizes minimally (1% per year); the dominant debt instrument in LBOs. Floating rate (SOFR+).",
  },
  {
    term: "Toehold",
    def: "A small stake (5–10%) acquired in a target before launching a full bid. Gives the acquirer information, a profit on the toehold if a deal happens, and a head start in contests.",
  },
  {
    term: "Transaction Fees",
    def: "Advisory and financing fees paid to investment banks in M&A deals. Typically 1–2% of deal value for advisory; additional fees for debt financing. A real drag on returns.",
  },
  {
    term: "White Knight",
    def: "A friendly acquirer that saves a company from a hostile takeover by making a more attractive competing bid. The target board supports the white knight over the hostile bidder.",
  },
  {
    term: "Working Capital Adjustment",
    def: "A post-closing adjustment to the purchase price based on the difference between actual and target NWC at closing. Prevents sellers from manipulating cash/payables pre-close.",
  },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "setup", label: "Deal Setup" },
  { id: "valuation", label: "Valuation" },
  { id: "offer", label: "Offer & Structure" },
  { id: "accretion", label: "Accretion / Dilution" },
  { id: "synergies", label: "Synergies" },
  { id: "credit", label: "Credit & Leverage" },
  { id: "returns", label: "Returns" },
  { id: "contribution", label: "Contribution" },
  { id: "score", label: "Deal Score" },
  { id: "glossary", label: "Glossary" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: "#111827", border: "1px solid #1F2937", ...style }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif mb-1"
      style={{ fontSize: "22px", color: "#F9FAFB" }}
    >
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
      {children}
    </p>
  );
}

function AmberBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{
        background: A.dim,
        color: A.light,
        border: `1px solid ${A.border}`,
        fontFamily: "monospace",
      }}
    >
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="text-xs mb-1 font-medium"
        style={{ color: "#6B7280", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      <div
        className="text-xl font-bold font-serif"
        style={{ color: color ?? A.light }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  score,
  max,
  color,
}: {
  label: string;
  score: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm" style={{ color: "#D1D5DB" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {Math.round(score)} / {max} pts
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "#1F2937" }}>
        <motion.div
          className="h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  prefix,
  onChange,
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  onChange: (v: number) => void;
  note?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm" style={{ color: "#9CA3AF" }}>
          {label}
        </label>
        <span className="text-sm font-bold" style={{ color: A.light }}>
          {prefix}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: A.primary }}
      />
      {note && (
        <div className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
          {note}
        </div>
      )}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm" style={{ color: "#4B5563" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded px-2 py-1.5 text-sm"
          style={{
            background: "#1F2937",
            border: "1px solid #374151",
            color: "#F9FAFB",
            outline: "none",
          }}
        />
        {suffix && (
          <span className="text-sm" style={{ color: "#4B5563" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtM(n: number, d = 0): string {
  if (!isFinite(n)) return "N/A";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}B`;
  return `${sign}$${abs.toFixed(d)}M`;
}
function fmtN(n: number, d = 1): string {
  if (!isFinite(n)) return "N/A";
  return n.toFixed(d);
}
function fmtPct(n: number, d = 1): string {
  if (!isFinite(n)) return "N/A";
  return `${n.toFixed(d)}%`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function IBSimulator() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("setup");
  const [inputs, setInputs] = useState<DealInputs>(PRESETS.tech);
  const [glossarySearch, setGlossarySearch] = useState("");

  function setIn<K extends keyof DealInputs>(key: K, val: DealInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }

  // ─── Calculations ───────────────────────────────────────────────────────────
  const C = useMemo(() => {
    const {
      acqRevenue,
      acqEBITDA,
      acqNI,
      acqShares,
      acqPrice,
      acqNetDebt,
      tgtRevenue,
      tgtEBITDA,
      tgtNI,
      tgtShares,
      tgtPrice,
      tgtNetDebt,
      sector,
      dealType,
      offerPremium,
      cashPct,
      debtRate,
      costSynergies,
      revSynergies,
      wacc,
      revenueGrowth,
      terminalGrowth,
      ebitdaMarginPct,
      capexPct,
      taxRate,
      transactionFees,
      earnoutAmount,
      seniorLeverage,
      mezzLeverage,
      seniorRate,
      mezzRate,
      holdPeriod,
      exitMultipleOverride,
      noBalance,
      tgtFCF,
      minorityStakePct,
      managementRollover,
    } = inputs;

    // Offer
    const offerPrice = tgtPrice * (1 + offerPremium / 100);
    const dealValue = offerPrice * tgtShares; // $M
    const stockPct = 100 - cashPct;
    const cashAmount = (dealValue * cashPct) / 100;
    const stockAmount = (dealValue * stockPct) / 100;
    const newAcqShares = acqPrice > 0 ? stockAmount / acqPrice : 0;
    const exchangeRatio = acqPrice > 0 ? offerPrice / acqPrice : 0;

    // EV
    const tgtEV = tgtPrice * tgtShares + tgtNetDebt;
    const offerEV = dealValue + tgtNetDebt;
    const acqEV = acqPrice * acqShares + acqNetDebt;

    // Comps multiples
    const compsMap: Record<string, number> = {
      tech: 18,
      healthcare: 16,
      industrial: 10,
      consumer: 12,
      energy: 8,
    };
    const compsMultiple = compsMap[sector] ?? 12;
    const precMultiple =
      compsMultiple * (dealType === "financial" ? 1.2 : 1.35);
    const compsEV = tgtEBITDA * compsMultiple;
    const compsEVLow = compsEV * 0.85;
    const compsEVHigh = compsEV * 1.15;
    const precEV = tgtEBITDA * precMultiple;
    const precEVLow = precEV * 0.85;
    const precEVHigh = precEV * 1.15;

    // DCF 5-year — D&A and NWC rates vary by sector
    const DA_RATES: Record<string, number> = {
      tech: 0.05,
      healthcare: 0.07,
      industrial: 0.1,
      consumer: 0.06,
      energy: 0.12,
    };
    const NWC_RATES: Record<string, number> = {
      tech: 0.01,
      healthcare: 0.03,
      industrial: 0.04,
      consumer: 0.05,
      energy: 0.02,
    };
    const DA_RATE = DA_RATES[sector] ?? 0.08;
    const NWC_RATE = NWC_RATES[sector] ?? 0.02;
    const projections = Array.from({ length: 5 }, (_, i) => {
      const yr = i + 1;
      const rev = tgtRevenue * Math.pow(1 + revenueGrowth / 100, yr);
      const ebitda = rev * (ebitdaMarginPct / 100);
      const da = rev * DA_RATE;
      const ebit = ebitda - da;
      const nopat = ebit * (1 - taxRate / 100);
      const capex = rev * (capexPct / 100);
      const nwc = rev * NWC_RATE;
      const fcff = nopat + da - capex - nwc;
      const pv = fcff / Math.pow(1 + wacc / 100, yr);
      return { yr, rev, ebitda, ebit, fcff, pv };
    });
    const pvFCFFs = projections.reduce((s, r) => s + r.pv, 0);
    const lastFCFF = projections[4].fcff;
    const waccFrac = wacc / 100;
    const tgFrac = terminalGrowth / 100;
    const tv =
      waccFrac > tgFrac
        ? (lastFCFF * (1 + tgFrac)) / (waccFrac - tgFrac)
        : lastFCFF * 15;
    const pvTV = tv / Math.pow(1 + waccFrac, 5);
    const dcfEV = pvFCFFs + pvTV;
    const dcfEquity = dcfEV - tgtNetDebt;
    const dcfImpliedPrice = tgtShares > 0 ? dcfEquity / tgtShares : 0;
    const tvPct = dcfEV > 0 ? (pvTV / dcfEV) * 100 : 0;

    // LBO — debt is ~65% of Enterprise Value, not just cash consideration
    const lboDebt = offerEV * 0.65;
    const lboEquity = offerEV - lboDebt;
    const exitEBITDA =
      tgtEBITDA *
      Math.pow(1 + revenueGrowth / 100, 5) *
      (ebitdaMarginPct /
        (tgtRevenue > 0 ? (tgtEBITDA / tgtRevenue) * 100 : ebitdaMarginPct));
    const exitEV = exitEBITDA * compsMultiple;
    const lboDebtRepaid = Math.min(lboDebt, tgtEBITDA * 5 * 0.3);
    const exitEquity = exitEV - (lboDebt - lboDebtRepaid);
    const moic = lboEquity > 0 ? exitEquity / lboEquity : 0;
    const irr = lboEquity > 0 && moic > 0 ? (Math.pow(moic, 0.2) - 1) * 100 : 0;

    // Football field
    const allEVs = [
      dcfEV,
      compsEVLow,
      compsEVHigh,
      precEVLow,
      precEVHigh,
      offerEV,
    ].filter((v) => v > 0 && isFinite(v));
    const ffMin = allEVs.length ? Math.min(...allEVs) * 0.85 : 0;
    const ffMax = allEVs.length ? Math.max(...allEVs) * 1.1 : 1;
    const footballField = [
      {
        label: "DCF",
        low: dcfEV * 0.9,
        high: dcfEV * 1.1,
        color: "#6366F1",
      },
      {
        label: "Comparable Companies",
        low: compsEVLow,
        high: compsEVHigh,
        color: "#10B981",
      },
      {
        label: "Precedent Transactions",
        low: precEVLow,
        high: precEVHigh,
        color: "#F59E0B",
      },
      {
        label: "Offer Price (EV)",
        low: offerEV * 0.998,
        high: offerEV * 1.002,
        color: "#EF4444",
      },
    ];

    // Accretion / Dilution
    const synAfterTax = (costSynergies + revSynergies) * (1 - taxRate / 100);
    const daStepUp = dealValue * 0.015;
    const daStepUpAfterTax = daStepUp * (1 - taxRate / 100);
    const newInterest = cashAmount * (debtRate / 100);
    const newInterestAfterTax = newInterest * (1 - taxRate / 100);
    const proFormaNI =
      acqNI + tgtNI + synAfterTax - newInterestAfterTax - daStepUpAfterTax;
    const proFormaShares = acqShares + newAcqShares;
    const standaloneEPS = acqShares > 0 ? acqNI / acqShares : 0;
    const proFormaEPS = proFormaShares > 0 ? proFormaNI / proFormaShares : 0;
    const epsChange = proFormaEPS - standaloneEPS;
    const epsChangePct =
      standaloneEPS !== 0 ? (epsChange / standaloneEPS) * 100 : 0;
    const isAccretive = epsChange >= 0;

    // Leverage — ratio should use total LBO debt, not just cash consideration
    const leverageRatio = tgtEBITDA > 0 ? lboDebt / tgtEBITDA : 0;
    const interestCoverage =
      newInterest > 0
        ? (tgtEBITDA + (costSynergies + revSynergies)) / newInterest
        : 99;

    // Synergy as % of target revenue
    const synPct =
      tgtRevenue > 0 ? ((costSynergies + revSynergies) / tgtRevenue) * 100 : 0;

    // ─── Transaction economics ─────────────────────────────────────────────
    const totalFees = dealValue * (transactionFees / 100);
    const totalConsideration = dealValue + totalFees + earnoutAmount;
    const bookValueApprox = tgtRevenue * 0.3; // rough tangible book
    const goodwill = Math.max(0, dealValue - bookValueApprox);

    // ─── LBO Tranche Model ────────────────────────────────────────────────
    const seniorDebt = tgtEBITDA * seniorLeverage;
    const mezzDebt = tgtEBITDA * mezzLeverage;
    const totalTranchedDebt = seniorDebt + mezzDebt;
    const lboEquityTranche = Math.max(0, offerEV - totalTranchedDebt);
    const seniorInterest = seniorDebt * (seniorRate / 100);
    const mezzInterest = mezzDebt * (mezzRate / 100);
    const totalLBOInterest = seniorInterest + mezzInterest;
    const debtToEBITDA = tgtEBITDA > 0 ? totalTranchedDebt / tgtEBITDA : 0;
    const interestCovTranche =
      totalLBOInterest > 0 ? tgtEBITDA / totalLBOInterest : 99;
    const fcfYield = offerEV > 0 ? (tgtFCF / offerEV) * 100 : 0;
    const dscr = totalLBOInterest > 0 ? tgtFCF / totalLBOInterest : 99;

    // Debt paydown schedule over hold period
    const hp = Math.max(1, holdPeriod);
    const debtSchedule = Array.from({ length: hp }, (_, i) => {
      const yr = i + 1;
      const fcfYr = tgtFCF * Math.pow(1 + revenueGrowth / 200, yr);
      const cumRepay = Array.from({ length: i }, (_, j) => {
        const f = tgtFCF * Math.pow(1 + revenueGrowth / 200, j + 1);
        return f * 0.7;
      }).reduce((a, b) => a + b, 0);
      const openDebt = Math.max(0, totalTranchedDebt - cumRepay);
      const repayment = Math.min(fcfYr * 0.7, openDebt);
      const closeDebt = Math.max(0, openDebt - repayment);
      return { yr, fcfYr, openDebt, repayment, closeDebt };
    });

    // NOL tax shield (reduces effective acquisition cost)
    const nolShield =
      noBalance > 0 ? Math.min(noBalance, tgtEBITDA * hp) * (taxRate / 100) : 0;

    // LBO exit using hold period and tranche model
    const exitEBITDAHold =
      tgtEBITDA *
      Math.pow(1 + revenueGrowth / 100, hp) *
      (ebitdaMarginPct /
        (tgtRevenue > 0 ? (tgtEBITDA / tgtRevenue) * 100 : ebitdaMarginPct));
    const exitMultipleFinal =
      exitMultipleOverride > 0 ? exitMultipleOverride : compsMultiple;
    const exitEVHold = exitEBITDAHold * exitMultipleFinal;
    const debtAtExit =
      debtSchedule.length > 0
        ? debtSchedule[debtSchedule.length - 1].closeDebt
        : totalTranchedDebt;
    const exitEquityHold = Math.max(0, exitEVHold - debtAtExit);
    const moicTranche =
      lboEquityTranche > 0 ? exitEquityHold / lboEquityTranche : 0;
    const irrTranche =
      lboEquityTranche > 0 && moicTranche > 0
        ? (Math.pow(moicTranche, 1 / hp) - 1) * 100
        : 0;

    // ─── Returns sensitivity matrix (hold period × exit multiple) ─────────
    const exitMultiplesRange = [
      Math.max(4, compsMultiple - 4),
      Math.max(4, compsMultiple - 2),
      compsMultiple,
      compsMultiple + 2,
      compsMultiple + 4,
    ];
    const holdPeriodsRange = [3, 4, 5, 6, 7];
    const sensitivityMatrix = holdPeriodsRange.map((hpS) => ({
      holdPeriod: hpS,
      irrs: exitMultiplesRange.map((em) => {
        const exitEB =
          tgtEBITDA *
          Math.pow(1 + revenueGrowth / 100, hpS) *
          (ebitdaMarginPct /
            (tgtRevenue > 0
              ? (tgtEBITDA / tgtRevenue) * 100
              : ebitdaMarginPct));
        const exitEV2 = exitEB * em;
        const cumRepayS = Array.from({ length: hpS }, (_, j) => {
          const f = tgtFCF * Math.pow(1 + revenueGrowth / 200, j + 1);
          return f * 0.7;
        }).reduce((a, b) => a + b, 0);
        const debtS = Math.max(0, totalTranchedDebt - cumRepayS);
        const exitEq = Math.max(0, exitEV2 - debtS);
        const m = lboEquityTranche > 0 ? exitEq / lboEquityTranche : 0;
        return lboEquityTranche > 0 && m > 0
          ? (Math.pow(m, 1 / hpS) - 1) * 100
          : 0;
      }),
    }));

    // ─── Contribution analysis ────────────────────────────────────────────
    const synEBITDAContribution =
      costSynergies + revSynergies * (ebitdaMarginPct / 100);
    const proFormaRevenueCombined = acqRevenue + tgtRevenue + revSynergies;
    const proFormaEBITDACombined =
      acqEBITDA + tgtEBITDA + synEBITDAContribution;
    const acqRevContrib =
      proFormaRevenueCombined > 0
        ? (acqRevenue / proFormaRevenueCombined) * 100
        : 0;
    const tgtRevContrib =
      proFormaRevenueCombined > 0
        ? (tgtRevenue / proFormaRevenueCombined) * 100
        : 0;
    const synRevContrib =
      proFormaRevenueCombined > 0
        ? (revSynergies / proFormaRevenueCombined) * 100
        : 0;
    const acqEBITDAContrib =
      proFormaEBITDACombined > 0
        ? (acqEBITDA / proFormaEBITDACombined) * 100
        : 0;
    const tgtEBITDAContrib =
      proFormaEBITDACombined > 0
        ? (tgtEBITDA / proFormaEBITDACombined) * 100
        : 0;
    const synEBITDAContrib =
      proFormaEBITDACombined > 0
        ? (synEBITDAContribution / proFormaEBITDACombined) * 100
        : 0;
    const acqOwnership =
      proFormaShares > 0 ? (acqShares / proFormaShares) * 100 : 100;
    const tgtShareholderOwnership =
      proFormaShares > 0 ? (newAcqShares / proFormaShares) * 100 : 0;

    // ─── Minority / MBO adjustments ────────────────────────────────────────
    const effectiveStakePct = Math.min(100, Math.max(0, minorityStakePct));
    const effectiveDealValue = dealValue * (effectiveStakePct / 100);
    const mgmtRolloverValue =
      dealType === "mbo" ? dealValue * (managementRollover / 100) : 0;

    // Score — for LBO deals, accr/dilution is N/A; score on IRR instead
    const accrScore =
      dealType === "lbo"
        ? irr >= 25
          ? 25
          : irr >= 20
            ? 20
            : irr >= 15
              ? 14
              : irr >= 12
                ? 8
                : 3
        : isAccretive
          ? 25
          : Math.max(0, 25 + epsChangePct * 1.5);
    const premScore =
      offerPremium >= 15 && offerPremium <= 45
        ? 20
        : offerPremium < 15
          ? Math.max(4, 20 - (15 - offerPremium))
          : Math.max(4, 20 - (offerPremium - 45) * 0.5);
    const levScore =
      leverageRatio < 3
        ? 20
        : leverageRatio < 4
          ? 16
          : leverageRatio < 5
            ? 11
            : leverageRatio < 6
              ? 7
              : 3;
    const synScore = synPct < 4 ? 20 : synPct < 7 ? 15 : synPct < 12 ? 10 : 5;
    const strScore = dealType === "strategic" ? 15 : 10;
    const totalScore = Math.round(
      accrScore + premScore + levScore + synScore + strScore,
    );

    return {
      offerPrice,
      dealValue,
      stockPct,
      cashAmount,
      stockAmount,
      newAcqShares,
      exchangeRatio,
      tgtEV,
      offerEV,
      acqEV,
      compsMultiple,
      precMultiple,
      compsEV,
      compsEVLow,
      compsEVHigh,
      precEV,
      precEVLow,
      precEVHigh,
      projections,
      pvFCFFs,
      pvTV,
      tv,
      dcfEV,
      dcfEquity,
      dcfImpliedPrice,
      tvPct,
      lboDebt,
      lboEquity,
      moic,
      irr,
      footballField,
      ffMin,
      ffMax,
      synAfterTax,
      daStepUpAfterTax,
      newInterestAfterTax,
      proFormaNI,
      proFormaShares,
      standaloneEPS,
      proFormaEPS,
      epsChange,
      epsChangePct,
      isAccretive,
      leverageRatio,
      interestCoverage,
      synPct,
      accrScore,
      premScore,
      levScore,
      synScore,
      strScore,
      totalScore,
      // Transaction economics
      totalFees,
      totalConsideration,
      goodwill,
      // LBO tranche model
      seniorDebt,
      mezzDebt,
      totalTranchedDebt,
      lboEquityTranche,
      seniorInterest,
      mezzInterest,
      totalLBOInterest,
      debtToEBITDA,
      interestCovTranche,
      fcfYield,
      dscr,
      debtSchedule,
      nolShield,
      exitEBITDAHold,
      exitMultipleFinal,
      exitEVHold,
      debtAtExit,
      exitEquityHold,
      moicTranche,
      irrTranche,
      // Sensitivity
      exitMultiplesRange,
      holdPeriodsRange,
      sensitivityMatrix,
      // Contribution
      proFormaRevenueCombined,
      proFormaEBITDACombined,
      acqRevContrib,
      tgtRevContrib,
      synRevContrib,
      acqEBITDAContrib,
      tgtEBITDAContrib,
      synEBITDAContrib,
      acqOwnership,
      tgtShareholderOwnership,
      // Minority / MBO
      effectiveStakePct,
      effectiveDealValue,
      mgmtRolloverValue,
    };
  }, [inputs]);

  if (showLanding) {
    return <IBLanding onStart={() => setShowLanding(false)} />;
  }

  const filteredGlossary = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.def.toLowerCase().includes(glossarySearch.toLowerCase()),
  );

  const scoreColor =
    C.totalScore >= 80
      ? "#22C55E"
      : C.totalScore >= 60
        ? A.light
        : C.totalScore >= 40
          ? "#F97316"
          : "#EF4444";

  const scoreLabel =
    C.totalScore >= 80
      ? "Strong Deal"
      : C.totalScore >= 60
        ? "Solid Deal"
        : C.totalScore >= 40
          ? "Weak Deal"
          : "Poor Deal";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLanding(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: "13px",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF")
            }
          >
            ← Back
          </button>
          <span style={{ color: "#374151" }}>|</span>
          <div className="flex items-center gap-2">
            <span
              className="font-serif"
              style={{ fontSize: "16px", color: "#F9FAFB" }}
            >
              {inputs.acqName || "Acquirer"}
            </span>
            <span style={{ color: "#4B5563", fontSize: "12px" }}>acquires</span>
            <span
              className="font-serif"
              style={{ fontSize: "16px", color: "#F9FAFB" }}
            >
              {inputs.tgtName || "Target"}
            </span>
          </div>
          <span style={{ color: "#374151" }}>|</span>
          <AmberBadge>{fmtM(C.dealValue)}</AmberBadge>
          <AmberBadge>
            {C.isAccretive ? "▲ Accretive" : "▼ Dilutive"}
          </AmberBadge>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: `${scoreColor}18`,
              color: scoreColor,
              border: `1px solid ${scoreColor}40`,
              fontFamily: "monospace",
            }}
          >
            Score: {C.totalScore}/100
          </span>
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
          }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            color: "#9CA3AF",
            textDecoration: "none",
            background: "rgba(55,65,81,0.5)",
            border: "1px solid #374151",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#F9FAFB";
            (e.currentTarget as HTMLAnchorElement).style.background = "#374151";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#9CA3AF";
            (e.currentTarget as HTMLAnchorElement).style.background =
              "rgba(55,65,81,0.5)";
          }}
        >
          ← FundSim
        </a>
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 px-6 pt-3 pb-0 overflow-x-auto"
        style={{ borderBottom: "1px solid #1F2937" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap"
            style={{
              background: activeTab === t.id ? "#111827" : "transparent",
              color: activeTab === t.id ? A.light : "#6B7280",
              border:
                activeTab === t.id
                  ? `1px solid ${A.border}`
                  : "1px solid transparent",
              borderBottom:
                activeTab === t.id
                  ? "1px solid #111827"
                  : "1px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-6 max-w-6xl mx-auto"
          >
            {/* ── SETUP ─────────────────────────────────────────────────────── */}
            {activeTab === "setup" && (
              <div>
                <SectionHeader>Deal Setup</SectionHeader>
                <Sub>
                  Configure both companies or load a preset scenario. All
                  calculations update live.
                </Sub>

                {/* Preset buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
                  {[
                    {
                      key: "tech",
                      label: "Tech Acq.",
                      sub: "Strategic",
                      tag: "STRATEGIC",
                    },
                    {
                      key: "biotech",
                      label: "Pharma M&A",
                      sub: "Healthcare",
                      tag: "STRATEGIC",
                    },
                    {
                      key: "lbo",
                      label: "LBO",
                      sub: "PE Buyout",
                      tag: "FINANCIAL",
                    },
                    {
                      key: "hostile",
                      label: "Hostile",
                      sub: "Takeover",
                      tag: "HOSTILE",
                    },
                    { key: "spac", label: "SPAC", sub: "De-SPAC", tag: "SPAC" },
                    {
                      key: "carveout",
                      label: "Carve-Out",
                      sub: "Division",
                      tag: "CARVEOUT",
                    },
                    {
                      key: "distressed",
                      label: "Distressed",
                      sub: "Chapter 11",
                      tag: "DISTRESSED",
                    },
                    {
                      key: "mbo",
                      label: "MBO",
                      sub: "Mgmt Buyout",
                      tag: "MBO",
                    },
                    {
                      key: "crossborder",
                      label: "Cross-Border",
                      sub: "Intl M&A",
                      tag: "INTL",
                    },
                    {
                      key: "minority",
                      label: "Minority",
                      sub: "Growth Eq.",
                      tag: "MINORITY",
                    },
                  ].map((p) => {
                    const active = inputs.acqName === PRESETS[p.key].acqName;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setInputs(PRESETS[p.key])}
                        className="p-2.5 rounded-lg text-left"
                        style={{
                          background: active ? A.dim : "#111827",
                          border: `1px solid ${active ? A.border : "#374151"}`,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="text-xs font-bold mb-0.5"
                          style={{ color: active ? A.light : "#D1D5DB" }}
                        >
                          {p.label}
                        </div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>
                          {p.sub}
                        </div>
                        <div
                          className="mt-1 text-xs font-mono"
                          style={{
                            color: active ? A.light : "#4B5563",
                            fontSize: "9px",
                          }}
                        >
                          {p.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Acquirer */}
                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{
                        color: "#6366F1",
                        fontFamily: "monospace",
                      }}
                    >
                      ACQUIRER
                    </div>
                    <input
                      type="text"
                      value={inputs.acqName}
                      onChange={(e) => setIn("acqName", e.target.value)}
                      className="w-full rounded px-2 py-1.5 text-sm mb-3"
                      style={{
                        background: "#1F2937",
                        border: "1px solid #374151",
                        color: "#F9FAFB",
                        outline: "none",
                      }}
                      placeholder="Acquirer name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput
                        label="Revenue ($M)"
                        value={inputs.acqRevenue}
                        onChange={(v) => setIn("acqRevenue", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="EBITDA ($M)"
                        value={inputs.acqEBITDA}
                        onChange={(v) => setIn("acqEBITDA", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Net Income ($M)"
                        value={inputs.acqNI}
                        onChange={(v) => setIn("acqNI", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Net Debt ($M)"
                        value={inputs.acqNetDebt}
                        onChange={(v) => setIn("acqNetDebt", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Shares Out. (M)"
                        value={inputs.acqShares}
                        onChange={(v) => setIn("acqShares", v)}
                      />
                      <NumInput
                        label="Stock Price ($)"
                        value={inputs.acqPrice}
                        onChange={(v) => setIn("acqPrice", v)}
                        prefix="$"
                      />
                    </div>
                    <div
                      className="mt-3 p-3 rounded-lg"
                      style={{ background: "#1F2937" }}
                    >
                      <div
                        className="flex justify-between text-xs"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Market Cap</span>
                        <span style={{ color: "#6366F1" }}>
                          {fmtM(inputs.acqPrice * inputs.acqShares)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Enterprise Value</span>
                        <span style={{ color: "#6366F1" }}>
                          {fmtM(C.acqEV)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Standalone EPS</span>
                        <span style={{ color: "#6366F1" }}>
                          ${fmtN(C.standaloneEPS, 2)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Target */}
                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      TARGET
                    </div>
                    <input
                      type="text"
                      value={inputs.tgtName}
                      onChange={(e) => setIn("tgtName", e.target.value)}
                      className="w-full rounded px-2 py-1.5 text-sm mb-3"
                      style={{
                        background: "#1F2937",
                        border: "1px solid #374151",
                        color: "#F9FAFB",
                        outline: "none",
                      }}
                      placeholder="Target name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput
                        label="Revenue ($M)"
                        value={inputs.tgtRevenue}
                        onChange={(v) => setIn("tgtRevenue", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="EBITDA ($M)"
                        value={inputs.tgtEBITDA}
                        onChange={(v) => setIn("tgtEBITDA", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Net Income ($M)"
                        value={inputs.tgtNI}
                        onChange={(v) => setIn("tgtNI", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Net Debt ($M)"
                        value={inputs.tgtNetDebt}
                        onChange={(v) => setIn("tgtNetDebt", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Shares Out. (M)"
                        value={inputs.tgtShares}
                        onChange={(v) => setIn("tgtShares", v)}
                      />
                      <NumInput
                        label="Stock Price ($)"
                        value={inputs.tgtPrice}
                        onChange={(v) => setIn("tgtPrice", v)}
                        prefix="$"
                      />
                    </div>
                    <div
                      className="mt-3 p-3 rounded-lg"
                      style={{ background: "#1F2937" }}
                    >
                      <div
                        className="flex justify-between text-xs"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Market Cap</span>
                        <span style={{ color: A.light }}>
                          {fmtM(inputs.tgtPrice * inputs.tgtShares)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Enterprise Value</span>
                        <span style={{ color: A.light }}>{fmtM(C.tgtEV)}</span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>EV/EBITDA (Current)</span>
                        <span style={{ color: A.light }}>
                          {inputs.tgtEBITDA > 0
                            ? fmtN(C.tgtEV / inputs.tgtEBITDA, 1) + "x"
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Deal meta */}
                <Card style={{ marginTop: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    DEAL PARAMETERS
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label
                        className="text-xs block mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        Sector
                      </label>
                      <select
                        value={inputs.sector}
                        onChange={(e) => setIn("sector", e.target.value)}
                        className="w-full rounded px-2 py-1.5 text-sm"
                        style={{
                          background: "#1F2937",
                          border: "1px solid #374151",
                          color: "#F9FAFB",
                          outline: "none",
                        }}
                      >
                        <option value="tech">Technology</option>
                        <option value="healthcare">Healthcare / Pharma</option>
                        <option value="industrial">Industrial</option>
                        <option value="consumer">Consumer</option>
                        <option value="energy">Energy</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="text-xs block mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        Deal Type
                      </label>
                      <select
                        value={inputs.dealType}
                        onChange={(e) => setIn("dealType", e.target.value)}
                        className="w-full rounded px-2 py-1.5 text-sm"
                        style={{
                          background: "#1F2937",
                          border: "1px solid #374151",
                          color: "#F9FAFB",
                          outline: "none",
                        }}
                      >
                        <option value="strategic">Strategic (Corporate)</option>
                        <option value="financial">Financial (LBO / PE)</option>
                        <option value="hostile">Hostile Takeover</option>
                        <option value="spac">SPAC / De-SPAC</option>
                        <option value="carveout">Carve-Out</option>
                        <option value="distressed">Distressed / 363</option>
                        <option value="mbo">Management Buyout (MBO)</option>
                        <option value="crossborder">Cross-Border</option>
                        <option value="minority">
                          Minority / Growth Equity
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="text-xs block mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        Tax Rate
                      </label>
                      <input
                        type="number"
                        value={inputs.taxRate}
                        onChange={(e) =>
                          setIn("taxRate", Number(e.target.value))
                        }
                        className="w-full rounded px-2 py-1.5 text-sm"
                        style={{
                          background: "#1F2937",
                          border: "1px solid #374151",
                          color: "#F9FAFB",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs block mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        Debt Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.debtRate}
                        onChange={(e) =>
                          setIn("debtRate", Number(e.target.value))
                        }
                        className="w-full rounded px-2 py-1.5 text-sm"
                        style={{
                          background: "#1F2937",
                          border: "1px solid #374151",
                          color: "#F9FAFB",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Advanced Deal Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#10B981", fontFamily: "monospace" }}
                    >
                      ADVANCED DEAL TERMS
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput
                        label="Transaction Fees (% of deal)"
                        value={inputs.transactionFees}
                        onChange={(v) => setIn("transactionFees", v)}
                        suffix="%"
                      />
                      <NumInput
                        label="Earnout / CVR ($M)"
                        value={inputs.earnoutAmount}
                        onChange={(v) => setIn("earnoutAmount", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Breakup Fee ($M)"
                        value={inputs.breakupFee}
                        onChange={(v) => setIn("breakupFee", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Hold Period (yrs)"
                        value={inputs.holdPeriod}
                        onChange={(v) => setIn("holdPeriod", v)}
                      />
                      <NumInput
                        label="Minority Stake (%)"
                        value={inputs.minorityStakePct}
                        onChange={(v) => setIn("minorityStakePct", v)}
                        suffix="%"
                      />
                      <NumInput
                        label="Mgmt Rollover (%)"
                        value={inputs.managementRollover}
                        onChange={(v) => setIn("managementRollover", v)}
                        suffix="%"
                      />
                      <NumInput
                        label="Target FCF ($M)"
                        value={inputs.tgtFCF}
                        onChange={(v) => setIn("tgtFCF", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="NOL Balance ($M)"
                        value={inputs.noBalance}
                        onChange={(v) => setIn("noBalance", v)}
                        prefix="$"
                      />
                    </div>
                    <div
                      className="mt-3 p-3 rounded-lg"
                      style={{ background: "#1F2937" }}
                    >
                      <div
                        className="flex justify-between text-xs"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Total Consideration (incl. fees + earnout)</span>
                        <span style={{ color: "#10B981" }}>
                          {fmtM(C.totalConsideration)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Advisory & Financing Fees</span>
                        <span style={{ color: "#10B981" }}>
                          {fmtM(C.totalFees)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Goodwill Created</span>
                        <span style={{ color: "#10B981" }}>
                          {fmtM(C.goodwill)}
                        </span>
                      </div>
                      {C.nolShield > 0 && (
                        <div
                          className="flex justify-between text-xs mt-1"
                          style={{ color: "#9CA3AF" }}
                        >
                          <span>NOL Tax Shield (PV)</span>
                          <span style={{ color: "#10B981" }}>
                            {fmtM(C.nolShield)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#8B5CF6", fontFamily: "monospace" }}
                    >
                      LBO / LEVERAGE STRUCTURE
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput
                        label="Senior Leverage (x EBITDA)"
                        value={inputs.seniorLeverage}
                        onChange={(v) => setIn("seniorLeverage", v)}
                        suffix="x"
                      />
                      <NumInput
                        label="Mezz Leverage (x EBITDA)"
                        value={inputs.mezzLeverage}
                        onChange={(v) => setIn("mezzLeverage", v)}
                        suffix="x"
                      />
                      <NumInput
                        label="Senior Rate (%)"
                        value={inputs.seniorRate}
                        onChange={(v) => setIn("seniorRate", v)}
                        suffix="%"
                      />
                      <NumInput
                        label="Mezz Rate (%)"
                        value={inputs.mezzRate}
                        onChange={(v) => setIn("mezzRate", v)}
                        suffix="%"
                      />
                      <NumInput
                        label="Revolver ($M)"
                        value={inputs.revolver}
                        onChange={(v) => setIn("revolver", v)}
                        prefix="$"
                      />
                      <NumInput
                        label="Exit Multiple Override (x)"
                        value={inputs.exitMultipleOverride}
                        onChange={(v) => setIn("exitMultipleOverride", v)}
                        suffix="x"
                      />
                    </div>
                    <div
                      className="mt-3 p-3 rounded-lg"
                      style={{ background: "#1F2937" }}
                    >
                      <div
                        className="flex justify-between text-xs"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Senior Debt</span>
                        <span style={{ color: "#8B5CF6" }}>
                          {fmtM(C.seniorDebt)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Mezz Debt</span>
                        <span style={{ color: "#8B5CF6" }}>
                          {fmtM(C.mezzDebt)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>
                          Total Debt ({fmtN(C.debtToEBITDA, 1)}x EBITDA)
                        </span>
                        <span style={{ color: "#8B5CF6" }}>
                          {fmtM(C.totalTranchedDebt)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Equity Check</span>
                        <span style={{ color: "#8B5CF6" }}>
                          {fmtM(C.lboEquityTranche)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        <span>Annual Interest Burden</span>
                        <span
                          style={{
                            color:
                              C.interestCovTranche < 2 ? "#EF4444" : "#8B5CF6",
                          }}
                        >
                          {fmtM(C.totalLBOInterest)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── VALUATION ─────────────────────────────────────────────────── */}
            {activeTab === "valuation" && (
              <div>
                <SectionHeader>Valuation Analysis</SectionHeader>
                <Sub>
                  Four methods to value {inputs.tgtName || "the target"}.
                  Compare them in the football field chart.
                </Sub>

                {/* DCF Assumptions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card style={{ gridColumn: "span 1" }}>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#6366F1", fontFamily: "monospace" }}
                    >
                      DCF ASSUMPTIONS
                    </div>
                    <SliderRow
                      label="Revenue Growth (Yr 1–5)"
                      value={inputs.revenueGrowth}
                      min={0}
                      max={40}
                      step={1}
                      unit="%"
                      onChange={(v) => setIn("revenueGrowth", v)}
                    />
                    <SliderRow
                      label="EBITDA Margin"
                      value={inputs.ebitdaMarginPct}
                      min={5}
                      max={50}
                      step={1}
                      unit="%"
                      onChange={(v) => setIn("ebitdaMarginPct", v)}
                    />
                    <SliderRow
                      label="WACC"
                      value={inputs.wacc}
                      min={5}
                      max={20}
                      step={0.5}
                      unit="%"
                      onChange={(v) => setIn("wacc", v)}
                    />
                    <SliderRow
                      label="Terminal Growth Rate"
                      value={inputs.terminalGrowth}
                      min={0}
                      max={5}
                      step={0.5}
                      unit="%"
                      onChange={(v) => setIn("terminalGrowth", v)}
                    />
                    <SliderRow
                      label="Capex (% Revenue)"
                      value={inputs.capexPct}
                      min={1}
                      max={20}
                      step={1}
                      unit="%"
                      onChange={(v) => setIn("capexPct", v)}
                    />
                  </Card>

                  {/* DCF Results */}
                  <Card style={{ gridColumn: "span 2" }}>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#6366F1", fontFamily: "monospace" }}
                    >
                      5-YEAR DCF PROJECTION
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ color: "#4B5563" }}>
                            <td className="pb-2 pr-3">Metric ($M)</td>
                            {C.projections.map((p) => (
                              <td key={p.yr} className="pb-2 pr-3 text-right">
                                Yr {p.yr}
                              </td>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              label: "Revenue",
                              vals: C.projections.map((p) => p.rev),
                              color: "#9CA3AF",
                            },
                            {
                              label: "EBITDA",
                              vals: C.projections.map((p) => p.ebitda),
                              color: "#9CA3AF",
                            },
                            {
                              label: "EBIT",
                              vals: C.projections.map((p) => p.ebit),
                              color: "#9CA3AF",
                            },
                            {
                              label: "FCFF",
                              vals: C.projections.map((p) => p.fcff),
                              color: "#6366F1",
                            },
                            {
                              label: "PV of FCFF",
                              vals: C.projections.map((p) => p.pv),
                              color: "#6366F1",
                            },
                          ].map((row) => (
                            <tr key={row.label}>
                              <td
                                className="py-1.5 pr-3"
                                style={{ color: "#6B7280" }}
                              >
                                {row.label}
                              </td>
                              {row.vals.map((v, i) => (
                                <td
                                  key={i}
                                  className="py-1.5 pr-3 text-right font-mono"
                                  style={{ color: row.color }}
                                >
                                  {fmtM(v, 0)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className="mt-4 grid grid-cols-4 gap-3 pt-4"
                      style={{ borderTop: "1px solid #1F2937" }}
                    >
                      <Stat
                        label="PV of FCFFs"
                        value={fmtM(C.pvFCFFs)}
                        color="#6366F1"
                      />
                      <Stat
                        label="PV of Terminal Value"
                        value={fmtM(C.pvTV)}
                        sub={`${fmtN(C.tvPct, 0)}% of DCF EV`}
                        color="#6366F1"
                      />
                      <Stat
                        label="DCF Enterprise Value"
                        value={fmtM(C.dcfEV)}
                        color="#6366F1"
                      />
                      <Stat
                        label="Implied Share Price"
                        value={`$${fmtN(C.dcfImpliedPrice, 2)}`}
                        sub={`vs $${inputs.tgtPrice} current`}
                        color="#6366F1"
                      />
                    </div>
                  </Card>
                </div>

                {/* Comps + Precedents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <div
                      className="text-xs font-bold mb-3 tracking-widest"
                      style={{ color: "#10B981", fontFamily: "monospace" }}
                    >
                      COMPARABLE COMPANIES
                    </div>
                    <div className="flex justify-between mb-4">
                      <div>
                        <div
                          className="text-xs mb-0.5"
                          style={{ color: "#6B7280" }}
                        >
                          Sector Benchmark Multiple
                        </div>
                        <div
                          className="text-2xl font-bold font-serif"
                          style={{ color: "#10B981" }}
                        >
                          {fmtN(C.compsMultiple, 1)}x EV/EBITDA
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs mb-0.5"
                          style={{ color: "#6B7280" }}
                        >
                          Implied EV Range
                        </div>
                        <div className="font-bold" style={{ color: "#10B981" }}>
                          {fmtM(C.compsEVLow)} – {fmtM(C.compsEVHigh)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-xs p-3 rounded-lg"
                      style={{ background: "#0D1420", color: "#6B7280" }}
                    >
                      Sector EV/EBITDA benchmarks: Tech 15–21x · Healthcare
                      13–19x · Industrial 8–12x · Consumer 10–14x · Energy 6–10x
                    </div>
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-3 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      PRECEDENT TRANSACTIONS
                    </div>
                    <div className="flex justify-between mb-4">
                      <div>
                        <div
                          className="text-xs mb-0.5"
                          style={{ color: "#6B7280" }}
                        >
                          Transaction Multiple (incl. premium)
                        </div>
                        <div
                          className="text-2xl font-bold font-serif"
                          style={{ color: A.light }}
                        >
                          {fmtN(C.precMultiple, 1)}x EV/EBITDA
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs mb-0.5"
                          style={{ color: "#6B7280" }}
                        >
                          Implied EV Range
                        </div>
                        <div className="font-bold" style={{ color: A.light }}>
                          {fmtM(C.precEVLow)} – {fmtM(C.precEVHigh)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-xs p-3 rounded-lg"
                      style={{ background: "#0D1420", color: "#6B7280" }}
                    >
                      Precedent transactions include a{" "}
                      {inputs.dealType === "strategic" ? "30–40%" : "15–25%"}{" "}
                      control premium over public comps. Strategic buyers pay
                      more than financial buyers.
                    </div>
                  </Card>
                </div>

                {/* LBO */}
                {inputs.dealType === "financial" && (
                  <Card style={{ marginBottom: "1.5rem" }}>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#EC4899", fontFamily: "monospace" }}
                    >
                      LBO ANALYSIS
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Stat
                        label="Acquisition Debt"
                        value={fmtM(C.lboDebt)}
                        sub="~65% of deal EV"
                        color="#EC4899"
                      />
                      <Stat
                        label="Sponsor Equity"
                        value={fmtM(C.lboEquity)}
                        sub="~35% of deal EV"
                        color="#EC4899"
                      />
                      <Stat
                        label="MOIC (5-yr hold)"
                        value={`${fmtN(C.moic, 2)}x`}
                        sub="Target: 2.5–3.5x"
                        color={C.moic >= 2 ? "#22C55E" : "#EF4444"}
                      />
                      <Stat
                        label="Implied IRR"
                        value={fmtPct(C.irr)}
                        sub="Target: 20–30%"
                        color={C.irr >= 20 ? "#22C55E" : "#EF4444"}
                      />
                    </div>
                  </Card>
                )}

                {/* Football Field */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    FOOTBALL FIELD — ENTERPRISE VALUE RANGES
                  </div>
                  <div className="space-y-4">
                    {C.footballField.map((row) => {
                      const range = C.ffMax - C.ffMin;
                      if (range <= 0) return null;
                      const leftPct = ((row.low - C.ffMin) / range) * 100;
                      const widthPct = ((row.high - row.low) / range) * 100;
                      return (
                        <div key={row.label}>
                          <div
                            className="flex justify-between text-xs mb-1"
                            style={{ color: "#9CA3AF" }}
                          >
                            <span>{row.label}</span>
                            <span style={{ color: row.color }}>
                              {fmtM(row.low)} – {fmtM(row.high)}
                            </span>
                          </div>
                          <div
                            className="relative h-7 rounded"
                            style={{ background: "#0D1420" }}
                          >
                            <motion.div
                              className="absolute top-1 bottom-1 rounded"
                              initial={{ left: "50%", width: 0 }}
                              animate={{
                                left: `${Math.max(0, leftPct)}%`,
                                width: `${Math.min(widthPct, 100 - Math.max(0, leftPct))}%`,
                              }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              style={{ background: row.color, opacity: 0.8 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="flex justify-between text-xs mt-3"
                    style={{ color: "#374151" }}
                  >
                    <span>{fmtM(C.ffMin)}</span>
                    <span>{fmtM((C.ffMin + C.ffMax) / 2)}</span>
                    <span>{fmtM(C.ffMax)}</span>
                  </div>
                </Card>
              </div>
            )}

            {/* ── OFFER & STRUCTURE ─────────────────────────────────────────── */}
            {activeTab === "offer" && (
              <div>
                <SectionHeader>Offer & Deal Structure</SectionHeader>
                <Sub>
                  Set the offer premium and financing mix. Cash deals are
                  certain but debt-heavy. Stock deals share risk and upside.
                </Sub>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      OFFER TERMS
                    </div>
                    <SliderRow
                      label="Offer Premium over Current Price"
                      value={inputs.offerPremium}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      onChange={(v) => setIn("offerPremium", v)}
                      note="Typical range: 20–45% for strategic deals, 15–30% for LBOs"
                    />
                    <SliderRow
                      label="Cash Component"
                      value={inputs.cashPct}
                      min={0}
                      max={100}
                      step={5}
                      unit="% cash"
                      onChange={(v) => setIn("cashPct", v)}
                      note={`Remaining ${100 - inputs.cashPct}% paid in acquirer stock`}
                    />
                    <SliderRow
                      label="Acquisition Debt Rate"
                      value={inputs.debtRate}
                      min={3}
                      max={12}
                      step={0.25}
                      unit="%"
                      onChange={(v) => setIn("debtRate", v)}
                      note="Interest rate on new debt used to fund cash portion"
                    />
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      DEAL MECHANICS
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Current Target Price",
                          val: `$${fmtN(inputs.tgtPrice, 2)}`,
                          color: "#9CA3AF",
                        },
                        {
                          label: "Offer Price per Share",
                          val: `$${fmtN(C.offerPrice, 2)}`,
                          color: A.light,
                        },
                        {
                          label: "Offer Premium",
                          val: fmtPct(inputs.offerPremium),
                          color: A.light,
                        },
                        {
                          label: "Total Deal Value",
                          val: fmtM(C.dealValue),
                          color: A.light,
                        },
                        {
                          label: "Offer Enterprise Value",
                          val: fmtM(C.offerEV),
                          color: A.light,
                        },
                        {
                          label: "Offer EV/EBITDA",
                          val:
                            inputs.tgtEBITDA > 0
                              ? `${fmtN(C.offerEV / inputs.tgtEBITDA, 1)}x`
                              : "N/A",
                          color: A.light,
                        },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{ color: "#6B7280" }}
                          >
                            {row.label}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: row.color }}
                          >
                            {row.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid #1F2937" }}
                    >
                      <div
                        className="text-xs font-bold mb-3"
                        style={{ color: "#6B7280" }}
                      >
                        FINANCING BREAKDOWN
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: "#6B7280" }}>
                            Cash Consideration
                          </span>
                          <span style={{ color: "#60A5FA" }}>
                            {fmtM(C.cashAmount)} ({inputs.cashPct}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span style={{ color: "#6B7280" }}>
                            Stock Consideration
                          </span>
                          <span style={{ color: "#A78BFA" }}>
                            {fmtM(C.stockAmount)} ({C.stockPct}%)
                          </span>
                        </div>
                        {C.stockPct > 0 && inputs.acqPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "#6B7280" }}>
                              Exchange Ratio
                            </span>
                            <span style={{ color: "#A78BFA" }}>
                              {fmtN(C.exchangeRatio, 4)}x (
                              {fmtN(C.newAcqShares, 1)}M new shares)
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span style={{ color: "#6B7280" }}>
                            Annual Interest Cost
                          </span>
                          <span style={{ color: "#EF4444" }}>
                            {fmtM(C.cashAmount * (inputs.debtRate / 100), 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Financing visual */}
                <Card style={{ marginTop: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-3 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    SOURCES OF FUNDS
                  </div>
                  <div className="flex rounded-lg overflow-hidden h-8">
                    <motion.div
                      animate={{ width: `${inputs.cashPct}%` }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center text-xs font-bold"
                      style={{ background: "#1D4ED8", color: "#fff" }}
                    >
                      {inputs.cashPct > 15
                        ? `Cash ${inputs.cashPct}%`
                        : inputs.cashPct > 0
                          ? `${inputs.cashPct}%`
                          : ""}
                    </motion.div>
                    <motion.div
                      animate={{ width: `${C.stockPct}%` }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center text-xs font-bold"
                      style={{ background: "#7C3AED", color: "#fff" }}
                    >
                      {C.stockPct > 15
                        ? `Stock ${C.stockPct}%`
                        : C.stockPct > 0
                          ? `${C.stockPct}%`
                          : ""}
                    </motion.div>
                  </div>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ background: "#1D4ED8" }}
                      />
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        Cash (debt-funded)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ background: "#7C3AED" }}
                      />
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        Acquirer stock
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── ACCRETION / DILUTION ──────────────────────────────────────── */}
            {activeTab === "accretion" && (
              <div>
                <SectionHeader>Accretion / Dilution Analysis</SectionHeader>
                <Sub>
                  Will this deal increase or decrease the acquirer's earnings
                  per share? A key metric for any public company acquirer.
                </Sub>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card
                    style={{
                      border: `1px solid ${C.isAccretive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-2 tracking-widest"
                      style={{
                        color: C.isAccretive ? "#22C55E" : "#EF4444",
                        fontFamily: "monospace",
                      }}
                    >
                      {C.isAccretive ? "▲ ACCRETIVE" : "▼ DILUTIVE"}
                    </div>
                    <div
                      className="text-4xl font-bold font-serif mb-1"
                      style={{
                        color: C.isAccretive ? "#22C55E" : "#EF4444",
                      }}
                    >
                      {C.epsChangePct >= 0 ? "+" : ""}
                      {fmtN(C.epsChangePct, 1)}%
                    </div>
                    <div className="text-sm" style={{ color: "#6B7280" }}>
                      EPS change vs. standalone
                    </div>
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-3 tracking-widest"
                      style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                    >
                      STANDALONE EPS
                    </div>
                    <div
                      className="text-3xl font-bold font-serif mb-1"
                      style={{ color: "#F9FAFB" }}
                    >
                      ${fmtN(C.standaloneEPS, 2)}
                    </div>
                    <div className="text-sm" style={{ color: "#6B7280" }}>
                      {inputs.acqName} EPS before deal
                    </div>
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-3 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      PRO FORMA EPS
                    </div>
                    <div
                      className="text-3xl font-bold font-serif mb-1"
                      style={{
                        color: C.isAccretive ? "#22C55E" : "#EF4444",
                      }}
                    >
                      ${fmtN(C.proFormaEPS, 2)}
                    </div>
                    <div className="text-sm" style={{ color: "#6B7280" }}>
                      Combined EPS after deal
                    </div>
                  </Card>
                </div>

                {/* Bridge */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    PRO FORMA NET INCOME BRIDGE ($M)
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: `${inputs.acqName} Net Income`,
                        val: inputs.acqNI,
                        color: "#9CA3AF",
                        sign: "",
                      },
                      {
                        label: `${inputs.tgtName} Net Income`,
                        val: inputs.tgtNI,
                        color: "#9CA3AF",
                        sign: "+",
                      },
                      {
                        label: "After-Tax Synergies",
                        val: C.synAfterTax,
                        color: "#22C55E",
                        sign: "+",
                      },
                      {
                        label: "After-Tax Interest Cost on New Debt",
                        val: -C.newInterestAfterTax,
                        color: "#EF4444",
                        sign: "−",
                      },
                      {
                        label: "After-Tax D&A Step-Up Amortization",
                        val: -C.daStepUpAfterTax,
                        color: "#EF4444",
                        sign: "−",
                      },
                      {
                        label: "Pro Forma Net Income",
                        val: C.proFormaNI,
                        color: C.isAccretive ? "#22C55E" : "#EF4444",
                        sign: "=",
                        bold: true,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center py-1.5 px-3 rounded"
                        style={{
                          background: row.bold ? A.dim : "transparent",
                          borderTop: row.bold
                            ? `1px solid ${A.border}`
                            : "none",
                        }}
                      >
                        <span
                          className={`text-sm ${row.bold ? "font-bold" : ""}`}
                          style={{ color: row.bold ? "#F9FAFB" : "#6B7280" }}
                        >
                          <span
                            className="mr-2 font-mono"
                            style={{ color: "#4B5563" }}
                          >
                            {row.sign}
                          </span>
                          {row.label}
                        </span>
                        <span
                          className={`text-sm font-bold font-mono ${row.bold ? "text-base" : ""}`}
                          style={{ color: row.color }}
                        >
                          {row.val < 0
                            ? `(${fmtM(Math.abs(row.val), 1)})`
                            : fmtM(row.val, 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-4 pt-4 grid grid-cols-2 gap-4"
                    style={{ borderTop: "1px solid #1F2937" }}
                  >
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        Pro Forma Share Count
                      </div>
                      <div className="font-bold" style={{ color: A.light }}>
                        {fmtN(C.proFormaShares, 1)}M shares
                      </div>
                      <div className="text-xs" style={{ color: "#4B5563" }}>
                        {fmtN(inputs.acqShares, 0)}M existing +{" "}
                        {fmtN(C.newAcqShares, 1)}M new
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        EPS Change
                      </div>
                      <div
                        className="font-bold"
                        style={{
                          color: C.isAccretive ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {C.epsChange >= 0 ? "+" : ""}${fmtN(C.epsChange, 3)} per
                        share
                      </div>
                      <div className="text-xs" style={{ color: "#4B5563" }}>
                        {C.epsChangePct >= 0 ? "+" : ""}
                        {fmtN(C.epsChangePct, 1)}% vs. standalone
                      </div>
                    </div>
                  </div>
                </Card>

                <Card style={{ marginTop: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-3 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    WHAT DRIVES ACCRETION?
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: "#6B7280" }}
                  >
                    <p className="mb-2">
                      <span style={{ color: "#F9FAFB" }}>Cash deals</span> are
                      accretive when the target's earnings yield (NI/Deal Value)
                      exceeds the after-tax cost of debt. Adding target earnings
                      at a lower cost than the price paid lifts EPS.
                    </p>
                    <p className="mb-2">
                      <span style={{ color: "#F9FAFB" }}>Stock deals</span> are
                      accretive when the acquirer's P/E ratio is higher than the
                      target's implied acquisition P/E. New shares issued dilute
                      the denominator, so earnings must more than offset.
                    </p>
                    <p>
                      <span style={{ color: "#F9FAFB" }}>Synergies</span> are
                      the most powerful driver of accretion — they add net
                      income without adding shares, directly boosting EPS.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* ── SYNERGIES ─────────────────────────────────────────────────── */}
            {activeTab === "synergies" && (
              <div>
                <SectionHeader>Synergy Analysis</SectionHeader>
                <Sub>
                  Quantify cost savings and revenue uplift from combining the
                  two companies. Synergies justify the premium paid.
                </Sub>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#22C55E", fontFamily: "monospace" }}
                    >
                      COST SYNERGIES
                    </div>
                    <SliderRow
                      label="Annual Cost Synergies"
                      value={inputs.costSynergies}
                      min={0}
                      max={500}
                      step={5}
                      prefix="$"
                      unit="M"
                      onChange={(v) => setIn("costSynergies", v)}
                      note={`${inputs.tgtRevenue > 0 ? fmtN((inputs.costSynergies / inputs.tgtRevenue) * 100, 1) : 0}% of target revenue — typical range: 2–5%`}
                    />
                    <div
                      className="text-xs p-3 rounded-lg"
                      style={{ background: "#0D1420", color: "#6B7280" }}
                    >
                      <div
                        className="font-semibold mb-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        Common Sources
                      </div>
                      <ul className="space-y-0.5">
                        <li>• G&A overlap elimination (CFO, Legal, HR)</li>
                        <li>
                          • Procurement savings (combined purchasing power)
                        </li>
                        <li>• Facility & real estate consolidation</li>
                        <li>• Technology system deduplication</li>
                        <li>• Headcount reduction in redundant roles</li>
                      </ul>
                    </div>
                  </Card>

                  <Card>
                    <div
                      className="text-xs font-bold mb-4 tracking-widest"
                      style={{ color: "#3B82F6", fontFamily: "monospace" }}
                    >
                      REVENUE SYNERGIES
                    </div>
                    <SliderRow
                      label="Annual Revenue Synergies"
                      value={inputs.revSynergies}
                      min={0}
                      max={300}
                      step={5}
                      prefix="$"
                      unit="M"
                      onChange={(v) => setIn("revSynergies", v)}
                      note={`${inputs.tgtRevenue > 0 ? fmtN((inputs.revSynergies / inputs.tgtRevenue) * 100, 1) : 0}% of target revenue — typical range: 1–3%`}
                    />
                    <div
                      className="text-xs p-3 rounded-lg"
                      style={{ background: "#0D1420", color: "#6B7280" }}
                    >
                      <div
                        className="font-semibold mb-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        Common Sources
                      </div>
                      <ul className="space-y-0.5">
                        <li>• Cross-selling into each other's customer base</li>
                        <li>• New geographies / distribution channels</li>
                        <li>
                          • Combined product portfolio (upsell opportunity)
                        </li>
                        <li>• Pricing power from reduced competition</li>
                        <li>• Shared R&D and faster product development</li>
                      </ul>
                    </div>
                  </Card>
                </div>

                {/* Synergy Summary */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    SYNERGY SUMMARY
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Stat
                      label="Total Gross Synergies"
                      value={`$${fmtN(inputs.costSynergies + inputs.revSynergies, 0)}M`}
                      color={A.light}
                    />
                    <Stat
                      label="After-Tax Synergies"
                      value={fmtM(C.synAfterTax, 1)}
                      sub={`At ${inputs.taxRate}% tax rate`}
                      color={A.light}
                    />
                    <Stat
                      label="As % of Target Revenue"
                      value={fmtPct(C.synPct)}
                      sub={C.synPct < 7 ? "Achievable" : "Ambitious"}
                      color={C.synPct < 7 ? "#22C55E" : "#F97316"}
                    />
                    <Stat
                      label="Synergy Premium Coverage"
                      value={
                        C.dealValue > 0 && inputs.tgtEBITDA > 0
                          ? fmtPct(
                              ((inputs.costSynergies + inputs.revSynergies) /
                                (C.offerEV - C.compsEV)) *
                                100,
                            )
                          : "N/A"
                      }
                      sub="% of premium explained by synergies"
                      color="#22C55E"
                    />
                  </div>

                  <div
                    className="h-2 rounded-full mb-1"
                    style={{ background: "#1F2937" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (inputs.costSynergies / (inputs.costSynergies + inputs.revSynergies || 1)) * 100)}%`,
                        background: "linear-gradient(90deg, #22C55E, #3B82F6)",
                      }}
                    />
                  </div>
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: "#4B5563" }}
                  >
                    <span>
                      Cost: ${inputs.costSynergies}M (
                      {inputs.costSynergies + inputs.revSynergies > 0
                        ? fmtN(
                            (inputs.costSynergies /
                              (inputs.costSynergies + inputs.revSynergies)) *
                              100,
                            0,
                          )
                        : 0}
                      %)
                    </span>
                    <span>
                      Revenue: ${inputs.revSynergies}M (
                      {inputs.costSynergies + inputs.revSynergies > 0
                        ? fmtN(
                            (inputs.revSynergies /
                              (inputs.costSynergies + inputs.revSynergies)) *
                              100,
                            0,
                          )
                        : 0}
                      %)
                    </span>
                  </div>

                  <div
                    className="mt-4 p-3 rounded-lg text-xs"
                    style={{ background: "#0D1420", color: "#6B7280" }}
                  >
                    <span style={{ color: "#9CA3AF" }}>Rule of thumb: </span>
                    Cost synergies are highly credible and typically achieved
                    within 2 years. Revenue synergies are riskier — analysts
                    discount them 50% and model a 2–4 year ramp. Synergies above
                    10% of target revenue are viewed skeptically by investors.
                  </div>
                </Card>
              </div>
            )}

            {/* ── CREDIT & LEVERAGE ─────────────────────────────────────────── */}
            {activeTab === "credit" && (
              <div>
                <SectionHeader>Credit & Leverage Analysis</SectionHeader>
                <Sub>
                  Full debt tranche model, credit statistics, and paydown
                  schedule. This is the credit memo a lender writes before
                  committing to finance a deal.
                </Sub>

                {/* Tranche table */}
                <Card style={{ marginBottom: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#8B5CF6", fontFamily: "monospace" }}
                  >
                    DEBT CAPITAL STRUCTURE
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ color: "#4B5563" }}>
                          <td className="pb-2 pr-6">Tranche</td>
                          <td className="pb-2 pr-6 text-right">Amount ($M)</td>
                          <td className="pb-2 pr-6 text-right">x EBITDA</td>
                          <td className="pb-2 pr-6 text-right">Rate</td>
                          <td className="pb-2 pr-6 text-right">
                            Ann. Interest ($M)
                          </td>
                          <td className="pb-2 text-right">% of Cap Stack</td>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: "Senior Secured",
                            amount: C.seniorDebt,
                            xEBITDA: inputs.seniorLeverage,
                            rate: inputs.seniorRate,
                            interest: C.seniorInterest,
                            color: "#8B5CF6",
                          },
                          {
                            label: "Mezzanine / Sub Debt",
                            amount: C.mezzDebt,
                            xEBITDA: inputs.mezzLeverage,
                            rate: inputs.mezzRate,
                            interest: C.mezzInterest,
                            color: "#A78BFA",
                          },
                          {
                            label: "Revolver (undrawn)",
                            amount: inputs.revolver,
                            xEBITDA:
                              inputs.tgtEBITDA > 0
                                ? inputs.revolver / inputs.tgtEBITDA
                                : 0,
                            rate: inputs.seniorRate - 1,
                            interest: 0,
                            color: "#6B7280",
                          },
                          {
                            label: "Sponsor Equity",
                            amount: C.lboEquityTranche,
                            xEBITDA:
                              inputs.tgtEBITDA > 0
                                ? C.lboEquityTranche / inputs.tgtEBITDA
                                : 0,
                            rate: 0,
                            interest: 0,
                            color: "#F59E0B",
                          },
                        ].map((row) => {
                          const total =
                            C.totalTranchedDebt +
                            C.lboEquityTranche +
                            inputs.revolver;
                          const pct =
                            total > 0 ? (row.amount / total) * 100 : 0;
                          return (
                            <tr
                              key={row.label}
                              style={{ borderTop: "1px solid #1F2937" }}
                            >
                              <td
                                className="py-2 pr-6 font-medium"
                                style={{ color: row.color }}
                              >
                                {row.label}
                              </td>
                              <td
                                className="py-2 pr-6 text-right font-mono"
                                style={{ color: "#D1D5DB" }}
                              >
                                {fmtM(row.amount)}
                              </td>
                              <td
                                className="py-2 pr-6 text-right font-mono"
                                style={{ color: "#9CA3AF" }}
                              >
                                {fmtN(row.xEBITDA, 1)}x
                              </td>
                              <td
                                className="py-2 pr-6 text-right font-mono"
                                style={{ color: "#9CA3AF" }}
                              >
                                {row.rate > 0 ? fmtN(row.rate, 1) + "%" : "—"}
                              </td>
                              <td
                                className="py-2 pr-6 text-right font-mono"
                                style={{ color: "#9CA3AF" }}
                              >
                                {row.interest > 0 ? fmtM(row.interest) : "—"}
                              </td>
                              <td
                                className="py-2 text-right font-mono"
                                style={{ color: "#6B7280" }}
                              >
                                {fmtN(pct, 1)}%
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ borderTop: "2px solid #374151" }}>
                          <td
                            className="py-2 pr-6 font-bold"
                            style={{ color: "#F9FAFB" }}
                          >
                            Total Funded Debt
                          </td>
                          <td
                            className="py-2 pr-6 text-right font-mono font-bold"
                            style={{ color: "#F9FAFB" }}
                          >
                            {fmtM(C.totalTranchedDebt)}
                          </td>
                          <td
                            className="py-2 pr-6 text-right font-mono font-bold"
                            style={{ color: "#F9FAFB" }}
                          >
                            {fmtN(C.debtToEBITDA, 1)}x
                          </td>
                          <td className="py-2 pr-6" />
                          <td
                            className="py-2 pr-6 text-right font-mono font-bold"
                            style={{ color: "#F9FAFB" }}
                          >
                            {fmtM(C.totalLBOInterest)}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Credit metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Debt / EBITDA",
                      value: fmtN(C.debtToEBITDA, 1) + "x",
                      sub: "< 5x = acceptable for LBO",
                      color:
                        C.debtToEBITDA > 6
                          ? "#EF4444"
                          : C.debtToEBITDA > 5
                            ? "#F97316"
                            : "#22C55E",
                    },
                    {
                      label: "Interest Coverage",
                      value: fmtN(C.interestCovTranche, 1) + "x",
                      sub: "EBITDA ÷ interest — > 2x preferred",
                      color:
                        C.interestCovTranche < 1.5
                          ? "#EF4444"
                          : C.interestCovTranche < 2.5
                            ? "#F97316"
                            : "#22C55E",
                    },
                    {
                      label: "FCF / Total Debt (Yield)",
                      value: fmtN(C.fcfYield, 1) + "%",
                      sub: "Free cash flow as % of EV — > 5% preferred",
                      color:
                        C.fcfYield < 3
                          ? "#EF4444"
                          : C.fcfYield < 5
                            ? "#F97316"
                            : "#22C55E",
                    },
                    {
                      label: "DSCR",
                      value: fmtN(C.dscr, 1) + "x",
                      sub: "FCF ÷ interest — > 1.2x required",
                      color:
                        C.dscr < 1
                          ? "#EF4444"
                          : C.dscr < 1.5
                            ? "#F97316"
                            : "#22C55E",
                    },
                  ].map((m) => (
                    <Card key={m.label}>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        {m.label}
                      </div>
                      <div
                        className="text-2xl font-bold font-mono mb-1"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </div>
                      <div className="text-xs" style={{ color: "#4B5563" }}>
                        {m.sub}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Debt paydown schedule */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#8B5CF6", fontFamily: "monospace" }}
                  >
                    DEBT PAYDOWN SCHEDULE
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ color: "#4B5563" }}>
                          <td className="pb-2 pr-6">Year</td>
                          <td className="pb-2 pr-6 text-right">
                            Opening Debt ($M)
                          </td>
                          <td className="pb-2 pr-6 text-right">FCF ($M)</td>
                          <td className="pb-2 pr-6 text-right">
                            Repayment ($M)
                          </td>
                          <td className="pb-2 text-right">Closing Debt ($M)</td>
                        </tr>
                      </thead>
                      <tbody>
                        {C.debtSchedule.map((row) => (
                          <tr
                            key={row.yr}
                            style={{ borderTop: "1px solid #1F2937" }}
                          >
                            <td
                              className="py-2 pr-6"
                              style={{ color: "#9CA3AF" }}
                            >
                              Year {row.yr}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: "#D1D5DB" }}
                            >
                              {fmtM(row.openDebt)}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: "#22C55E" }}
                            >
                              {fmtM(row.fcfYr)}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: "#8B5CF6" }}
                            >
                              {fmtM(row.repayment)}
                            </td>
                            <td
                              className="py-2 text-right font-mono"
                              style={{ color: "#F9FAFB" }}
                            >
                              {fmtM(row.closeDebt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="mt-4 p-3 rounded-lg text-xs"
                    style={{ background: "#1F2937", color: "#6B7280" }}
                  >
                    <strong style={{ color: "#9CA3AF" }}>
                      Model assumption:
                    </strong>{" "}
                    70% of FCF allocated to debt repayment annually. FCF grows
                    at half the revenue CAGR to be conservative. Adjust
                    Senior/Mezz rates and hold period in Deal Setup to see how
                    the schedule changes.
                  </div>
                </Card>
              </div>
            )}

            {/* ── RETURNS ────────────────────────────────────────────────────── */}
            {activeTab === "returns" && (
              <div>
                <SectionHeader>Returns Analysis</SectionHeader>
                <Sub>
                  IRR and MOIC sensitivity across exit multiples and hold
                  periods. The industry standard is 20–25%+ IRR for a buyout.
                </Sub>

                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Tranche-Model IRR",
                      value: fmtN(C.irrTranche, 1) + "%",
                      sub: `${inputs.holdPeriod}-year hold, ${fmtN(C.exitMultipleFinal, 1)}x exit`,
                      color:
                        C.irrTranche >= 25
                          ? "#22C55E"
                          : C.irrTranche >= 20
                            ? "#F59E0B"
                            : C.irrTranche >= 15
                              ? "#F97316"
                              : "#EF4444",
                    },
                    {
                      label: "MOIC",
                      value: fmtN(C.moicTranche, 1) + "x",
                      sub: "Entry equity to exit equity",
                      color:
                        C.moicTranche >= 3
                          ? "#22C55E"
                          : C.moicTranche >= 2
                            ? "#F59E0B"
                            : "#EF4444",
                    },
                    {
                      label: "Exit EV",
                      value: fmtM(C.exitEVHold),
                      sub: `${fmtN(C.exitMultipleFinal, 1)}x EBITDA at exit`,
                      color: "#6366F1",
                    },
                    {
                      label: "Debt at Exit",
                      value: fmtM(C.debtAtExit),
                      sub: `After ${inputs.holdPeriod}yr paydown`,
                      color: "#9CA3AF",
                    },
                  ].map((m) => (
                    <Card key={m.label}>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        {m.label}
                      </div>
                      <div
                        className="text-2xl font-bold font-mono mb-1"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </div>
                      <div className="text-xs" style={{ color: "#4B5563" }}>
                        {m.sub}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Sensitivity matrix */}
                <Card style={{ marginBottom: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-1 tracking-widest"
                    style={{ color: "#6366F1", fontFamily: "monospace" }}
                  >
                    IRR SENSITIVITY — Hold Period × Exit Multiple
                  </div>
                  <div className="text-xs mb-4" style={{ color: "#4B5563" }}>
                    Green = ≥25% IRR (top-quartile) · Amber = 20–25% · Orange =
                    15–20% · Red = &lt;15%
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <td
                            className="pb-2 pr-4 text-xs"
                            style={{ color: "#6B7280" }}
                          >
                            Hold → Exit Multiple ↓
                          </td>
                          {C.exitMultiplesRange.map((em) => (
                            <td
                              key={em}
                              className="pb-2 pr-2 text-right font-mono text-xs"
                              style={{ color: "#6B7280" }}
                            >
                              {fmtN(em, 1)}x
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {C.sensitivityMatrix.map((row) => (
                          <tr
                            key={row.holdPeriod}
                            style={{ borderTop: "1px solid #1F2937" }}
                          >
                            <td
                              className="py-2 pr-4 font-medium"
                              style={{ color: "#9CA3AF" }}
                            >
                              {row.holdPeriod} yrs
                            </td>
                            {row.irrs.map((irr2, i) => {
                              const irrColor =
                                irr2 >= 25
                                  ? "#22C55E"
                                  : irr2 >= 20
                                    ? "#F59E0B"
                                    : irr2 >= 15
                                      ? "#F97316"
                                      : "#EF4444";
                              const isBold =
                                row.holdPeriod === inputs.holdPeriod &&
                                Math.abs(
                                  C.exitMultiplesRange[i] - C.exitMultipleFinal,
                                ) < 0.1;
                              return (
                                <td
                                  key={i}
                                  className="py-2 pr-2 text-right font-mono"
                                  style={{
                                    color: irrColor,
                                    fontWeight: isBold ? 700 : 400,
                                    background: isBold
                                      ? "rgba(99,102,241,0.12)"
                                      : "transparent",
                                    borderRadius: isBold ? "4px" : "0",
                                  }}
                                >
                                  {irr2 > 0 ? fmtN(irr2, 1) + "%" : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Returns bridge */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#6366F1", fontFamily: "monospace" }}
                  >
                    RETURNS BRIDGE
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Entry EV (Offer)",
                        value: C.offerEV,
                        color: "#6366F1",
                        sign: "",
                      },
                      {
                        label: "→ Entry Debt Raised",
                        value: -C.totalTranchedDebt,
                        color: "#8B5CF6",
                        sign: "",
                      },
                      {
                        label: "→ Equity Check (entry)",
                        value: C.lboEquityTranche,
                        color: "#F59E0B",
                        sign: "",
                        bold: true,
                      },
                      {
                        label: "Exit EV",
                        value: C.exitEVHold,
                        color: "#22C55E",
                        sign: "",
                      },
                      {
                        label: "→ Remaining Debt at Exit",
                        value: -C.debtAtExit,
                        color: "#EF4444",
                        sign: "",
                      },
                      {
                        label: "→ Exit Equity Proceeds",
                        value: C.exitEquityHold,
                        color: "#22C55E",
                        sign: "",
                        bold: true,
                      },
                      {
                        label: "MOIC",
                        value: C.moicTranche,
                        color: C.moicTranche >= 2.5 ? "#22C55E" : "#F97316",
                        suffix: "x",
                        skip$: true,
                        bold: true,
                      },
                      {
                        label: "IRR",
                        value: C.irrTranche,
                        color: C.irrTranche >= 20 ? "#22C55E" : "#F97316",
                        suffix: "%",
                        skip$: true,
                        bold: true,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center py-1"
                        style={{ borderBottom: "1px solid #1F2937" }}
                      >
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>
                          {row.label}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{
                            color: row.color,
                            fontWeight: (row as { bold?: boolean }).bold
                              ? 700
                              : 400,
                          }}
                        >
                          {(row as { skip$?: boolean }).skip$
                            ? fmtN(row.value, 1) +
                              ((row as { suffix?: string }).suffix ?? "")
                            : row.value < 0
                              ? `-${fmtM(-row.value)}`
                              : fmtM(row.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── CONTRIBUTION ───────────────────────────────────────────────── */}
            {activeTab === "contribution" && (
              <div>
                <SectionHeader>Contribution Analysis</SectionHeader>
                <Sub>
                  Who brings what to the combined company? Contribution analysis
                  shows each party's share of combined revenue, EBITDA, and
                  ownership — essential for evaluating deal fairness.
                </Sub>

                {/* Pro forma summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    {
                      title: "REVENUE CONTRIBUTION",
                      total: C.proFormaRevenueCombined,
                      rows: [
                        {
                          label: inputs.acqName || "Acquirer",
                          value: inputs.acqRevenue,
                          pct: C.acqRevContrib,
                          color: "#6366F1",
                        },
                        {
                          label: inputs.tgtName || "Target",
                          value: inputs.tgtRevenue,
                          pct: C.tgtRevContrib,
                          color: A.light,
                        },
                        {
                          label: "Revenue Synergies",
                          value: inputs.revSynergies,
                          pct: C.synRevContrib,
                          color: "#22C55E",
                        },
                      ],
                    },
                    {
                      title: "EBITDA CONTRIBUTION",
                      total: C.proFormaEBITDACombined,
                      rows: [
                        {
                          label: inputs.acqName || "Acquirer",
                          value: inputs.acqEBITDA,
                          pct: C.acqEBITDAContrib,
                          color: "#6366F1",
                        },
                        {
                          label: inputs.tgtName || "Target",
                          value: inputs.tgtEBITDA,
                          pct: C.tgtEBITDAContrib,
                          color: A.light,
                        },
                        {
                          label: "Total Synergies",
                          value: inputs.costSynergies + inputs.revSynergies,
                          pct: C.synEBITDAContrib,
                          color: "#22C55E",
                        },
                      ],
                    },
                    {
                      title: "OWNERSHIP (PRO FORMA)",
                      total: 100,
                      rows: [
                        {
                          label: "Existing Shareholders",
                          value: C.acqOwnership,
                          pct: C.acqOwnership,
                          color: "#6366F1",
                          isPct: true,
                        },
                        {
                          label: "Target Shareholders",
                          value: C.tgtShareholderOwnership,
                          pct: C.tgtShareholderOwnership,
                          color: A.light,
                          isPct: true,
                        },
                      ],
                    },
                  ].map((section) => (
                    <Card key={section.title}>
                      <div
                        className="text-xs font-bold mb-4 tracking-widest"
                        style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                      >
                        {section.title}
                      </div>
                      {section.rows.map((row) => (
                        <div key={row.label} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: row.color }}>
                              {row.label}
                            </span>
                            <span style={{ color: "#9CA3AF" }}>
                              {(row as { isPct?: boolean }).isPct
                                ? fmtN(row.value, 1) + "%"
                                : fmtM(row.value)}{" "}
                              · {fmtN(row.pct, 1)}%
                            </span>
                          </div>
                          <div
                            className="rounded-full overflow-hidden"
                            style={{ height: 6, background: "#1F2937" }}
                          >
                            <div
                              style={{
                                width: `${Math.max(0, Math.min(100, row.pct))}%`,
                                height: "100%",
                                background: row.color,
                                borderRadius: "999px",
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <div
                        className="pt-2 mt-2 flex justify-between text-xs font-bold"
                        style={{
                          borderTop: "1px solid #1F2937",
                          color: "#F9FAFB",
                        }}
                      >
                        <span>Combined Total</span>
                        <span>
                          {section.title.includes("OWN")
                            ? "100%"
                            : fmtM(section.total)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pro forma income statement */}
                <Card style={{ marginBottom: "1.5rem" }}>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    PRO FORMA INCOME STATEMENT BRIDGE
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ color: "#4B5563" }}>
                          <td className="pb-2 pr-6">Line Item ($M)</td>
                          <td className="pb-2 pr-6 text-right">
                            {inputs.acqName || "Acquirer"}
                          </td>
                          <td className="pb-2 pr-6 text-right">
                            {inputs.tgtName || "Target"}
                          </td>
                          <td className="pb-2 pr-6 text-right">Synergies</td>
                          <td className="pb-2 pr-6 text-right">
                            Adj. (Interest/D&A)
                          </td>
                          <td className="pb-2 text-right">Pro Forma</td>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: "Revenue",
                            acq: inputs.acqRevenue,
                            tgt: inputs.tgtRevenue,
                            syn: inputs.revSynergies,
                            adj: 0,
                            pf: C.proFormaRevenueCombined,
                          },
                          {
                            label: "EBITDA",
                            acq: inputs.acqEBITDA,
                            tgt: inputs.tgtEBITDA,
                            syn: inputs.costSynergies + inputs.revSynergies,
                            adj: 0,
                            pf: C.proFormaEBITDACombined,
                          },
                          {
                            label: "Net Income",
                            acq: inputs.acqNI,
                            tgt: inputs.tgtNI,
                            syn: C.synAfterTax,
                            adj: -(C.newInterestAfterTax + C.daStepUpAfterTax),
                            pf: C.proFormaNI,
                          },
                          {
                            label: "EPS",
                            acq: C.standaloneEPS,
                            tgt:
                              inputs.tgtShares > 0
                                ? inputs.tgtNI / inputs.tgtShares
                                : 0,
                            syn: 0,
                            adj: 0,
                            pf: C.proFormaEPS,
                            isEPS: true,
                          },
                        ].map((row) => (
                          <tr
                            key={row.label}
                            style={{ borderTop: "1px solid #1F2937" }}
                          >
                            <td
                              className="py-2 pr-6 font-medium"
                              style={{ color: "#D1D5DB" }}
                            >
                              {row.label}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: "#6366F1" }}
                            >
                              {(row as { isEPS?: boolean }).isEPS
                                ? "$" + fmtN(row.acq, 2)
                                : fmtM(row.acq)}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: A.light }}
                            >
                              {(row as { isEPS?: boolean }).isEPS
                                ? "$" + fmtN(row.tgt, 2)
                                : fmtM(row.tgt)}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{ color: "#22C55E" }}
                            >
                              {(row as { isEPS?: boolean }).isEPS
                                ? "—"
                                : fmtM(row.syn)}
                            </td>
                            <td
                              className="py-2 pr-6 text-right font-mono"
                              style={{
                                color: row.adj < 0 ? "#EF4444" : "#9CA3AF",
                              }}
                            >
                              {(row as { isEPS?: boolean }).isEPS
                                ? "—"
                                : row.adj !== 0
                                  ? fmtM(row.adj)
                                  : "—"}
                            </td>
                            <td
                              className="py-2 text-right font-mono font-bold"
                              style={{ color: "#F9FAFB" }}
                            >
                              {(row as { isEPS?: boolean }).isEPS
                                ? "$" + fmtN(row.pf, 2)
                                : fmtM(row.pf)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* EPS accretion detail */}
                <Card>
                  <div
                    className="text-xs font-bold mb-4 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    EPS BRIDGE — STANDALONE TO PRO FORMA
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Acquirer Standalone EPS",
                        value: C.standaloneEPS,
                        color: "#6366F1",
                      },
                      {
                        label: "+ Target Net Income (per acq. share)",
                        value: inputs.tgtNI / Math.max(1, C.proFormaShares),
                        color: A.light,
                      },
                      {
                        label: "+ After-Tax Synergies (per share)",
                        value: C.synAfterTax / Math.max(1, C.proFormaShares),
                        color: "#22C55E",
                      },
                      {
                        label: "− Interest on Deal Debt (per share)",
                        value:
                          -C.newInterestAfterTax /
                          Math.max(1, C.proFormaShares),
                        color: "#EF4444",
                      },
                      {
                        label: "− D&A Step-Up (per share)",
                        value:
                          -C.daStepUpAfterTax / Math.max(1, C.proFormaShares),
                        color: "#EF4444",
                      },
                      {
                        label: "Pro Forma EPS",
                        value: C.proFormaEPS,
                        color: C.isAccretive ? "#22C55E" : "#EF4444",
                        bold: true,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between text-xs py-1"
                        style={{ borderBottom: "1px solid #1F2937" }}
                      >
                        <span style={{ color: "#9CA3AF" }}>{row.label}</span>
                        <span
                          className="font-mono"
                          style={{
                            color: row.color,
                            fontWeight: (row as { bold?: boolean }).bold
                              ? 700
                              : 400,
                          }}
                        >
                          ${fmtN(row.value, 2)}
                        </span>
                      </div>
                    ))}
                    <div
                      className="pt-2 text-xs text-center font-bold"
                      style={{ color: C.isAccretive ? "#22C55E" : "#EF4444" }}
                    >
                      {C.isAccretive ? "▲ ACCRETIVE" : "▼ DILUTIVE"} —{" "}
                      {fmtN(Math.abs(C.epsChangePct), 1)}% EPS{" "}
                      {C.isAccretive ? "increase" : "decrease"}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── DEAL SCORE ────────────────────────────────────────────────── */}
            {activeTab === "score" && (
              <div>
                <SectionHeader>Deal Score</SectionHeader>
                <Sub>
                  100-point rubric across five dimensions. This is the framework
                  used by IB analysts and DECA/YIS finance judges to evaluate
                  deal quality.
                </Sub>

                {/* Score display */}
                <div className="flex items-center gap-8 mb-8">
                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: 120,
                      height: 120,
                      background: `conic-gradient(${scoreColor} ${C.totalScore * 3.6}deg, #1F2937 0deg)`,
                    }}
                  >
                    <div
                      className="flex flex-col items-center justify-center rounded-full"
                      style={{
                        width: 92,
                        height: 92,
                        background: "#111827",
                      }}
                    >
                      <span
                        className="text-3xl font-bold font-serif"
                        style={{ color: scoreColor }}
                      >
                        {C.totalScore}
                      </span>
                      <span className="text-xs" style={{ color: "#4B5563" }}>
                        / 100
                      </span>
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-2xl font-bold font-serif mb-1"
                      style={{ color: scoreColor }}
                    >
                      {scoreLabel}
                    </div>
                    <div className="text-sm" style={{ color: "#6B7280" }}>
                      {C.totalScore >= 80
                        ? "This deal creates clear shareholder value with manageable risk."
                        : C.totalScore >= 60
                          ? "A reasonable deal with some areas to strengthen."
                          : C.totalScore >= 40
                            ? "Significant issues — revisit premium, leverage, or synergies."
                            : "This deal as structured is value-destructive. Major changes needed."}
                    </div>
                  </div>
                </div>

                {/* Score breakdown */}
                <Card>
                  <div
                    className="text-xs font-bold mb-5 tracking-widest"
                    style={{ color: "#9CA3AF", fontFamily: "monospace" }}
                  >
                    RUBRIC BREAKDOWN
                  </div>

                  <ScoreBar
                    label="Accretion / Dilution (25 pts)"
                    score={C.accrScore}
                    max={25}
                    color={C.isAccretive ? "#22C55E" : "#EF4444"}
                  />
                  <div
                    className="text-xs mb-5"
                    style={{ color: "#4B5563", marginTop: "-0.75rem" }}
                  >
                    {C.isAccretive
                      ? `Deal is accretive (+${fmtN(C.epsChangePct, 1)}%). Full marks.`
                      : `Deal is dilutive (${fmtN(C.epsChangePct, 1)}%). Add synergies, reduce premium, or increase cash mix.`}
                  </div>

                  <ScoreBar
                    label="Premium Reasonableness (20 pts)"
                    score={C.premScore}
                    max={20}
                    color={A.light}
                  />
                  <div
                    className="text-xs mb-5"
                    style={{ color: "#4B5563", marginTop: "-0.75rem" }}
                  >
                    {inputs.offerPremium < 15
                      ? "Premium too low — target may reject or trigger auction."
                      : inputs.offerPremium <= 45
                        ? `${inputs.offerPremium}% premium is within the 15–45% strategic target range.`
                        : `${inputs.offerPremium}% premium is high — ensure synergies justify the cost.`}
                  </div>

                  <ScoreBar
                    label="Leverage Ratio (20 pts)"
                    score={C.levScore}
                    max={20}
                    color="#60A5FA"
                  />
                  <div
                    className="text-xs mb-5"
                    style={{ color: "#4B5563", marginTop: "-0.75rem" }}
                  >
                    {fmtN(C.leverageRatio, 1)}x Debt/EBITDA.{" "}
                    {C.leverageRatio < 3
                      ? "Conservative leverage — strong credit profile."
                      : C.leverageRatio < 5
                        ? "Moderate leverage — manageable for most deals."
                        : "High leverage — elevated credit risk, limited flexibility."}
                  </div>

                  <ScoreBar
                    label="Synergy Achievability (20 pts)"
                    score={C.synScore}
                    max={20}
                    color="#A78BFA"
                  />
                  <div
                    className="text-xs mb-5"
                    style={{ color: "#4B5563", marginTop: "-0.75rem" }}
                  >
                    {fmtPct(C.synPct)} of target revenue in synergies.{" "}
                    {C.synPct < 4
                      ? "Conservative and credible."
                      : C.synPct < 7
                        ? "Achievable with solid integration planning."
                        : "Ambitious — execution risk is elevated."}
                  </div>

                  <ScoreBar
                    label="Strategic Rationale (15 pts)"
                    score={C.strScore}
                    max={15}
                    color="#F472B6"
                  />
                  <div
                    className="text-xs mb-1"
                    style={{ color: "#4B5563", marginTop: "-0.75rem" }}
                  >
                    {inputs.dealType === "strategic"
                      ? "Strategic acquisition — clear industrial logic, potential for long-term value creation."
                      : "Financial acquisition (LBO) — return-driven with a defined exit horizon."}
                  </div>
                </Card>

                {/* Improvement tips */}
                {C.totalScore < 80 && (
                  <Card style={{ marginTop: "1.5rem" }}>
                    <div
                      className="text-xs font-bold mb-3 tracking-widest"
                      style={{ color: A.light, fontFamily: "monospace" }}
                    >
                      HOW TO IMPROVE YOUR SCORE
                    </div>
                    <ul
                      className="space-y-2 text-sm"
                      style={{ color: "#6B7280" }}
                    >
                      {!C.isAccretive && (
                        <li>
                          <span style={{ color: "#F9FAFB" }}>
                            ▲ Make the deal accretive:
                          </span>{" "}
                          increase synergies, reduce the premium, shift to more
                          cash (if target earnings yield {">"} debt cost), or
                          increase target earnings.
                        </li>
                      )}
                      {inputs.offerPremium > 45 && (
                        <li>
                          <span style={{ color: "#F9FAFB" }}>
                            ▼ Reduce the premium:
                          </span>{" "}
                          a {inputs.offerPremium}% premium requires substantial
                          synergies to be rational. Target 20–40% for strategic
                          deals.
                        </li>
                      )}
                      {C.leverageRatio > 4 && (
                        <li>
                          <span style={{ color: "#F9FAFB" }}>
                            ↓ Reduce leverage:
                          </span>{" "}
                          {fmtN(C.leverageRatio, 1)}x Debt/EBITDA is elevated.
                          Consider more stock consideration or a lower purchase
                          price.
                        </li>
                      )}
                      {C.synPct > 7 && (
                        <li>
                          <span style={{ color: "#F9FAFB" }}>
                            ⚠ Lower synergy targets:
                          </span>{" "}
                          {fmtPct(C.synPct)} of target revenue is optimistic.
                          Reduce to below 7% for a credible case.
                        </li>
                      )}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            {/* ── GLOSSARY ──────────────────────────────────────────────────── */}
            {activeTab === "glossary" && (
              <div>
                <SectionHeader>IB Glossary</SectionHeader>
                <Sub>
                  Every term you need to understand M&A — from accretion to
                  WACC. Essential for IB interviews, finance competitions, and
                  understanding this simulator.
                </Sub>

                <div className="mb-5">
                  <input
                    type="text"
                    placeholder="Search terms…"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      color: "#F9FAFB",
                      outline: "none",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredGlossary.map((g) => (
                    <Card key={g.term}>
                      <div
                        className="text-sm font-bold mb-1"
                        style={{ color: A.light }}
                      >
                        {g.term}
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: "#6B7280" }}
                      >
                        {g.def}
                      </div>
                    </Card>
                  ))}
                  {filteredGlossary.length === 0 && (
                    <div
                      className="col-span-2 text-center py-8 text-sm"
                      style={{ color: "#4B5563" }}
                    >
                      No terms matching "{glossarySearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
