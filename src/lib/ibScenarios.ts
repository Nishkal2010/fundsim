// Pure scenario-compute for IB deals. Mirrors the math inside
// src/components/IB/IBSimulator.tsx (~L1016–L1300), extracted here as a
// pure function so multiple scenarios can share one base input set with
// deterministic deltas applied per scenario (bull / base / bear).
//
// Keep DA_RATES/NWC_RATES/COMPS_MAP in sync with IBSimulator.

export interface ScenarioInputs {
  // Target
  tgtRevenue: number;
  tgtEBITDA: number;
  tgtShares: number;
  tgtPrice: number;
  tgtNetDebt: number;
  tgtFCF: number;
  // Deal
  sector: string;
  dealType: string;
  offerPremium: number; // %
  // DCF drivers (% values, e.g. 8 for 8%)
  revenueGrowth: number;
  terminalGrowth: number;
  ebitdaMarginPct: number;
  capexPct: number;
  taxRate: number;
  wacc: number;
  // LBO
  seniorLeverage: number;
  mezzLeverage: number;
  seniorRate: number; // %
  mezzRate: number; // %
  holdPeriod: number;
  exitMultipleOverride: number; // 0 = use comps default
}

export interface ScenarioOutputs {
  // Deal
  offerPrice: number;
  dealValue: number;
  offerEV: number;
  // DCF
  dcfEV: number;
  dcfEquity: number;
  pvFCFFs: number;
  pvTV: number;
  // LBO
  totalDebt: number;
  sponsorEquity: number;
  exitEBITDA: number;
  exitEV: number;
  exitEquity: number;
  moic: number;
  irr: number; // % e.g. 18.6 for 18.6%
  // Headline metrics
  revenueCAGR: number; // %
  ebitdaMargin: number; // %
}

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

const COMPS_MAP: Record<string, number> = {
  tech: 18,
  healthcare: 16,
  industrial: 10,
  consumer: 12,
  energy: 8,
};

export function computeScenario(inputs: ScenarioInputs): ScenarioOutputs {
  const {
    tgtRevenue,
    tgtEBITDA,
    tgtShares,
    tgtPrice,
    tgtNetDebt,
    tgtFCF,
    sector,
    offerPremium,
    revenueGrowth,
    terminalGrowth,
    ebitdaMarginPct,
    capexPct,
    taxRate,
    wacc,
    seniorLeverage,
    mezzLeverage,
    holdPeriod,
    exitMultipleOverride,
  } = inputs;

  // Offer
  const offerPrice = tgtPrice * (1 + offerPremium / 100);
  const dealValue = offerPrice * tgtShares;
  const offerEV = dealValue + tgtNetDebt;

  // Comps multiple (sector-derived)
  const compsMultiple = COMPS_MAP[sector] ?? 12;
  const exitMultipleFinal =
    exitMultipleOverride > 0 ? exitMultipleOverride : compsMultiple;

  // ─── DCF ─────────────────────────────────────────────────────────────────
  const daRate = DA_RATES[sector] ?? 0.08;
  const nwcRate = NWC_RATES[sector] ?? 0.02;
  const projections = Array.from({ length: 5 }, (_, i) => {
    const yr = i + 1;
    const rev = tgtRevenue * Math.pow(1 + revenueGrowth / 100, yr);
    const prevRev =
      i === 0
        ? tgtRevenue
        : tgtRevenue * Math.pow(1 + revenueGrowth / 100, yr - 1);
    const ebitda = rev * (ebitdaMarginPct / 100);
    const da = rev * daRate;
    const ebit = ebitda - da;
    const nopat = ebit * (1 - taxRate / 100);
    const capex = rev * (capexPct / 100);
    const deltaNWC = (rev - prevRev) * nwcRate;
    const fcff = nopat + da - capex - deltaNWC;
    const pv = fcff / Math.pow(1 + wacc / 100, yr);
    return { yr, rev, ebitda, fcff, pv };
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

  // ─── LBO ─────────────────────────────────────────────────────────────────
  const seniorDebt = tgtEBITDA * seniorLeverage;
  const mezzDebt = tgtEBITDA * mezzLeverage;
  const totalDebt = seniorDebt + mezzDebt;
  const sponsorEquity = Math.max(0, offerEV - totalDebt);

  const hp = Math.max(1, holdPeriod);
  const exitRevenue = tgtRevenue * Math.pow(1 + revenueGrowth / 100, hp);
  const exitEBITDA = exitRevenue * (ebitdaMarginPct / 100);
  const exitEV = exitEBITDA * exitMultipleFinal;

  // Debt schedule (carry-forward)
  let openDebt = totalDebt;
  for (let i = 0; i < hp; i++) {
    const fcfYr = tgtFCF * Math.pow(1 + revenueGrowth / 200, i + 1);
    const repayment = Math.min(fcfYr * 0.7, openDebt);
    openDebt = Math.max(0, openDebt - repayment);
  }
  const debtAtExit = openDebt;
  const exitEquity = Math.max(0, exitEV - debtAtExit);

  const moic = sponsorEquity > 0 ? exitEquity / sponsorEquity : 0;
  const irr =
    sponsorEquity > 0 && moic > 0 ? (Math.pow(moic, 1 / hp) - 1) * 100 : 0;

  // Revenue CAGR over the projection horizon
  const revenueCAGR = revenueGrowth;

  return {
    offerPrice,
    dealValue,
    offerEV,
    dcfEV,
    dcfEquity,
    pvFCFFs,
    pvTV,
    totalDebt,
    sponsorEquity,
    exitEBITDA,
    exitEV,
    exitEquity,
    moic,
    irr,
    revenueCAGR,
    ebitdaMargin: ebitdaMarginPct,
  };
}

// ─── Scenario transforms ────────────────────────────────────────────────────
// Deterministic deltas applied to a single base input set.
//
// Conventions:
//   - Multiplicative on percentages: revenueGrowth × 1.3 means a base of 8% → 10.4%
//   - Additive on rates measured in bps where context demands (e.g. interest +100bps)

export type ScenarioId = "bull" | "base" | "bear";

export interface ScenarioDef {
  id: ScenarioId;
  label: string;
  description: string;
  accent: string;
  transform: (base: ScenarioInputs) => ScenarioInputs;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: "bull",
    label: "Bull",
    description:
      "Upside case — faster growth, margin expansion, multiple expansion",
    accent: "#10B981",
    transform: (b) => ({
      ...b,
      revenueGrowth: b.revenueGrowth * 1.3,
      ebitdaMarginPct: b.ebitdaMarginPct * 1.1,
      exitMultipleOverride:
        (b.exitMultipleOverride > 0
          ? b.exitMultipleOverride
          : (COMPS_MAP[b.sector] ?? 12)) * 1.15,
      terminalGrowth: b.terminalGrowth * 1.2,
    }),
  },
  {
    id: "base",
    label: "Base",
    description: "Management plan — assumptions as entered",
    accent: "#6366F1",
    transform: (b) => ({ ...b }),
  },
  {
    id: "bear",
    label: "Bear",
    description:
      "Downside — slower growth, margin compression, multiple contraction",
    accent: "#F59E0B",
    transform: (b) => ({
      ...b,
      revenueGrowth: b.revenueGrowth * 0.7,
      ebitdaMarginPct: b.ebitdaMarginPct * 0.9,
      exitMultipleOverride:
        (b.exitMultipleOverride > 0
          ? b.exitMultipleOverride
          : (COMPS_MAP[b.sector] ?? 12)) * 0.85,
      terminalGrowth: b.terminalGrowth * 0.7,
    }),
  },
];

// ─── Tornado sensitivity ────────────────────────────────────────────────────
// For each key input, vary ±20% and record the IRR delta vs. base.
// Used by the tornado chart to show which assumptions drive the most variance.

export interface TornadoBar {
  label: string;
  baseIRR: number;
  lowIRR: number; // -20% on input
  highIRR: number; // +20% on input
  spread: number; // |highIRR - lowIRR|
}

const TORNADO_KNOBS: Array<{
  label: string;
  apply: (base: ScenarioInputs, delta: number) => ScenarioInputs;
}> = [
  {
    label: "Revenue Growth",
    apply: (b, d) => ({ ...b, revenueGrowth: b.revenueGrowth * (1 + d) }),
  },
  {
    label: "EBITDA Margin",
    apply: (b, d) => ({ ...b, ebitdaMarginPct: b.ebitdaMarginPct * (1 + d) }),
  },
  {
    label: "Exit Multiple",
    apply: (b, d) => {
      const cur =
        b.exitMultipleOverride > 0
          ? b.exitMultipleOverride
          : (COMPS_MAP[b.sector] ?? 12);
      return { ...b, exitMultipleOverride: cur * (1 + d) };
    },
  },
  {
    label: "Hold Period",
    apply: (b, d) => ({
      ...b,
      holdPeriod: Math.max(1, Math.round(b.holdPeriod * (1 + d))),
    }),
  },
  {
    label: "Senior Leverage",
    apply: (b, d) => ({ ...b, seniorLeverage: b.seniorLeverage * (1 + d) }),
  },
  {
    label: "WACC",
    apply: (b, d) => ({ ...b, wacc: b.wacc * (1 + d) }),
  },
  {
    label: "Capex %",
    apply: (b, d) => ({ ...b, capexPct: b.capexPct * (1 + d) }),
  },
  {
    label: "Tax Rate",
    apply: (b, d) => ({ ...b, taxRate: b.taxRate * (1 + d) }),
  },
];

export function computeTornado(
  base: ScenarioInputs,
  deltaPct = 0.2,
): TornadoBar[] {
  const baseIRR = computeScenario(base).irr;
  return TORNADO_KNOBS.map(({ label, apply }) => {
    const lowIRR = computeScenario(apply(base, -deltaPct)).irr;
    const highIRR = computeScenario(apply(base, deltaPct)).irr;
    return {
      label,
      baseIRR,
      lowIRR,
      highIRR,
      spread: Math.abs(highIRR - lowIRR),
    };
  }).sort((a, b) => b.spread - a.spread);
}
