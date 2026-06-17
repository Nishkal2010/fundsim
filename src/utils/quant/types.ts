// Shared types for the Quant simulator engines and UI.
// The src/types/fund.ts analogue for the quant namespace.

export type OptionType = "call" | "put";

export interface GreekSet {
  delta: number;
  gamma: number;
  vega: number; // per 1.00 (100%) change in vol; divide by 100 for per-1%-vol
  theta: number; // per year; divide by 365 for per-calendar-day
  rho: number; // per 1.00 (100%) change in rate
}

export interface BsmResult {
  price: number;
  d1: number;
  d2: number;
  greeks: GreekSet;
}

export interface MonteCarloResult {
  mean: number;
  stdError: number;
  ci95: [number, number];
  n: number;
  // Running estimate sampled at log-spaced checkpoints, for a convergence chart.
  convergence: { n: number; estimate: number; stdError: number }[];
}

// One simulated price path: value at each time step (length = steps + 1).
export type PricePath = number[];

export interface PathStats {
  times: number[]; // time axis, length steps + 1
  paths: PricePath[]; // sampled individual paths for display
  // Percentile bands across ALL simulated paths at each time step (fan chart).
  bands: {
    p5: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p95: number[];
  };
  terminal: number[]; // terminal value of every simulated path (histogram)
}

export interface FrontierPoint {
  ret: number;
  vol: number;
  sharpe: number;
  weights: number[];
}

export interface PortfolioStats {
  ret: number;
  vol: number;
  sharpe: number;
}

export interface VaRResult {
  var: number; // loss magnitude (positive number) at the confidence level
  cvar: number; // expected shortfall beyond VaR (positive number)
  confidence: number;
}

export interface BacktestResult {
  equityCurve: number[];
  benchmark: number[];
  totalReturn: number;
  sharpe: number;
  maxDrawdown: number;
  trades: number;
  positions: number[]; // position held entering each step (−1..1)
}

export interface BondResult {
  price: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
}

// Asset in the portfolio/risk basket. Returns/vols are annualized decimals.
export interface QuantAsset {
  name: string;
  expReturn: number;
  vol: number;
}

// Global inputs for the quant track (lightweight, localStorage-persisted —
// NOT the heavy Supabase fund model).
export interface QuantInputs {
  // Single-asset option/price inputs
  spot: number;
  strike: number;
  rate: number; // risk-free, annual decimal
  vol: number; // annual decimal
  maturity: number; // years
  dividendYield: number; // annual decimal
  optionType: OptionType;
  // Simulation controls
  mcPaths: number;
  steps: number;
  drift: number; // annual decimal (real-world μ for path sims)
  seed: number;
  // Portfolio basket + correlation matrix (n×n, diagonal = 1)
  assets: QuantAsset[];
  correlations: number[][];
}
