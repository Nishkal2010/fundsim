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
  | "score"
  | "glossary";

interface DealInputs {
  acqName: string;
  acqRevenue: number;
  acqEBITDA: number;
  acqNI: number;
  acqShares: number;
  acqPrice: number;
  acqNetDebt: number;
  tgtName: string;
  tgtRevenue: number;
  tgtEBITDA: number;
  tgtNI: number;
  tgtShares: number;
  tgtPrice: number;
  tgtNetDebt: number;
  sector: string;
  dealType: string;
  offerPremium: number;
  cashPct: number;
  debtRate: number;
  costSynergies: number;
  revSynergies: number;
  wacc: number;
  revenueGrowth: number;
  terminalGrowth: number;
  ebitdaMarginPct: number;
  capexPct: number;
  taxRate: number;
}

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS: Record<string, DealInputs> = {
  tech: {
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
  },
  biotech: {
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
  },
  lbo: {
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
];

const TABS: { id: TabId; label: string }[] = [
  { id: "setup", label: "Deal Setup" },
  { id: "valuation", label: "Valuation" },
  { id: "offer", label: "Offer & Structure" },
  { id: "accretion", label: "Accretion / Dilution" },
  { id: "synergies", label: "Synergies" },
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
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(d)}M`;
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

    // DCF 5-year
    const DA_RATE = 0.08;
    const NWC_RATE = 0.02;
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

    // LBO
    const lboDebt = cashAmount * 0.65;
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

    // Leverage
    const leverageRatio = tgtEBITDA > 0 ? cashAmount / tgtEBITDA : 0;
    const interestCoverage =
      newInterest > 0
        ? (tgtEBITDA + (costSynergies + revSynergies)) / newInterest
        : 99;

    // Synergy as % of target revenue
    const synPct =
      tgtRevenue > 0 ? ((costSynergies + revSynergies) / tgtRevenue) * 100 : 0;

    // Score
    const accrScore = isAccretive ? 25 : Math.max(0, 25 + epsChangePct * 1.5);
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
                <div className="flex gap-3 mb-6">
                  {[
                    {
                      key: "tech",
                      label: "Tech Acquisition",
                      sub: "NovaSphere → CloudAxis",
                    },
                    {
                      key: "biotech",
                      label: "Pharma M&A",
                      sub: "OmegaPharma → ViriGen",
                    },
                    {
                      key: "lbo",
                      label: "LBO",
                      sub: "Cascade Capital → Ridgemont",
                    },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setInputs(PRESETS[p.key])}
                      className="flex-1 p-3 rounded-xl text-left"
                      style={{
                        background:
                          inputs.acqName === PRESETS[p.key].acqName
                            ? A.dim
                            : "#111827",
                        border: `1px solid ${inputs.acqName === PRESETS[p.key].acqName ? A.border : "#374151"}`,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="text-xs font-bold mb-0.5"
                        style={{ color: A.light }}
                      >
                        {p.label}
                      </div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>
                        {p.sub}
                      </div>
                    </button>
                  ))}
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
                    <NumInput
                      label="Company Name"
                      value={0}
                      onChange={() => {}}
                      prefix=""
                    />
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
                        <option value="strategic">
                          Strategic (Corporate Buyer)
                        </option>
                        <option value="financial">Financial (LBO / PE)</option>
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
