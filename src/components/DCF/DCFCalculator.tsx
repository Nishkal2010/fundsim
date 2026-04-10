import React, { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DCFInputs {
  companyName: string;
  ticker: string;
  sector: string;
  currency: string;
  // Financials
  baseRevenue: number;
  baseEBITDA: number;
  baseEBIT: number;
  baseNetIncome: number;
  baseDPS: number;
  // Projection
  projectionYears: number;
  revenueGrowthMode: string; // uniform | stepdown | manual
  uniformGrowthRate: number;
  stepdownHighRate: number;
  stepdownLowRate: number;
  stepdownTransitionYear: number;
  revenueGrowthYr: number[];
  // Margins / Ratios
  ebitdaMargin: number;
  ebitMargin: number;
  daRate: number;
  daMethod: string; // pct_revenue | fixed
  capexRate: number;
  capexMethod: string; // pct_revenue | pct_da
  nwcRate: number;
  nwcMethod: string; // pct_revenue | fixed
  sbcRate: number;
  taxRate: number;
  taxMethod: string; // statutory | effective | override
  nolBalance: number;
  // WACC
  waccMethod: string; // capm | buildup | override
  riskFreeRate: number;
  equityRiskPremium: number;
  beta: number;
  betaType: string; // raw | adjusted | relevered
  debtBeta: number;
  sizePreium: number;
  specificRisk: number;
  preTaxCostOfDebt: number;
  targetDebtRatio: number;
  waccOverride: number;
  // Terminal
  terminalMethod: string; // gordon | exit_multiple | avg
  terminalGrowthRate: number;
  terminalEVEBITDA: number;
  // Bridge
  sharesOutstanding: number;
  netDebt: number;
  minorityInterest: number;
  preferredStock: number;
  // FCFE
  netBorrowingRate: number;
  // DDM
  dividendGrowthPhase1: number;
  dividendGrowthPhase2: number;
  dividendPhase1Years: number;
  // APV
  annualInterestExpense: number;
  debtTaxShieldDiscount: string; // rf | kd
  // Scenarios
  bullRevenueAdj: number;
  bearRevenueAdj: number;
  bullMarginAdj: number;
  bearMarginAdj: number;
  bullWACCAdj: number;
  bearWACCAdj: number;
  bullTGRAdj: number;
  bearTGRAdj: number;
  bullExitMultipleAdj: number;
  bearExitMultipleAdj: number;
  // Football field ranges
  ffWACCLow: number;
  ffWACCHigh: number;
  ffTGRLow: number;
  ffTGRHigh: number;
  ffExitLow: number;
  ffExitHigh: number;
}

type TabId =
  | "setup"
  | "projections"
  | "fcff"
  | "fcfe"
  | "ddm"
  | "apv"
  | "sensitivity"
  | "scenarios"
  | "football";

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string }[] = [
  { id: "setup", label: "Setup & WACC" },
  { id: "projections", label: "Projections" },
  { id: "fcff", label: "FCFF (Unlevered)" },
  { id: "fcfe", label: "FCFE (Levered)" },
  { id: "ddm", label: "DDM" },
  { id: "apv", label: "APV" },
  { id: "sensitivity", label: "Sensitivity" },
  { id: "scenarios", label: "Scenarios" },
  { id: "football", label: "Football Field" },
];

const SECTORS = [
  "Technology",
  "Healthcare",
  "Consumer Discretionary",
  "Consumer Staples",
  "Financials",
  "Industrials",
  "Energy",
  "Materials",
  "Real Estate",
  "Utilities",
  "Telecommunications",
];

const DEFAULTS: DCFInputs = {
  companyName: "Acme Corp",
  ticker: "ACME",
  sector: "Technology",
  currency: "USD",
  baseRevenue: 1000,
  baseEBITDA: 200,
  baseEBIT: 160,
  baseNetIncome: 110,
  baseDPS: 1.2,
  projectionYears: 5,
  revenueGrowthMode: "uniform",
  uniformGrowthRate: 10,
  stepdownHighRate: 20,
  stepdownLowRate: 5,
  stepdownTransitionYear: 3,
  revenueGrowthYr: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  ebitdaMargin: 20,
  ebitMargin: 16,
  daRate: 4,
  daMethod: "pct_revenue",
  capexRate: 5,
  capexMethod: "pct_revenue",
  nwcRate: 2,
  nwcMethod: "pct_revenue",
  sbcRate: 2,
  taxRate: 21,
  taxMethod: "statutory",
  nolBalance: 0,
  waccMethod: "capm",
  riskFreeRate: 4.2,
  equityRiskPremium: 5.5,
  beta: 1.1,
  betaType: "adjusted",
  debtBeta: 0.1,
  sizePreium: 0,
  specificRisk: 0,
  preTaxCostOfDebt: 6,
  targetDebtRatio: 20,
  waccOverride: 0,
  terminalMethod: "gordon",
  terminalGrowthRate: 2.5,
  terminalEVEBITDA: 10,
  sharesOutstanding: 100,
  netDebt: 200,
  minorityInterest: 0,
  preferredStock: 0,
  netBorrowingRate: 4,
  dividendGrowthPhase1: 8,
  dividendGrowthPhase2: 3,
  dividendPhase1Years: 5,
  annualInterestExpense: 12,
  debtTaxShieldDiscount: "rf",
  bullRevenueAdj: 3,
  bearRevenueAdj: -3,
  bullMarginAdj: 2,
  bearMarginAdj: -2,
  bullWACCAdj: -1,
  bearWACCAdj: 1.5,
  bullTGRAdj: 0.5,
  bearTGRAdj: -0.5,
  bullExitMultipleAdj: 2,
  bearExitMultipleAdj: -2,
  ffWACCLow: 7,
  ffWACCHigh: 11,
  ffTGRLow: 1.5,
  ffTGRHigh: 3.5,
  ffExitLow: 8,
  ffExitHigh: 12,
};

const PRESETS: Record<string, Partial<DCFInputs>> = {
  tech: {
    companyName: "TechGrowth Inc",
    sector: "Technology",
    baseRevenue: 2000,
    baseEBITDA: 500,
    baseEBIT: 420,
    baseNetIncome: 310,
    baseDPS: 0,
    uniformGrowthRate: 18,
    ebitdaMargin: 25,
    ebitMargin: 21,
    beta: 1.35,
    preTaxCostOfDebt: 5.5,
    targetDebtRatio: 10,
    terminalGrowthRate: 3,
    terminalEVEBITDA: 14,
    netDebt: -500,
    sharesOutstanding: 200,
  },
  consumer: {
    companyName: "BrandCo Consumer",
    sector: "Consumer Staples",
    baseRevenue: 5000,
    baseEBITDA: 1000,
    baseEBIT: 800,
    baseNetIncome: 550,
    baseDPS: 2.5,
    uniformGrowthRate: 5,
    ebitdaMargin: 20,
    ebitMargin: 16,
    beta: 0.75,
    preTaxCostOfDebt: 5,
    targetDebtRatio: 30,
    terminalGrowthRate: 2,
    terminalEVEBITDA: 9,
    netDebt: 1000,
    sharesOutstanding: 500,
    dividendGrowthPhase1: 5,
    dividendGrowthPhase2: 2,
  },
  industrial: {
    companyName: "IndustrialCo",
    sector: "Industrials",
    baseRevenue: 3000,
    baseEBITDA: 480,
    baseEBIT: 360,
    baseNetIncome: 240,
    baseDPS: 1.8,
    uniformGrowthRate: 6,
    ebitdaMargin: 16,
    ebitMargin: 12,
    beta: 1.1,
    capexRate: 8,
    preTaxCostOfDebt: 6,
    targetDebtRatio: 35,
    terminalGrowthRate: 2,
    terminalEVEBITDA: 8,
    netDebt: 800,
    sharesOutstanding: 300,
  },
  healthcare: {
    companyName: "BioHealth Corp",
    sector: "Healthcare",
    baseRevenue: 1500,
    baseEBITDA: 450,
    baseEBIT: 390,
    baseNetIncome: 290,
    baseDPS: 0.8,
    uniformGrowthRate: 12,
    ebitdaMargin: 30,
    ebitMargin: 26,
    beta: 0.9,
    preTaxCostOfDebt: 4.5,
    targetDebtRatio: 15,
    terminalGrowthRate: 2.5,
    terminalEVEBITDA: 12,
    netDebt: 100,
    sharesOutstanding: 150,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const D = {
  bg: "#0A0F1C",
  card: "#111827",
  border: "#1E3A5F",
  primary: "#2563EB",
  light: "#60A5FA",
  muted: "#64748B",
  text: "#E2E8F0",
  sub: "#94A3B8",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
  purple: "#A855F7",
};

const fmt = (n: number, dec = 1) => (isFinite(n) ? n.toFixed(dec) : "—");
const fmtM = (n: number) => (isFinite(n) ? `$${(n / 1).toFixed(1)}M` : "—");
const fmtPct = (n: number) => (isFinite(n) ? `${n.toFixed(1)}%` : "—");
const fmtX = (n: number) => (isFinite(n) ? `${n.toFixed(2)}x` : "—");

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: D.card,
        border: `1px solid ${D.border}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 14,
      }}
    >
      {title && (
        <div
          style={{
            color: D.light,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: D.sub, fontSize: 12, minWidth: 200 }}>{label}</span>
      {children}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  prefix = "",
  suffix = "",
  width = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  width?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {prefix && <span style={{ color: D.sub, fontSize: 11 }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: "#1E293B",
          border: `1px solid ${D.border}`,
          borderRadius: 6,
          color: D.text,
          fontSize: 13,
          padding: "4px 8px",
          width,
          outline: "none",
        }}
      />
      {suffix && <span style={{ color: D.sub, fontSize: 11 }}>{suffix}</span>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  width = 160,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "#1E293B",
        border: `1px solid ${D.border}`,
        borderRadius: 6,
        color: D.text,
        fontSize: 13,
        padding: "4px 8px",
        width,
        outline: "none",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function StatBox({
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
    <div
      style={{
        background: "#0F172A",
        border: `1px solid ${D.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        minWidth: 130,
      }}
    >
      <div style={{ color: D.sub, fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ color: color ?? D.light, fontSize: 18, fontWeight: 700 }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: D.muted, fontSize: 10, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <tr>
      {cols.map((c, i) => (
        <th
          key={i}
          style={{
            color: D.sub,
            fontSize: 11,
            fontWeight: 600,
            padding: "6px 10px",
            textAlign: i === 0 ? "left" : "right",
            borderBottom: `1px solid ${D.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {c}
        </th>
      ))}
    </tr>
  );
}

function TR({
  cells,
  highlight,
}: {
  cells: (string | number)[];
  highlight?: boolean;
}) {
  return (
    <tr
      style={{
        background: highlight ? "rgba(37,99,235,0.08)" : "transparent",
      }}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            color: i === 0 ? D.sub : D.text,
            fontSize: 12,
            padding: "5px 10px",
            textAlign: i === 0 ? "left" : "right",
            borderBottom: `1px solid rgba(30,58,95,0.4)`,
            fontWeight: highlight ? 700 : 400,
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DCFCalculator({
  embedded = false,
}: { embedded?: boolean } = {}) {
  const [inputs, setInputs] = useState<DCFInputs>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<TabId>("setup");

  function set<K extends keyof DCFInputs>(key: K, val: DCFInputs[K]) {
    setInputs((p) => ({ ...p, [key]: val }));
  }

  function applyPreset(name: string) {
    setInputs((p) => ({ ...p, ...PRESETS[name] }));
  }

  // ─── Core Calculations ──────────────────────────────────────────────────
  const calc = useMemo(() => {
    const {
      baseRevenue,
      baseEBITDA,
      baseEBIT,
      baseNetIncome,
      baseDPS,
      projectionYears,
      revenueGrowthMode,
      uniformGrowthRate,
      stepdownHighRate,
      stepdownLowRate,
      stepdownTransitionYear,
      revenueGrowthYr,
      ebitdaMargin,
      ebitMargin,
      daRate,
      daMethod,
      capexRate,
      capexMethod,
      nwcRate,
      nwcMethod,
      sbcRate,
      taxRate,
      taxMethod,
      nolBalance,
      waccMethod,
      riskFreeRate,
      equityRiskPremium,
      beta,
      betaType,
      debtBeta,
      sizePreium,
      specificRisk,
      preTaxCostOfDebt,
      targetDebtRatio,
      waccOverride,
      terminalMethod,
      terminalGrowthRate,
      terminalEVEBITDA,
      sharesOutstanding,
      netDebt,
      minorityInterest,
      preferredStock,
      netBorrowingRate,
      dividendGrowthPhase1,
      dividendGrowthPhase2,
      dividendPhase1Years,
      annualInterestExpense,
      debtTaxShieldDiscount,
      bullRevenueAdj,
      bearRevenueAdj,
      bullMarginAdj,
      bearMarginAdj,
      bullWACCAdj,
      bearWACCAdj,
      bullTGRAdj,
      bearTGRAdj,
      bullExitMultipleAdj,
      bearExitMultipleAdj,
      ffWACCLow,
      ffWACCHigh,
      ffTGRLow,
      ffTGRHigh,
      ffExitLow,
      ffExitHigh,
    } = inputs;

    const years = Math.max(1, Math.min(10, projectionYears));
    const effectiveTax =
      taxMethod === "override" ? taxRate / 100 : taxRate / 100;

    // ── WACC ────────────────────────────────────────────────────────────────
    const adjustedBeta =
      betaType === "adjusted"
        ? 0.67 * beta + 0.33 * 1.0
        : betaType === "relevered"
          ? beta *
            (1 +
              (1 - effectiveTax) * (targetDebtRatio / (100 - targetDebtRatio)))
          : beta;

    const ke =
      riskFreeRate / 100 +
      adjustedBeta * (equityRiskPremium / 100) +
      sizePreium / 100 +
      specificRisk / 100;

    const kd = (preTaxCostOfDebt / 100) * (1 - effectiveTax);
    const debtWeight = targetDebtRatio / 100;
    const equityWeight = 1 - debtWeight;
    const waccCalc = ke * equityWeight + kd * debtWeight;
    const wacc = waccOverride > 0 ? waccOverride / 100 : waccCalc;

    // ── Revenue Growth Schedule ──────────────────────────────────────────────
    function getGrowthRate(yr: number): number {
      if (revenueGrowthMode === "uniform") return uniformGrowthRate / 100;
      if (revenueGrowthMode === "stepdown") {
        return yr <= stepdownTransitionYear
          ? stepdownHighRate / 100
          : stepdownLowRate / 100;
      }
      return (revenueGrowthYr[yr - 1] ?? uniformGrowthRate) / 100;
    }

    // ── Projection Years ────────────────────────────────────────────────────
    interface YearRow {
      yr: number;
      revenue: number;
      ebitda: number;
      ebit: number;
      da: number;
      nopat: number;
      capex: number;
      deltaNWC: number;
      sbc: number;
      fcff: number;
      fcfe: number;
      nolShield: number;
      netIncome: number;
      dps: number;
      interest: number;
      netBorrowing: number;
    }

    const rows: YearRow[] = [];
    let prevRevenue = baseRevenue;
    let prevNWC = baseRevenue * (nwcRate / 100);
    let nolRemaining = nolBalance;

    for (let yr = 1; yr <= years; yr++) {
      const g = getGrowthRate(yr);
      const revenue = prevRevenue * (1 + g);

      const ebitda = revenue * (ebitdaMargin / 100);
      const ebit = revenue * (ebitMargin / 100);

      const da =
        daMethod === "fixed" ? baseEBITDA - baseEBIT : revenue * (daRate / 100);

      const nolUsed = Math.min(nolRemaining, ebit);
      nolRemaining -= nolUsed;
      const nolShield = nolUsed * effectiveTax;
      const taxableIncome = ebit - nolUsed;
      const nopat = taxableIncome * (1 - effectiveTax) + nolShield;

      const capex =
        capexMethod === "pct_da"
          ? da * (capexRate / 100)
          : revenue * (capexRate / 100);

      const currNWC = revenue * (nwcRate / 100);
      const deltaNWC =
        nwcMethod === "fixed"
          ? baseRevenue * (nwcRate / 100) - prevNWC
          : currNWC - prevNWC;

      const sbc = revenue * (sbcRate / 100);

      // FCFF = NOPAT + D&A - CapEx - ΔNWC - SBC
      const fcff = nopat + da - capex - deltaNWC - sbc;

      // FCFE
      const interest = annualInterestExpense * (1 + g * (yr - 1));
      const netBorrowing = revenue * (netBorrowingRate / 100) - interest;
      const netIncome = (ebit - interest) * (1 - effectiveTax) + nolShield;
      const fcfe = fcff - interest * (1 - effectiveTax) + netBorrowing;

      const dps = baseDPS * Math.pow(1 + dividendGrowthPhase1 / 100, yr);

      rows.push({
        yr,
        revenue,
        ebitda,
        ebit,
        da,
        nopat,
        capex,
        deltaNWC,
        sbc,
        fcff,
        fcfe,
        nolShield,
        netIncome,
        dps,
        interest,
        netBorrowing,
      });

      prevRevenue = revenue;
      prevNWC = currNWC;
    }

    const last = rows[rows.length - 1];
    const tgr = terminalGrowthRate / 100;

    // ── FCFF DCF ────────────────────────────────────────────────────────────
    const pvFCFF = rows.reduce((acc, r) => {
      return acc + r.fcff / Math.pow(1 + wacc, r.yr);
    }, 0);

    const tvGordon =
      wacc > tgr ? (last.fcff * (1 + tgr)) / (wacc - tgr) : last.fcff * 25;

    const tvExit = last.ebitda * terminalEVEBITDA;

    const tvFinal =
      terminalMethod === "gordon"
        ? tvGordon
        : terminalMethod === "exit_multiple"
          ? tvExit
          : (tvGordon + tvExit) / 2;

    const pvTV = tvFinal / Math.pow(1 + wacc, years);
    const enterpriseValueFCFF = pvFCFF + pvTV;
    const equityValueFCFF =
      enterpriseValueFCFF - netDebt - minorityInterest - preferredStock;
    const impliedSharePriceFCFF =
      sharesOutstanding > 0 ? equityValueFCFF / sharesOutstanding : 0;

    // ── FCFE DCF ────────────────────────────────────────────────────────────
    const ke_cost = ke; // cost of equity
    const pvFCFE = rows.reduce((acc, r) => {
      return acc + r.fcfe / Math.pow(1 + ke_cost, r.yr);
    }, 0);

    const tvFCFE =
      ke_cost > tgr
        ? (last.fcfe * (1 + tgr)) / (ke_cost - tgr)
        : last.fcfe * 25;

    const pvTVFCFE = tvFCFE / Math.pow(1 + ke_cost, years);
    const equityValueFCFE = pvFCFE + pvTVFCFE;
    const impliedSharePriceFCFE =
      sharesOutstanding > 0 ? equityValueFCFE / sharesOutstanding : 0;

    // ── DDM ─────────────────────────────────────────────────────────────────
    const ddmRows: { yr: number; dps: number; pv: number }[] = [];
    let ddmPVSum = 0;
    for (let yr = 1; yr <= Math.max(dividendPhase1Years, 5); yr++) {
      const g =
        yr <= dividendPhase1Years
          ? dividendGrowthPhase1 / 100
          : dividendGrowthPhase2 / 100;
      const dps = baseDPS * Math.pow(1 + g, yr);
      const pv = dps / Math.pow(1 + ke_cost, yr);
      ddmPVSum += pv;
      ddmRows.push({ yr, dps, pv });
    }
    const tvDDM =
      ke_cost > dividendGrowthPhase2 / 100
        ? (ddmRows[ddmRows.length - 1].dps * (1 + dividendGrowthPhase2 / 100)) /
          (ke_cost - dividendGrowthPhase2 / 100)
        : ddmRows[ddmRows.length - 1].dps * 20;
    const pvTVDDM = tvDDM / Math.pow(1 + ke_cost, dividendPhase1Years);
    const intrinsicValueDDM = ddmPVSum + pvTVDDM;

    // ── APV ─────────────────────────────────────────────────────────────────
    // Unlevered cost of equity = ke (assume all equity firm)
    const ke_unlevered =
      riskFreeRate / 100 +
      (beta /
        (1 +
          (1 - effectiveTax) *
            (targetDebtRatio / (100 - targetDebtRatio + 0.001)))) *
        (equityRiskPremium / 100);

    const pvFCFFUnlevered = rows.reduce((acc, r) => {
      return acc + r.fcff / Math.pow(1 + ke_unlevered, r.yr);
    }, 0);

    const tvAPV =
      ke_unlevered > tgr
        ? (last.fcff * (1 + tgr)) / (ke_unlevered - tgr)
        : last.fcff * 25;
    const pvTVAPV = tvAPV / Math.pow(1 + ke_unlevered, years);
    const baseAPV = pvFCFFUnlevered + pvTVAPV;

    const tsDiscount = debtTaxShieldDiscount === "rf" ? riskFreeRate / 100 : kd;
    const annualTS = annualInterestExpense * effectiveTax;
    const pvTS = rows.reduce((acc, r) => {
      return acc + annualTS / Math.pow(1 + tsDiscount, r.yr);
    }, 0);

    const apvEnterpriseValue = baseAPV + pvTS;
    const apvEquityValue =
      apvEnterpriseValue - netDebt - minorityInterest - preferredStock;
    const impliedSharePriceAPV =
      sharesOutstanding > 0 ? apvEquityValue / sharesOutstanding : 0;

    // ── Sensitivity Analysis ─────────────────────────────────────────────────
    const waccRange = [-2, -1, 0, 1, 2].map((d) => wacc + d / 100);
    const tgrRange = [-1, -0.5, 0, 0.5, 1].map((d) => tgr + d / 100);

    const sensitivityMatrix = waccRange.map((w) =>
      tgrRange.map((g) => {
        const pvF = rows.reduce(
          (acc, r) => acc + r.fcff / Math.pow(1 + w, r.yr),
          0,
        );
        const tv = w > g ? (last.fcff * (1 + g)) / (w - g) : last.fcff * 25;
        const pv_tv = tv / Math.pow(1 + w, years);
        const ev = pvF + pv_tv;
        const eq = ev - netDebt - minorityInterest - preferredStock;
        return sharesOutstanding > 0 ? eq / sharesOutstanding : 0;
      }),
    );

    // Exit multiple sensitivity
    const exitRange = [-3, -1.5, 0, 1.5, 3].map((d) => terminalEVEBITDA + d);
    const waccRange2 = [-2, -1, 0, 1, 2].map((d) => wacc + d / 100);
    const exitSensMatrix = waccRange2.map((w) =>
      exitRange.map((ex) => {
        const pvF = rows.reduce(
          (acc, r) => acc + r.fcff / Math.pow(1 + w, r.yr),
          0,
        );
        const tv = last.ebitda * ex;
        const pv_tv = tv / Math.pow(1 + w, years);
        const ev = pvF + pv_tv;
        const eq = ev - netDebt - minorityInterest - preferredStock;
        return sharesOutstanding > 0 ? eq / sharesOutstanding : 0;
      }),
    );

    // ── Scenarios ────────────────────────────────────────────────────────────
    function scenarioDCF(
      revAdj: number,
      marginAdj: number,
      waccAdj: number,
      tgrAdj: number,
      exitAdj: number,
    ) {
      const adjWacc = wacc + waccAdj / 100;
      const adjTGR = tgr + tgrAdj / 100;
      const adjEBITDAMargin = ebitdaMargin + marginAdj;

      let prevRev = baseRevenue;
      let pvFCFFScen = 0;
      let lastEBITDA = 0;
      let lastFCFF = 0;

      for (let yr = 1; yr <= years; yr++) {
        const g = getGrowthRate(yr) + revAdj / 100;
        const revenue = prevRev * (1 + g);
        const ebitda = revenue * (adjEBITDAMargin / 100);
        const da = revenue * (daRate / 100);
        const ebit = ebitda - da;
        const nopat = ebit * (1 - effectiveTax);
        const capex = revenue * (capexRate / 100);
        const deltaNWC = revenue * (nwcRate / 100) - prevRev * (nwcRate / 100);
        const sbc = revenue * (sbcRate / 100);
        const fcff = nopat + da - capex - deltaNWC - sbc;

        pvFCFFScen += fcff / Math.pow(1 + adjWacc, yr);
        lastEBITDA = ebitda;
        lastFCFF = fcff;
        prevRev = revenue;
      }

      const tvScen =
        terminalMethod === "gordon" || terminalMethod === "avg"
          ? adjWacc > adjTGR
            ? (lastFCFF * (1 + adjTGR)) / (adjWacc - adjTGR)
            : lastFCFF * 25
          : lastEBITDA * (terminalEVEBITDA + exitAdj);

      const pvTVScen = tvScen / Math.pow(1 + adjWacc, years);
      const evScen = pvFCFFScen + pvTVScen;
      const eqScen = evScen - netDebt - minorityInterest - preferredStock;
      return {
        ev: evScen,
        eq: eqScen,
        price: sharesOutstanding > 0 ? eqScen / sharesOutstanding : 0,
      };
    }

    const bull = scenarioDCF(
      bullRevenueAdj,
      bullMarginAdj,
      bullWACCAdj,
      bullTGRAdj,
      bullExitMultipleAdj,
    );
    const base = scenarioDCF(0, 0, 0, 0, 0);
    const bear = scenarioDCF(
      bearRevenueAdj,
      bearMarginAdj,
      bearWACCAdj,
      bearTGRAdj,
      bearExitMultipleAdj,
    );

    // ── Football Field Ranges ────────────────────────────────────────────────
    function ffRange(
      wLow: number,
      wHigh: number,
      tgLow: number,
      tgHigh: number,
    ) {
      const combos = [
        [wLow / 100, tgLow / 100],
        [wLow / 100, tgHigh / 100],
        [wHigh / 100, tgLow / 100],
        [wHigh / 100, tgHigh / 100],
      ];
      const prices = combos.map(([w, g]) => {
        const pvF = rows.reduce(
          (acc, r) => acc + r.fcff / Math.pow(1 + w, r.yr),
          0,
        );
        const tv = w > g ? (last.fcff * (1 + g)) / (w - g) : last.fcff * 25;
        const pvt = tv / Math.pow(1 + w, years);
        const ev = pvF + pvt;
        const eq = ev - netDebt - minorityInterest - preferredStock;
        return sharesOutstanding > 0 ? eq / sharesOutstanding : 0;
      });
      return { low: Math.min(...prices), high: Math.max(...prices) };
    }

    function ffExitRange(
      wLow: number,
      wHigh: number,
      exLow: number,
      exHigh: number,
    ) {
      const combos = [
        [wLow / 100, exLow],
        [wLow / 100, exHigh],
        [wHigh / 100, exLow],
        [wHigh / 100, exHigh],
      ];
      const prices = combos.map(([w, ex]) => {
        const pvF = rows.reduce(
          (acc, r) => acc + r.fcff / Math.pow(1 + w, r.yr),
          0,
        );
        const tv = last.ebitda * ex;
        const pvt = tv / Math.pow(1 + w, years);
        const ev = pvF + pvt;
        const eq = ev - netDebt - minorityInterest - preferredStock;
        return sharesOutstanding > 0 ? eq / sharesOutstanding : 0;
      });
      return { low: Math.min(...prices), high: Math.max(...prices) };
    }

    const ffDCF = ffRange(ffWACCLow, ffWACCHigh, ffTGRLow, ffTGRHigh);
    const ffExit = ffExitRange(ffWACCLow, ffWACCHigh, ffExitLow, ffExitHigh);
    const ffDDM = {
      low: intrinsicValueDDM * 0.85,
      high: intrinsicValueDDM * 1.15,
    };

    return {
      wacc,
      ke,
      kd,
      adjustedBeta,
      rows,
      // FCFF
      pvFCFF,
      tvFinal,
      pvTV,
      enterpriseValueFCFF,
      equityValueFCFF,
      impliedSharePriceFCFF,
      // FCFE
      pvFCFE,
      tvFCFE,
      pvTVFCFE,
      equityValueFCFE,
      impliedSharePriceFCFE,
      // DDM
      ddmRows,
      intrinsicValueDDM,
      pvTVDDM,
      tvDDM,
      ddmPVSum,
      // APV
      baseAPV,
      pvTS,
      apvEnterpriseValue,
      apvEquityValue,
      impliedSharePriceAPV,
      // Sensitivity
      waccRange,
      tgrRange,
      sensitivityMatrix,
      waccRange2,
      exitRange,
      exitSensMatrix,
      // Scenarios
      bull,
      base,
      bear,
      // Football
      ffDCF,
      ffExit,
      ffDDM,
    };
  }, [inputs]);

  // ─── CSV Export ─────────────────────────────────────────────────────────────
  function exportCSV() {
    const { rows, wacc, ke, kd } = calc;
    const lines: string[] = [];

    lines.push(`DCF Analysis - ${inputs.companyName} (${inputs.ticker})`);
    lines.push(`Currency: ${inputs.currency}M`);
    lines.push(``);

    lines.push("=== ASSUMPTIONS ===");
    lines.push(`Company,${inputs.companyName}`);
    lines.push(`Ticker,${inputs.ticker}`);
    lines.push(`Sector,${inputs.sector}`);
    lines.push(`Base Revenue,$${inputs.baseRevenue}M`);
    lines.push(`Base EBITDA,$${inputs.baseEBITDA}M`);
    lines.push(`Projection Years,${inputs.projectionYears}`);
    lines.push(`Revenue Growth Mode,${inputs.revenueGrowthMode}`);
    lines.push(`Uniform Growth Rate,${inputs.uniformGrowthRate}%`);
    lines.push(`EBITDA Margin,${inputs.ebitdaMargin}%`);
    lines.push(`D&A Rate,${inputs.daRate}%`);
    lines.push(`CapEx Rate,${inputs.capexRate}%`);
    lines.push(`NWC Rate,${inputs.nwcRate}%`);
    lines.push(`SBC Rate,${inputs.sbcRate}%`);
    lines.push(`Tax Rate,${inputs.taxRate}%`);
    lines.push(`WACC Method,${inputs.waccMethod}`);
    lines.push(`Risk-Free Rate,${inputs.riskFreeRate}%`);
    lines.push(`Equity Risk Premium,${inputs.equityRiskPremium}%`);
    lines.push(`Beta,${inputs.beta}`);
    lines.push(`Beta Type,${inputs.betaType}`);
    lines.push(`Pre-Tax Cost of Debt,${inputs.preTaxCostOfDebt}%`);
    lines.push(`Target Debt Ratio,${inputs.targetDebtRatio}%`);
    lines.push(`Terminal Method,${inputs.terminalMethod}`);
    lines.push(`Terminal Growth Rate,${inputs.terminalGrowthRate}%`);
    lines.push(`EV/EBITDA Exit Multiple,${inputs.terminalEVEBITDA}x`);
    lines.push(`Shares Outstanding,${inputs.sharesOutstanding}M`);
    lines.push(`Net Debt,$${inputs.netDebt}M`);
    lines.push(``);

    lines.push("=== DERIVED RATES ===");
    lines.push(`WACC,${(wacc * 100).toFixed(2)}%`);
    lines.push(`Cost of Equity (Ke),${(ke * 100).toFixed(2)}%`);
    lines.push(`After-Tax Cost of Debt (Kd),${(kd * 100).toFixed(2)}%`);
    lines.push(`Adjusted Beta,${calc.adjustedBeta.toFixed(3)}`);
    lines.push(``);

    lines.push("=== PROJECTED FREE CASH FLOWS (FCFF) ===");
    lines.push(
      "Year,Revenue,EBITDA,EBIT,D&A,NOPAT,CapEx,ΔNWC,SBC,FCFF,FCFE,Dividends/Share",
    );
    rows.forEach((r) => {
      lines.push(
        [
          r.yr,
          r.revenue.toFixed(1),
          r.ebitda.toFixed(1),
          r.ebit.toFixed(1),
          r.da.toFixed(1),
          r.nopat.toFixed(1),
          r.capex.toFixed(1),
          r.deltaNWC.toFixed(1),
          r.sbc.toFixed(1),
          r.fcff.toFixed(1),
          r.fcfe.toFixed(1),
          r.dps.toFixed(2),
        ].join(","),
      );
    });
    lines.push(``);

    lines.push("=== VALUATION SUMMARY ===");
    lines.push(
      `Method,Enterprise Value ($M),Equity Value ($M),Implied Price ($)`,
    );
    lines.push(
      `FCFF (Unlevered DCF),${calc.enterpriseValueFCFF.toFixed(1)},${calc.equityValueFCFF.toFixed(1)},${calc.impliedSharePriceFCFF.toFixed(2)}`,
    );
    lines.push(
      `FCFE (Levered DCF),—,${calc.equityValueFCFE.toFixed(1)},${calc.impliedSharePriceFCFE.toFixed(2)}`,
    );
    lines.push(
      `DDM,—,${calc.intrinsicValueDDM.toFixed(1)} (per share value),${calc.intrinsicValueDDM.toFixed(2)}`,
    );
    lines.push(
      `APV,${calc.apvEnterpriseValue.toFixed(1)},${calc.apvEquityValue.toFixed(1)},${calc.impliedSharePriceAPV.toFixed(2)}`,
    );
    lines.push(``);

    lines.push("=== SCENARIO ANALYSIS ===");
    lines.push(`Scenario,EV ($M),Equity Value ($M),Price per Share ($)`);
    lines.push(
      `Bull,${calc.bull.ev.toFixed(1)},${calc.bull.eq.toFixed(1)},${calc.bull.price.toFixed(2)}`,
    );
    lines.push(
      `Base,${calc.base.ev.toFixed(1)},${calc.base.eq.toFixed(1)},${calc.base.price.toFixed(2)}`,
    );
    lines.push(
      `Bear,${calc.bear.ev.toFixed(1)},${calc.bear.eq.toFixed(1)},${calc.bear.price.toFixed(2)}`,
    );
    lines.push(``);

    lines.push("=== SENSITIVITY (WACC vs TGR → Price) ===");
    lines.push(
      [
        "WACC\\TGR",
        ...calc.tgrRange.map((g) => `${(g * 100).toFixed(1)}%`),
      ].join(","),
    );
    calc.waccRange.forEach((w, i) => {
      lines.push(
        [
          `${(w * 100).toFixed(1)}%`,
          ...calc.sensitivityMatrix[i].map((p) => p.toFixed(2)),
        ].join(","),
      );
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inputs.ticker}_DCF_Analysis.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Tab Content ─────────────────────────────────────────────────────────────
  function renderSetup() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Company Info */}
        <Card title="Company Info">
          <Row label="Company Name">
            <input
              value={inputs.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              style={{
                background: "#1E293B",
                border: `1px solid ${D.border}`,
                borderRadius: 6,
                color: D.text,
                fontSize: 13,
                padding: "4px 8px",
                width: 180,
              }}
            />
          </Row>
          <Row label="Ticker">
            <input
              value={inputs.ticker}
              onChange={(e) => set("ticker", e.target.value.toUpperCase())}
              style={{
                background: "#1E293B",
                border: `1px solid ${D.border}`,
                borderRadius: 6,
                color: D.text,
                fontSize: 13,
                padding: "4px 8px",
                width: 100,
              }}
            />
          </Row>
          <Row label="Sector">
            <Select
              value={inputs.sector}
              onChange={(v) => set("sector", v)}
              options={SECTORS.map((s) => ({ value: s, label: s }))}
              width={200}
            />
          </Row>
          <Row label="Currency">
            <Select
              value={inputs.currency}
              onChange={(v) => set("currency", v)}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "JPY", label: "JPY (¥)" },
                { value: "CAD", label: "CAD ($)" },
              ]}
              width={140}
            />
          </Row>
        </Card>

        {/* Base Financials */}
        <Card title="Base Year Financials ($M)">
          <Row label="Revenue">
            <NumInput
              value={inputs.baseRevenue}
              onChange={(v) => set("baseRevenue", v)}
              prefix="$"
              suffix="M"
              width={110}
            />
          </Row>
          <Row label="EBITDA">
            <NumInput
              value={inputs.baseEBITDA}
              onChange={(v) => set("baseEBITDA", v)}
              prefix="$"
              suffix="M"
              width={110}
            />
          </Row>
          <Row label="EBIT">
            <NumInput
              value={inputs.baseEBIT}
              onChange={(v) => set("baseEBIT", v)}
              prefix="$"
              suffix="M"
              width={110}
            />
          </Row>
          <Row label="Net Income">
            <NumInput
              value={inputs.baseNetIncome}
              onChange={(v) => set("baseNetIncome", v)}
              prefix="$"
              suffix="M"
              width={110}
            />
          </Row>
          <Row label="Dividends per Share">
            <NumInput
              value={inputs.baseDPS}
              onChange={(v) => set("baseDPS", v)}
              prefix="$"
              step={0.05}
              width={90}
            />
          </Row>
        </Card>

        {/* Projection Assumptions */}
        <Card title="Projection Assumptions">
          <Row label="Projection Years">
            <NumInput
              value={inputs.projectionYears}
              onChange={(v) =>
                set("projectionYears", Math.max(1, Math.min(10, v)))
              }
              min={1}
              max={10}
              step={1}
              width={70}
            />
          </Row>
          <Row label="Revenue Growth Mode">
            <Select
              value={inputs.revenueGrowthMode}
              onChange={(v) => set("revenueGrowthMode", v)}
              options={[
                { value: "uniform", label: "Uniform Rate" },
                { value: "stepdown", label: "Step-Down" },
                { value: "manual", label: "Manual by Year" },
              ]}
              width={160}
            />
          </Row>
          {inputs.revenueGrowthMode === "uniform" && (
            <Row label="Uniform Growth Rate">
              <NumInput
                value={inputs.uniformGrowthRate}
                onChange={(v) => set("uniformGrowthRate", v)}
                suffix="%"
                width={80}
              />
            </Row>
          )}
          {inputs.revenueGrowthMode === "stepdown" && (
            <>
              <Row label="High-Growth Rate (Phase 1)">
                <NumInput
                  value={inputs.stepdownHighRate}
                  onChange={(v) => set("stepdownHighRate", v)}
                  suffix="%"
                  width={80}
                />
              </Row>
              <Row label="Low-Growth Rate (Phase 2)">
                <NumInput
                  value={inputs.stepdownLowRate}
                  onChange={(v) => set("stepdownLowRate", v)}
                  suffix="%"
                  width={80}
                />
              </Row>
              <Row label="Transition Year">
                <NumInput
                  value={inputs.stepdownTransitionYear}
                  onChange={(v) => set("stepdownTransitionYear", v)}
                  min={1}
                  max={9}
                  step={1}
                  width={70}
                />
              </Row>
            </>
          )}
          {inputs.revenueGrowthMode === "manual" && (
            <div>
              <div style={{ color: D.sub, fontSize: 11, marginBottom: 6 }}>
                Growth Rate by Year (%)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Array.from({ length: inputs.projectionYears }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{ color: D.muted, fontSize: 10 }}>
                      Yr {i + 1}
                    </span>
                    <NumInput
                      value={inputs.revenueGrowthYr[i] ?? 10}
                      onChange={(v) => {
                        const arr = [...inputs.revenueGrowthYr];
                        arr[i] = v;
                        set("revenueGrowthYr", arr);
                      }}
                      suffix="%"
                      width={68}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Margin & Cost Assumptions */}
        <Card title="Margin & Cost Assumptions">
          <Row label="EBITDA Margin">
            <NumInput
              value={inputs.ebitdaMargin}
              onChange={(v) => set("ebitdaMargin", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="EBIT Margin">
            <NumInput
              value={inputs.ebitMargin}
              onChange={(v) => set("ebitMargin", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="D&A Method">
            <Select
              value={inputs.daMethod}
              onChange={(v) => set("daMethod", v)}
              options={[
                { value: "pct_revenue", label: "% of Revenue" },
                { value: "fixed", label: "Fixed Amount" },
              ]}
              width={140}
            />
          </Row>
          <Row label="D&A Rate">
            <NumInput
              value={inputs.daRate}
              onChange={(v) => set("daRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="CapEx Method">
            <Select
              value={inputs.capexMethod}
              onChange={(v) => set("capexMethod", v)}
              options={[
                { value: "pct_revenue", label: "% of Revenue" },
                { value: "pct_da", label: "% of D&A" },
              ]}
              width={140}
            />
          </Row>
          <Row label="CapEx Rate">
            <NumInput
              value={inputs.capexRate}
              onChange={(v) => set("capexRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="NWC Change Method">
            <Select
              value={inputs.nwcMethod}
              onChange={(v) => set("nwcMethod", v)}
              options={[
                { value: "pct_revenue", label: "% of Revenue" },
                { value: "fixed", label: "Fixed" },
              ]}
              width={140}
            />
          </Row>
          <Row label="NWC / Revenue">
            <NumInput
              value={inputs.nwcRate}
              onChange={(v) => set("nwcRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="SBC / Revenue">
            <NumInput
              value={inputs.sbcRate}
              onChange={(v) => set("sbcRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="Tax Method">
            <Select
              value={inputs.taxMethod}
              onChange={(v) => set("taxMethod", v)}
              options={[
                { value: "statutory", label: "Statutory" },
                { value: "effective", label: "Effective" },
                { value: "override", label: "Override" },
              ]}
              width={140}
            />
          </Row>
          <Row label="Tax Rate">
            <NumInput
              value={inputs.taxRate}
              onChange={(v) => set("taxRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="NOL Balance ($M)">
            <NumInput
              value={inputs.nolBalance}
              onChange={(v) => set("nolBalance", v)}
              prefix="$"
              suffix="M"
              width={90}
            />
          </Row>
        </Card>

        {/* WACC */}
        <Card title="WACC / Discount Rate">
          <Row label="WACC Method">
            <Select
              value={inputs.waccMethod}
              onChange={(v) => set("waccMethod", v)}
              options={[
                { value: "capm", label: "CAPM" },
                { value: "buildup", label: "Build-Up" },
                { value: "override", label: "Override" },
              ]}
              width={140}
            />
          </Row>
          <Row label="Risk-Free Rate (Rf)">
            <NumInput
              value={inputs.riskFreeRate}
              onChange={(v) => set("riskFreeRate", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="Equity Risk Premium (ERP)">
            <NumInput
              value={inputs.equityRiskPremium}
              onChange={(v) => set("equityRiskPremium", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="Beta">
            <NumInput
              value={inputs.beta}
              onChange={(v) => set("beta", v)}
              step={0.05}
              width={80}
            />
          </Row>
          <Row label="Beta Type">
            <Select
              value={inputs.betaType}
              onChange={(v) => set("betaType", v)}
              options={[
                { value: "raw", label: "Raw" },
                { value: "adjusted", label: "Adjusted (Blume)" },
                { value: "relevered", label: "Relevered" },
              ]}
              width={160}
            />
          </Row>
          <Row label="Size Premium">
            <NumInput
              value={inputs.sizePreium}
              onChange={(v) => set("sizePreium", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="Company-Specific Risk">
            <NumInput
              value={inputs.specificRisk}
              onChange={(v) => set("specificRisk", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="Pre-Tax Cost of Debt">
            <NumInput
              value={inputs.preTaxCostOfDebt}
              onChange={(v) => set("preTaxCostOfDebt", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="Target Debt Ratio">
            <NumInput
              value={inputs.targetDebtRatio}
              onChange={(v) => set("targetDebtRatio", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="WACC Override (0 = use CAPM)">
            <NumInput
              value={inputs.waccOverride}
              onChange={(v) => set("waccOverride", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "#0F172A",
              borderRadius: 8,
              display: "flex",
              gap: 24,
            }}
          >
            <div>
              <div style={{ color: D.sub, fontSize: 10 }}>Ke</div>
              <div style={{ color: D.green, fontWeight: 700, fontSize: 16 }}>
                {fmtPct(calc.ke * 100)}
              </div>
            </div>
            <div>
              <div style={{ color: D.sub, fontSize: 10 }}>Kd (after-tax)</div>
              <div style={{ color: D.yellow, fontWeight: 700, fontSize: 16 }}>
                {fmtPct(calc.kd * 100)}
              </div>
            </div>
            <div>
              <div style={{ color: D.sub, fontSize: 10 }}>WACC</div>
              <div style={{ color: D.light, fontWeight: 700, fontSize: 18 }}>
                {fmtPct(calc.wacc * 100)}
              </div>
            </div>
            <div>
              <div style={{ color: D.sub, fontSize: 10 }}>Adj. Beta</div>
              <div style={{ color: D.text, fontWeight: 700, fontSize: 16 }}>
                {calc.adjustedBeta.toFixed(3)}
              </div>
            </div>
          </div>
        </Card>

        {/* Terminal Value */}
        <Card title="Terminal Value">
          <Row label="Terminal Value Method">
            <Select
              value={inputs.terminalMethod}
              onChange={(v) => set("terminalMethod", v)}
              options={[
                { value: "gordon", label: "Gordon Growth Model" },
                { value: "exit_multiple", label: "EV/EBITDA Exit Multiple" },
                { value: "avg", label: "Average of Both" },
              ]}
              width={200}
            />
          </Row>
          <Row label="Terminal Growth Rate (TGR)">
            <NumInput
              value={inputs.terminalGrowthRate}
              onChange={(v) => set("terminalGrowthRate", v)}
              suffix="%"
              step={0.1}
              width={80}
            />
          </Row>
          <Row label="EV/EBITDA Exit Multiple">
            <NumInput
              value={inputs.terminalEVEBITDA}
              onChange={(v) => set("terminalEVEBITDA", v)}
              suffix="x"
              step={0.5}
              width={80}
            />
          </Row>
        </Card>

        {/* Bridge */}
        <Card title="Equity Bridge">
          <Row label="Shares Outstanding">
            <NumInput
              value={inputs.sharesOutstanding}
              onChange={(v) => set("sharesOutstanding", v)}
              suffix="M"
              width={90}
            />
          </Row>
          <Row label="Net Debt (negative = net cash)">
            <NumInput
              value={inputs.netDebt}
              onChange={(v) => set("netDebt", v)}
              prefix="$"
              suffix="M"
              width={100}
            />
          </Row>
          <Row label="Minority Interest">
            <NumInput
              value={inputs.minorityInterest}
              onChange={(v) => set("minorityInterest", v)}
              prefix="$"
              suffix="M"
              width={100}
            />
          </Row>
          <Row label="Preferred Stock">
            <NumInput
              value={inputs.preferredStock}
              onChange={(v) => set("preferredStock", v)}
              prefix="$"
              suffix="M"
              width={100}
            />
          </Row>
        </Card>
      </div>
    );
  }

  function renderProjections() {
    const { rows } = calc;
    return (
      <Card title="Projected Income Statement & Free Cash Flows ($M)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <TableHeader
                cols={["Metric", ...rows.map((r) => `Year ${r.yr}`)]}
              />
            </thead>
            <tbody>
              {[
                { label: "Revenue", key: "revenue" as const },
                { label: "EBITDA", key: "ebitda" as const },
                { label: "EBIT", key: "ebit" as const },
                { label: "D&A", key: "da" as const },
                { label: "NOPAT", key: "nopat" as const },
                { label: "CapEx", key: "capex" as const },
                { label: "ΔNWC", key: "deltaNWC" as const },
                { label: "SBC", key: "sbc" as const },
                { label: "FCFF", key: "fcff" as const },
                { label: "FCFE", key: "fcfe" as const },
                { label: "DPS ($)", key: "dps" as const },
              ].map(({ label, key }) => (
                <TR
                  key={label}
                  highlight={["FCFF", "FCFE"].includes(label)}
                  cells={[label, ...rows.map((r) => `$${r[key].toFixed(1)}`)]}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Margins */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              color: D.sub,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 8,
              letterSpacing: "0.06em",
            }}
          >
            MARGIN ANALYSIS
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <TableHeader
                  cols={["Margin", ...rows.map((r) => `Year ${r.yr}`)]}
                />
              </thead>
              <tbody>
                <TR
                  cells={[
                    "EBITDA Margin",
                    ...rows.map(
                      (r) => `${((r.ebitda / r.revenue) * 100).toFixed(1)}%`,
                    ),
                  ]}
                />
                <TR
                  cells={[
                    "EBIT Margin",
                    ...rows.map(
                      (r) => `${((r.ebit / r.revenue) * 100).toFixed(1)}%`,
                    ),
                  ]}
                />
                <TR
                  cells={[
                    "NOPAT Margin",
                    ...rows.map(
                      (r) => `${((r.nopat / r.revenue) * 100).toFixed(1)}%`,
                    ),
                  ]}
                />
                <TR
                  cells={[
                    "FCFF Margin",
                    ...rows.map(
                      (r) => `${((r.fcff / r.revenue) * 100).toFixed(1)}%`,
                    ),
                  ]}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  }

  function renderFCFF() {
    const {
      pvFCFF,
      tvFinal,
      pvTV,
      enterpriseValueFCFF,
      equityValueFCFF,
      impliedSharePriceFCFF,
      rows,
    } = calc;
    return (
      <div>
        {/* Summary Stats */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <StatBox label="PV of FCFFs" value={fmtM(pvFCFF)} />
          <StatBox label="Terminal Value" value={fmtM(tvFinal)} />
          <StatBox label="PV of TV" value={fmtM(pvTV)} />
          <StatBox
            label="Enterprise Value"
            value={fmtM(enterpriseValueFCFF)}
            color={D.light}
          />
          <StatBox
            label="Equity Value"
            value={fmtM(equityValueFCFF)}
            color={D.green}
          />
          <StatBox
            label="Implied Share Price"
            value={`$${impliedSharePriceFCFF.toFixed(2)}`}
            color={D.green}
          />
        </div>

        <Card title="FCFF Discounted Cash Flow Bridge ($M)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <TableHeader
                  cols={["", ...rows.map((r) => `Year ${r.yr}`), "TV", "Total"]}
                />
              </thead>
              <tbody>
                <TR
                  cells={[
                    "FCFF",
                    ...rows.map((r) => `$${r.fcff.toFixed(1)}`),
                    `$${tvFinal.toFixed(1)}`,
                    "",
                  ]}
                />
                <TR
                  cells={[
                    "Discount Factor",
                    ...rows.map((r) =>
                      (1 / Math.pow(1 + calc.wacc, r.yr)).toFixed(4),
                    ),
                    (
                      1 / Math.pow(1 + calc.wacc, inputs.projectionYears)
                    ).toFixed(4),
                    "",
                  ]}
                />
                <TR
                  highlight
                  cells={[
                    "PV",
                    ...rows.map(
                      (r) =>
                        `$${(r.fcff / Math.pow(1 + calc.wacc, r.yr)).toFixed(1)}`,
                    ),
                    `$${pvTV.toFixed(1)}`,
                    `$${enterpriseValueFCFF.toFixed(1)}`,
                  ]}
                />
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Enterprise → Equity Bridge ($M)">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <TR
                cells={[
                  "Enterprise Value (EV)",
                  `$${enterpriseValueFCFF.toFixed(1)}M`,
                ]}
              />
              <TR
                cells={["(–) Net Debt", `($${inputs.netDebt.toFixed(1)}M)`]}
              />
              <TR
                cells={[
                  "(–) Minority Interest",
                  `($${inputs.minorityInterest.toFixed(1)}M)`,
                ]}
              />
              <TR
                cells={[
                  "(–) Preferred Stock",
                  `($${inputs.preferredStock.toFixed(1)}M)`,
                ]}
              />
              <TR
                highlight
                cells={["= Equity Value", `$${equityValueFCFF.toFixed(1)}M`]}
              />
              <TR
                cells={["÷ Shares Outstanding", `${inputs.sharesOutstanding}M`]}
              />
              <TR
                highlight
                cells={[
                  "= Implied Share Price",
                  `$${impliedSharePriceFCFF.toFixed(2)}`,
                ]}
              />
            </tbody>
          </table>
        </Card>

        <Card title="Terminal Value Detail">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <TR
                cells={[
                  "Method Selected",
                  inputs.terminalMethod === "gordon"
                    ? "Gordon Growth"
                    : inputs.terminalMethod === "exit_multiple"
                      ? "EV/EBITDA Exit Multiple"
                      : "Average",
                ]}
              />
              <TR
                cells={[
                  "Gordon Growth TV",
                  `$${(calc.wacc > inputs.terminalGrowthRate / 100 ? (rows[rows.length - 1].fcff * (1 + inputs.terminalGrowthRate / 100)) / (calc.wacc - inputs.terminalGrowthRate / 100) : rows[rows.length - 1].fcff * 25).toFixed(1)}M`,
                ]}
              />
              <TR
                cells={[
                  "EV/EBITDA TV",
                  `$${(rows[rows.length - 1].ebitda * inputs.terminalEVEBITDA).toFixed(1)}M`,
                ]}
              />
              <TR
                highlight
                cells={["Selected TV", `$${tvFinal.toFixed(1)}M`]}
              />
              <TR cells={["PV of TV", `$${pvTV.toFixed(1)}M`]} />
              <TR
                cells={[
                  "TV as % of EV",
                  `${((pvTV / enterpriseValueFCFF) * 100).toFixed(1)}%`,
                ]}
              />
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  function renderFCFE() {
    const {
      pvFCFE,
      tvFCFE,
      pvTVFCFE,
      equityValueFCFE,
      impliedSharePriceFCFE,
      rows,
    } = calc;
    return (
      <div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <StatBox label="PV of FCFEs" value={fmtM(pvFCFE)} />
          <StatBox label="TV (FCFE)" value={fmtM(tvFCFE)} />
          <StatBox label="PV of TV" value={fmtM(pvTVFCFE)} />
          <StatBox
            label="Equity Value"
            value={fmtM(equityValueFCFE)}
            color={D.green}
          />
          <StatBox
            label="Implied Share Price"
            value={`$${impliedSharePriceFCFE.toFixed(2)}`}
            color={D.green}
          />
        </div>

        <Card title="FCFE Inputs">
          <Row label="Net Borrowing Rate (% of Revenue)">
            <NumInput
              value={inputs.netBorrowingRate}
              onChange={(v) => set("netBorrowingRate", v)}
              suffix="%"
              width={80}
            />
          </Row>
          <Row label="Annual Interest Expense ($M)">
            <NumInput
              value={inputs.annualInterestExpense}
              onChange={(v) => set("annualInterestExpense", v)}
              prefix="$"
              suffix="M"
              width={90}
            />
          </Row>
        </Card>

        <Card title="FCFE Discounted Cash Flow ($M)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <TableHeader cols={["", ...rows.map((r) => `Year ${r.yr}`)]} />
              </thead>
              <tbody>
                <TR
                  cells={["FCFE", ...rows.map((r) => `$${r.fcfe.toFixed(1)}`)]}
                />
                <TR
                  cells={[
                    "Discount Factor (Ke)",
                    ...rows.map((r) =>
                      (1 / Math.pow(1 + calc.ke, r.yr)).toFixed(4),
                    ),
                  ]}
                />
                <TR
                  highlight
                  cells={[
                    "PV of FCFE",
                    ...rows.map(
                      (r) =>
                        `$${(r.fcfe / Math.pow(1 + calc.ke, r.yr)).toFixed(1)}`,
                    ),
                  ]}
                />
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="FCFE vs FCFF Reconciliation ($M)">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <TR
                cells={[
                  "FCFF → FCFE: FCFF",
                  `$${calc.pvFCFF.toFixed(1)}M (PV)`,
                ]}
              />
              <TR
                cells={[
                  "(–) After-Tax Interest (PV)",
                  `($${(calc.pvFCFF - pvFCFE).toFixed(1)}M)`,
                ]}
              />
              <TR highlight cells={["= FCFE (PV)", `$${pvFCFE.toFixed(1)}M`]} />
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  function renderDDM() {
    const { ddmRows, intrinsicValueDDM, pvTVDDM, tvDDM, ddmPVSum } = calc;
    return (
      <div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <StatBox label="PV of Dividends" value={`$${ddmPVSum.toFixed(2)}`} />
          <StatBox
            label="Terminal Value (DDM)"
            value={`$${tvDDM.toFixed(2)}`}
          />
          <StatBox label="PV of TV" value={`$${pvTVDDM.toFixed(2)}`} />
          <StatBox
            label="Intrinsic Value / Share"
            value={`$${intrinsicValueDDM.toFixed(2)}`}
            color={D.green}
          />
        </div>

        <Card title="DDM Inputs">
          <Row label="Current DPS ($)">
            <NumInput
              value={inputs.baseDPS}
              onChange={(v) => set("baseDPS", v)}
              prefix="$"
              step={0.05}
              width={90}
            />
          </Row>
          <Row label="Phase 1 Dividend Growth Rate">
            <NumInput
              value={inputs.dividendGrowthPhase1}
              onChange={(v) => set("dividendGrowthPhase1", v)}
              suffix="%"
              step={0.5}
              width={80}
            />
          </Row>
          <Row label="Phase 1 Duration (years)">
            <NumInput
              value={inputs.dividendPhase1Years}
              onChange={(v) => set("dividendPhase1Years", v)}
              min={1}
              max={20}
              step={1}
              width={70}
            />
          </Row>
          <Row label="Phase 2 (Perpetuity) Growth Rate">
            <NumInput
              value={inputs.dividendGrowthPhase2}
              onChange={(v) => set("dividendGrowthPhase2", v)}
              suffix="%"
              step={0.25}
              width={80}
            />
          </Row>
        </Card>

        <Card title="Dividend Discount Model – Year by Year">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <TableHeader cols={["Year", "DPS ($)", "PV of DPS ($)"]} />
              </thead>
              <tbody>
                {ddmRows.map((r) => (
                  <TR
                    key={r.yr}
                    cells={[r.yr, r.dps.toFixed(3), r.pv.toFixed(3)]}
                  />
                ))}
                <TR
                  highlight
                  cells={[
                    "TV (Perpetuity)",
                    `$${tvDDM.toFixed(2)}`,
                    `$${pvTVDDM.toFixed(2)}`,
                  ]}
                />
                <TR
                  highlight
                  cells={[
                    "Total Intrinsic Value",
                    "",
                    `$${intrinsicValueDDM.toFixed(2)}`,
                  ]}
                />
              </tbody>
            </table>
          </div>
        </Card>

        <div
          style={{
            background: "#0F172A",
            borderRadius: 8,
            padding: 14,
            marginTop: 10,
          }}
        >
          <div style={{ color: D.sub, fontSize: 11 }}>
            Note: DDM is most appropriate for mature, dividend-paying companies
            with predictable payout policies. It may undervalue companies that
            reinvest heavily or don't pay dividends.
          </div>
        </div>
      </div>
    );
  }

  function renderAPV() {
    const {
      baseAPV,
      pvTS,
      apvEnterpriseValue,
      apvEquityValue,
      impliedSharePriceAPV,
    } = calc;
    return (
      <div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <StatBox label="Unlevered Value (VU)" value={fmtM(baseAPV)} />
          <StatBox
            label="PV of Tax Shield"
            value={fmtM(pvTS)}
            color={D.green}
          />
          <StatBox
            label="APV (Enterprise)"
            value={fmtM(apvEnterpriseValue)}
            color={D.light}
          />
          <StatBox
            label="APV Equity Value"
            value={fmtM(apvEquityValue)}
            color={D.green}
          />
          <StatBox
            label="Implied Price"
            value={`$${impliedSharePriceAPV.toFixed(2)}`}
            color={D.green}
          />
        </div>

        <Card title="APV Inputs">
          <Row label="Annual Interest Expense ($M)">
            <NumInput
              value={inputs.annualInterestExpense}
              onChange={(v) => set("annualInterestExpense", v)}
              prefix="$"
              suffix="M"
              width={90}
            />
          </Row>
          <Row label="Tax Shield Discount Rate">
            <Select
              value={inputs.debtTaxShieldDiscount}
              onChange={(v) => set("debtTaxShieldDiscount", v)}
              options={[
                { value: "rf", label: "Risk-Free Rate (Rf)" },
                { value: "kd", label: "Cost of Debt (Kd)" },
              ]}
              width={200}
            />
          </Row>
        </Card>

        <Card title="Adjusted Present Value Decomposition ($M)">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <TR
                cells={[
                  "Base-Case NPV (Unlevered, VU)",
                  `$${baseAPV.toFixed(1)}M`,
                ]}
              />
              <TR
                cells={[
                  "Annual Tax Shield",
                  `$${(inputs.annualInterestExpense * (inputs.taxRate / 100)).toFixed(1)}M`,
                ]}
              />
              <TR cells={["PV of Tax Shield", `$${pvTS.toFixed(1)}M`]} />
              <TR
                highlight
                cells={[
                  "APV (Enterprise Value)",
                  `$${apvEnterpriseValue.toFixed(1)}M`,
                ]}
              />
              <TR
                cells={["(–) Net Debt", `($${inputs.netDebt.toFixed(1)}M)`]}
              />
              <TR
                cells={[
                  "(–) Minority Interest",
                  `($${inputs.minorityInterest.toFixed(1)}M)`,
                ]}
              />
              <TR
                highlight
                cells={["= Equity Value", `$${apvEquityValue.toFixed(1)}M`]}
              />
              <TR
                highlight
                cells={[
                  "Implied Share Price",
                  `$${impliedSharePriceAPV.toFixed(2)}`,
                ]}
              />
            </tbody>
          </table>
        </Card>

        <div
          style={{
            background: "#0F172A",
            borderRadius: 8,
            padding: 14,
            marginTop: 10,
          }}
        >
          <div style={{ color: D.sub, fontSize: 11 }}>
            APV separates the value of operations from the value of financing
            (tax shields). It is particularly useful for LBOs, project finance,
            and companies with rapidly changing capital structures where WACC
            assumptions may be unreliable.
          </div>
        </div>
      </div>
    );
  }

  function renderSensitivity() {
    const {
      waccRange,
      tgrRange,
      sensitivityMatrix,
      waccRange2,
      exitRange,
      exitSensMatrix,
    } = calc;
    const basePrice = calc.impliedSharePriceFCFF;

    function heatColor(val: number) {
      const diff = val - basePrice;
      if (diff > basePrice * 0.15) return D.green;
      if (diff > 0) return "#86EFAC";
      if (diff > -basePrice * 0.15) return D.yellow;
      return D.red;
    }

    return (
      <div>
        <Card title="WACC vs Terminal Growth Rate → Implied Share Price ($)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      color: D.sub,
                      fontSize: 11,
                      padding: "6px 10px",
                      borderBottom: `1px solid ${D.border}`,
                    }}
                  >
                    WACC \ TGR
                  </th>
                  {tgrRange.map((g) => (
                    <th
                      key={g}
                      style={{
                        color: D.sub,
                        fontSize: 11,
                        padding: "6px 10px",
                        borderBottom: `1px solid ${D.border}`,
                        textAlign: "right",
                      }}
                    >
                      {(g * 100).toFixed(1)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waccRange.map((w, i) => (
                  <tr key={w}>
                    <td
                      style={{
                        color: D.sub,
                        fontSize: 12,
                        padding: "5px 10px",
                        borderBottom: `1px solid rgba(30,58,95,0.4)`,
                      }}
                    >
                      {(w * 100).toFixed(1)}%
                    </td>
                    {sensitivityMatrix[i].map((price, j) => (
                      <td
                        key={j}
                        style={{
                          textAlign: "right",
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight:
                            Math.abs(i - 2) + Math.abs(j - 2) === 0 ? 700 : 400,
                          color: heatColor(price),
                          background:
                            Math.abs(i - 2) + Math.abs(j - 2) === 0
                              ? "rgba(37,99,235,0.15)"
                              : "transparent",
                          border: `1px solid rgba(30,58,95,0.4)`,
                        }}
                      >
                        ${price.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="WACC vs EV/EBITDA Exit Multiple → Implied Share Price ($)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      color: D.sub,
                      fontSize: 11,
                      padding: "6px 10px",
                      borderBottom: `1px solid ${D.border}`,
                    }}
                  >
                    WACC \ EV/EBITDA
                  </th>
                  {exitRange.map((ex) => (
                    <th
                      key={ex}
                      style={{
                        color: D.sub,
                        fontSize: 11,
                        padding: "6px 10px",
                        borderBottom: `1px solid ${D.border}`,
                        textAlign: "right",
                      }}
                    >
                      {ex.toFixed(1)}x
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waccRange2.map((w, i) => (
                  <tr key={w}>
                    <td
                      style={{
                        color: D.sub,
                        fontSize: 12,
                        padding: "5px 10px",
                        borderBottom: `1px solid rgba(30,58,95,0.4)`,
                      }}
                    >
                      {(w * 100).toFixed(1)}%
                    </td>
                    {exitSensMatrix[i].map((price, j) => (
                      <td
                        key={j}
                        style={{
                          textAlign: "right",
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight:
                            Math.abs(i - 2) + Math.abs(j - 2) === 0 ? 700 : 400,
                          color: heatColor(price),
                          background:
                            Math.abs(i - 2) + Math.abs(j - 2) === 0
                              ? "rgba(37,99,235,0.15)"
                              : "transparent",
                          border: `1px solid rgba(30,58,95,0.4)`,
                        }}
                      >
                        ${price.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  function renderScenarios() {
    const { bull, base, bear } = calc;
    const scenarios = [
      { name: "Bull Case", data: bull, color: D.green, icon: "▲" },
      { name: "Base Case", data: base, color: D.light, icon: "●" },
      { name: "Bear Case", data: bear, color: D.red, icon: "▼" },
    ];

    return (
      <div>
        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
          {scenarios.map((s) => (
            <div
              key={s.name}
              style={{
                flex: 1,
                background: D.card,
                border: `1px solid ${s.color}40`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  color: s.color,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {s.icon} {s.name}
              </div>
              <div style={{ color: D.text, fontSize: 24, fontWeight: 800 }}>
                ${s.data.price.toFixed(2)}
              </div>
              <div style={{ color: D.sub, fontSize: 11, marginTop: 4 }}>
                per share
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                <div>
                  <div style={{ color: D.muted, fontSize: 10 }}>EV</div>
                  <div style={{ color: D.text, fontSize: 13 }}>
                    ${s.data.ev.toFixed(0)}M
                  </div>
                </div>
                <div>
                  <div style={{ color: D.muted, fontSize: 10 }}>Eq. Value</div>
                  <div style={{ color: D.text, fontSize: 13 }}>
                    ${s.data.eq.toFixed(0)}M
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card title="Scenario Assumptions">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <div
                style={{
                  color: D.sub,
                  fontSize: 11,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                BULL CASE ADJUSTMENTS
              </div>
              <Row label="Revenue Growth +">
                <NumInput
                  value={inputs.bullRevenueAdj}
                  onChange={(v) => set("bullRevenueAdj", v)}
                  suffix="pp"
                  step={0.5}
                  width={80}
                />
              </Row>
              <Row label="EBITDA Margin +">
                <NumInput
                  value={inputs.bullMarginAdj}
                  onChange={(v) => set("bullMarginAdj", v)}
                  suffix="pp"
                  step={0.5}
                  width={80}
                />
              </Row>
              <Row label="WACC Adjustment">
                <NumInput
                  value={inputs.bullWACCAdj}
                  onChange={(v) => set("bullWACCAdj", v)}
                  suffix="pp"
                  step={0.25}
                  width={80}
                />
              </Row>
              <Row label="TGR Adjustment">
                <NumInput
                  value={inputs.bullTGRAdj}
                  onChange={(v) => set("bullTGRAdj", v)}
                  suffix="pp"
                  step={0.25}
                  width={80}
                />
              </Row>
              <Row label="Exit Multiple Adj.">
                <NumInput
                  value={inputs.bullExitMultipleAdj}
                  onChange={(v) => set("bullExitMultipleAdj", v)}
                  suffix="x"
                  step={0.5}
                  width={80}
                />
              </Row>
            </div>
            <div>
              <div
                style={{
                  color: D.sub,
                  fontSize: 11,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                BEAR CASE ADJUSTMENTS
              </div>
              <Row label="Revenue Growth Δ">
                <NumInput
                  value={inputs.bearRevenueAdj}
                  onChange={(v) => set("bearRevenueAdj", v)}
                  suffix="pp"
                  step={0.5}
                  width={80}
                />
              </Row>
              <Row label="EBITDA Margin Δ">
                <NumInput
                  value={inputs.bearMarginAdj}
                  onChange={(v) => set("bearMarginAdj", v)}
                  suffix="pp"
                  step={0.5}
                  width={80}
                />
              </Row>
              <Row label="WACC Adjustment">
                <NumInput
                  value={inputs.bearWACCAdj}
                  onChange={(v) => set("bearWACCAdj", v)}
                  suffix="pp"
                  step={0.25}
                  width={80}
                />
              </Row>
              <Row label="TGR Adjustment">
                <NumInput
                  value={inputs.bearTGRAdj}
                  onChange={(v) => set("bearTGRAdj", v)}
                  suffix="pp"
                  step={0.25}
                  width={80}
                />
              </Row>
              <Row label="Exit Multiple Adj.">
                <NumInput
                  value={inputs.bearExitMultipleAdj}
                  onChange={(v) => set("bearExitMultipleAdj", v)}
                  suffix="x"
                  step={0.5}
                  width={80}
                />
              </Row>
            </div>
          </div>
        </Card>

        <Card title="Scenario Comparison Table">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <TableHeader cols={["Metric", "Bear", "Base", "Bull"]} />
            </thead>
            <tbody>
              <TR
                cells={[
                  "Revenue Growth Δ (pp)",
                  `${inputs.bearRevenueAdj}%`,
                  "0%",
                  `+${inputs.bullRevenueAdj}%`,
                ]}
              />
              <TR
                cells={[
                  "EBITDA Margin Δ (pp)",
                  `${inputs.bearMarginAdj}%`,
                  "0%",
                  `+${inputs.bullMarginAdj}%`,
                ]}
              />
              <TR
                cells={[
                  "WACC Δ (pp)",
                  `+${inputs.bearWACCAdj}%`,
                  "0%",
                  `${inputs.bullWACCAdj}%`,
                ]}
              />
              <TR
                cells={[
                  "Enterprise Value",
                  `$${bear.ev.toFixed(0)}M`,
                  `$${base.ev.toFixed(0)}M`,
                  `$${bull.ev.toFixed(0)}M`,
                ]}
              />
              <TR
                cells={[
                  "Equity Value",
                  `$${bear.eq.toFixed(0)}M`,
                  `$${base.eq.toFixed(0)}M`,
                  `$${bull.eq.toFixed(0)}M`,
                ]}
              />
              <TR
                highlight
                cells={[
                  "Implied Price",
                  `$${bear.price.toFixed(2)}`,
                  `$${base.price.toFixed(2)}`,
                  `$${bull.price.toFixed(2)}`,
                ]}
              />
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  function renderFootball() {
    const { ffDCF, ffExit, ffDDM } = calc;
    const allVals = [
      ffDCF.low,
      ffDCF.high,
      ffExit.low,
      ffExit.high,
      ffDDM.low,
      ffDDM.high,
    ].filter((v) => isFinite(v));
    const globalMin = Math.min(...allVals);
    const globalMax = Math.max(...allVals);
    const range = globalMax - globalMin || 1;

    function Bar({
      label,
      low,
      high,
      color,
    }: {
      label: string;
      low: number;
      high: number;
      color: string;
    }) {
      const leftPct = ((low - globalMin) / range) * 100;
      const widthPct = ((high - low) / range) * 100;
      return (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ color: D.sub, fontSize: 12 }}>{label}</span>
            <span style={{ color: D.text, fontSize: 12, fontWeight: 600 }}>
              ${low.toFixed(2)} – ${high.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              background: "#1E293B",
              borderRadius: 6,
              height: 28,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                width: `${Math.max(widthPct, 2)}%`,
                height: "100%",
                background: color,
                borderRadius: 4,
                opacity: 0.8,
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <Card title="Football Field Ranges">
          <Row label="WACC Range (low)">
            <NumInput
              value={inputs.ffWACCLow}
              onChange={(v) => set("ffWACCLow", v)}
              suffix="%"
              step={0.5}
              width={80}
            />
          </Row>
          <Row label="WACC Range (high)">
            <NumInput
              value={inputs.ffWACCHigh}
              onChange={(v) => set("ffWACCHigh", v)}
              suffix="%"
              step={0.5}
              width={80}
            />
          </Row>
          <Row label="TGR Range (low)">
            <NumInput
              value={inputs.ffTGRLow}
              onChange={(v) => set("ffTGRLow", v)}
              suffix="%"
              step={0.25}
              width={80}
            />
          </Row>
          <Row label="TGR Range (high)">
            <NumInput
              value={inputs.ffTGRHigh}
              onChange={(v) => set("ffTGRHigh", v)}
              suffix="%"
              step={0.25}
              width={80}
            />
          </Row>
          <Row label="Exit Multiple Range (low)">
            <NumInput
              value={inputs.ffExitLow}
              onChange={(v) => set("ffExitLow", v)}
              suffix="x"
              step={0.5}
              width={80}
            />
          </Row>
          <Row label="Exit Multiple Range (high)">
            <NumInput
              value={inputs.ffExitHigh}
              onChange={(v) => set("ffExitHigh", v)}
              suffix="x"
              step={0.5}
              width={80}
            />
          </Row>
        </Card>

        <Card title="Valuation Football Field – Implied Share Price ($)">
          <div style={{ padding: "8px 0" }}>
            <Bar
              label="DCF (Gordon Growth)"
              low={ffDCF.low}
              high={ffDCF.high}
              color={D.primary}
            />
            <Bar
              label="DCF (Exit Multiple)"
              low={ffExit.low}
              high={ffExit.high}
              color="#7C3AED"
            />
            <Bar
              label="DDM (±15%)"
              low={ffDDM.low}
              high={ffDDM.high}
              color={D.green}
            />
            <Bar
              label="Bear / Base / Bull"
              low={calc.bear.price}
              high={calc.bull.price}
              color={D.yellow}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
              marginTop: 8,
            }}
          >
            <span style={{ color: D.muted, fontSize: 10 }}>
              ${globalMin.toFixed(2)}
            </span>
            <span style={{ color: D.muted, fontSize: 10 }}>
              ${((globalMin + globalMax) / 2).toFixed(2)}
            </span>
            <span style={{ color: D.muted, fontSize: 10 }}>
              ${globalMax.toFixed(2)}
            </span>
          </div>
        </Card>

        <Card title="Valuation Summary Table">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <TableHeader
                cols={["Method", "Low ($)", "Mid ($)", "High ($)"]}
              />
            </thead>
            <tbody>
              <TR
                cells={[
                  "FCFF DCF (Gordon Growth)",
                  `$${ffDCF.low.toFixed(2)}`,
                  `$${((ffDCF.low + ffDCF.high) / 2).toFixed(2)}`,
                  `$${ffDCF.high.toFixed(2)}`,
                ]}
              />
              <TR
                cells={[
                  "FCFF DCF (Exit Multiple)",
                  `$${ffExit.low.toFixed(2)}`,
                  `$${((ffExit.low + ffExit.high) / 2).toFixed(2)}`,
                  `$${ffExit.high.toFixed(2)}`,
                ]}
              />
              <TR
                cells={[
                  "DDM",
                  `$${ffDDM.low.toFixed(2)}`,
                  `$${calc.intrinsicValueDDM.toFixed(2)}`,
                  `$${ffDDM.high.toFixed(2)}`,
                ]}
              />
              <TR
                cells={[
                  "APV",
                  "—",
                  `$${calc.impliedSharePriceAPV.toFixed(2)}`,
                  "—",
                ]}
              />
              <TR
                cells={[
                  "Scenario (Bear–Bull)",
                  `$${calc.bear.price.toFixed(2)}`,
                  `$${calc.base.price.toFixed(2)}`,
                  `$${calc.bull.price.toFixed(2)}`,
                ]}
              />
              <TR
                highlight
                cells={[
                  "Central Estimate",
                  "",
                  `$${calc.impliedSharePriceFCFF.toFixed(2)}`,
                  "",
                ]}
              />
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    setup: renderSetup(),
    projections: renderProjections(),
    fcff: renderFCFF(),
    fcfe: renderFCFE(),
    ddm: renderDDM(),
    apv: renderAPV(),
    sensitivity: renderSensitivity(),
    scenarios: renderScenarios(),
    football: renderFootball(),
  };

  return (
    <div
      style={{
        background: embedded ? "transparent" : D.bg,
        minHeight: embedded ? undefined : "100vh",
        color: D.text,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header — hidden when embedded in another suite */}
      {!embedded && (
        <div
          style={{
            background: "#060C18",
            borderBottom: `1px solid ${D.border}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => {
                window.location.hash = "";
              }}
              style={{
                background: "none",
                border: "none",
                color: D.muted,
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ←
            </button>
            <div>
              <div
                style={{
                  color: D.light,
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: "0.02em",
                }}
              >
                DCF CALCULATOR
              </div>
              <div style={{ color: D.muted, fontSize: 11 }}>
                {inputs.companyName} ({inputs.ticker}) · 7-Method Discounted
                Cash Flow Analysis
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Presets */}
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(PRESETS).map(([key, _]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  style={{
                    background: "rgba(37,99,235,0.1)",
                    border: `1px solid ${D.border}`,
                    borderRadius: 6,
                    color: D.light,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    textTransform: "capitalize",
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              onClick={exportCSV}
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(96,165,250,0.1))",
                border: `1px solid ${D.primary}`,
                borderRadius: 8,
                color: D.light,
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 16px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Embedded toolbar — presets + export when inside another suite */}
      {embedded && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0 12px 0",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(PRESETS).map(([key, _]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                style={{
                  background: "rgba(37,99,235,0.1)",
                  border: `1px solid ${D.border}`,
                  borderRadius: 6,
                  color: D.light,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  textTransform: "capitalize",
                }}
              >
                {key}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            style={{
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(96,165,250,0.1))",
              border: `1px solid ${D.primary}`,
              borderRadius: 8,
              color: D.light,
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 14px",
              cursor: "pointer",
            }}
          >
            ↓ Export CSV
          </button>
        </div>
      )}

      {/* Key Stats Bar */}
      <div
        style={{
          background: "#0C1526",
          borderBottom: `1px solid ${D.border}`,
          padding: "10px 24px",
          display: "flex",
          gap: 28,
          overflowX: "auto",
        }}
      >
        {[
          { label: "WACC", value: fmtPct(calc.wacc * 100), color: D.light },
          {
            label: "Cost of Equity (Ke)",
            value: fmtPct(calc.ke * 100),
            color: D.text,
          },
          {
            label: "FCFF EV",
            value: fmtM(calc.enterpriseValueFCFF),
            color: D.text,
          },
          {
            label: "FCFF Price",
            value: `$${calc.impliedSharePriceFCFF.toFixed(2)}`,
            color: D.green,
          },
          {
            label: "FCFE Price",
            value: `$${calc.impliedSharePriceFCFE.toFixed(2)}`,
            color: D.green,
          },
          {
            label: "DDM Value",
            value: `$${calc.intrinsicValueDDM.toFixed(2)}`,
            color: D.green,
          },
          {
            label: "APV Price",
            value: `$${calc.impliedSharePriceAPV.toFixed(2)}`,
            color: D.green,
          },
          {
            label: "Bull Price",
            value: `$${calc.bull.price.toFixed(2)}`,
            color: D.green,
          },
          {
            label: "Bear Price",
            value: `$${calc.bear.price.toFixed(2)}`,
            color: D.red,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: D.muted, fontSize: 10 }}>{label}</span>
            <span style={{ color, fontSize: 14, fontWeight: 700 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div
        style={{
          borderBottom: `1px solid ${D.border}`,
          display: "flex",
          overflowX: "auto",
          padding: "0 24px",
          background: "#060C18",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === t.id
                  ? `2px solid ${D.primary}`
                  : "2px solid transparent",
              color: activeTab === t.id ? D.light : D.muted,
              fontWeight: activeTab === t.id ? 700 : 400,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.04em",
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
