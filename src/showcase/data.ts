// Single source of truth for the showcase landing. Copy mirrors the live
// SimulatorSelector so the marketing site and the app never contradict.

export type SimId = "pe" | "vc" | "ib";

export interface Sim {
  id: SimId;
  label: string;
  sublabel: string;
  badge: string;
  accent: string; // primary accent hex
  glow: string; // lighter accent for text/glow
  dim: string; // translucent fill
  border: string; // translucent border
  cta: string; // deep-link query the real app understands (?sim=pe)
  description: string;
  features: string[];
  stats: string[];
  modeledOn: string;
}

export const SIMS: Sim[] = [
  {
    id: "pe",
    label: "Private Equity",
    sublabel: "Buyout Fund Simulator",
    badge: "PE",
    accent: "#6366F1",
    glow: "#818CF8",
    dim: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.30)",
    cta: "?sim=pe",
    description:
      "Run an institutional buyout fund end-to-end — from LP capital calls to final distributions. Master leverage, fee drag, the waterfall, and what actually drives PE returns.",
    features: [
      "Fund lifecycle & management-fee drag",
      "J-curve: capital deployment & recovery",
      "Waterfall — European vs American",
      "DPI / TVPI / Net IRR / PME",
      "LBO modeling — debt schedule & returns",
      "GP/LP economics & carried interest",
      "Debt structure — tranches, DSCR, covenants",
      "Sector benchmarks & value-creation bridge",
    ],
    stats: [
      "8 modules",
      "2 / 20 fee model",
      "European + American",
      "8% hurdle",
    ],
    modeledOn: "KKR · Blackstone · Apollo",
  },
  {
    id: "vc",
    label: "Venture Capital",
    sublabel: "Startup Investing Simulator",
    badge: "VC",
    accent: "#10B981",
    glow: "#34D399",
    dim: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.30)",
    cta: "?sim=vc",
    description:
      "Simulate the full venture cycle from first check to exit. Master cap-table dilution, SAFEs, power-law portfolio construction, and the term-sheet mechanics that decide who gets paid.",
    features: [
      "Cap table — dilution across every round",
      "SAFE notes & convertible instruments",
      "Option-pool shuffle & anti-dilution",
      "Portfolio construction & power-law returns",
      "Reserve strategy & follow-on allocation",
      "Term-sheet provisions — VC vs founder",
      "Pro-rata rights & liquidation waterfalls",
      "Qualitative scorecard — Payne + Berkus",
      "Market sizing — TAM / SAM / SOM",
    ],
    stats: ["11 modules", "Pre/Post SAFEs", "Power-law model", "Qual + Quant"],
    modeledOn: "Sequoia · a16z · Benchmark",
  },
  {
    id: "ib",
    label: "Investment Banking",
    sublabel: "M&A Deal Simulator",
    badge: "IB",
    accent: "#F59E0B",
    glow: "#FBBF24",
    dim: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.30)",
    cta: "?sim=ib",
    description:
      "Take an M&A deal from valuation pitch to signed merger agreement. Four valuation methods, offer structure, accretion / dilution with synergies — then score it like an analyst.",
    features: [
      "DCF — WACC, terminal value, sensitivity",
      "Comparable companies analysis",
      "Precedent transaction analysis",
      "Football-field valuation chart",
      "Offer structure — cash / stock / mixed",
      "Accretion / dilution with PPA & synergies",
      "LBO credit & sponsor-returns analysis",
      "100-point deal-score rubric",
    ],
    stats: [
      "9 modules",
      "4 valuation methods",
      "8 deal presets",
      "100-pt score",
    ],
    modeledOn: "Goldman · Morgan Stanley · JPMorgan",
  },
];

export const APP_URL = "https://fundsimulate.com";

// Headline metrics for the animated stat band.
export interface Metric {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  accent: string;
}

export const METRICS: Metric[] = [
  {
    value: 28,
    prefix: "",
    suffix: "+",
    label: "Interactive modules",
    accent: "#818CF8",
  },
  {
    value: 3,
    prefix: "",
    suffix: "",
    label: "Career tracks — PE · VC · IB",
    accent: "#34D399",
  },
  {
    value: 4,
    prefix: "",
    suffix: "",
    label: "Valuation methods in M&A",
    accent: "#FBBF24",
  },
  {
    value: 0,
    prefix: "$",
    suffix: "",
    label: "Cost — free forever",
    accent: "#F9FAFB",
  },
];
