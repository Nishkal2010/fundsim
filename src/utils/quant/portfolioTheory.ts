// Modern portfolio theory: portfolio moments, the efficient frontier,
// tangency / minimum-variance / max-Sharpe portfolios, CAPM, and Kelly sizing.
//
// Conventions: expected returns and vols are annual decimals; the covariance
// matrix Σ is annual. Weights sum to 1 (long-only frontier sampling enforces
// non-negative weights; the closed-form min-variance allows shorts).

import { invertMatrix, matVec, dot } from "./stats";
import type { FrontierPoint, PortfolioStats, QuantAsset } from "./types";

// Build a covariance matrix from per-asset vols and a correlation matrix.
export function covFromCorr(vols: number[], corr: number[][]): number[][] {
  const n = vols.length;
  const cov: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) cov[i][j] = corr[i][j] * vols[i] * vols[j];
  return cov;
}

export function portfolioReturn(
  weights: number[],
  expReturns: number[],
): number {
  return dot(weights, expReturns);
}

export function portfolioVariance(weights: number[], cov: number[][]): number {
  return dot(weights, matVec(cov, weights));
}

export function portfolioStats(
  weights: number[],
  expReturns: number[],
  cov: number[][],
  rf = 0,
): PortfolioStats {
  const ret = portfolioReturn(weights, expReturns);
  const vol = Math.sqrt(Math.max(0, portfolioVariance(weights, cov)));
  const sharpe = vol > 0 ? (ret - rf) / vol : 0;
  return { ret, vol, sharpe };
}

// Closed-form global minimum-variance portfolio: w = Σ⁻¹·𝟙 / (𝟙ᵀ·Σ⁻¹·𝟙).
// May include short positions (weights can be negative).
export function minVariancePortfolio(cov: number[][]): number[] {
  const n = cov.length;
  const inv = invertMatrix(cov);
  const ones = new Array(n).fill(1);
  const invOnes = matVec(inv, ones);
  const denom = dot(ones, invOnes);
  return invOnes.map((x) => x / denom);
}

// Tangency (max-Sharpe) portfolio in closed form:
//   w ∝ Σ⁻¹·(μ − rf·𝟙), normalized to sum to 1.
// Returns null when no positive-Sharpe portfolio exists: if the raw weights
// sum to ≤ 0 (e.g. every asset's excess return is negative), normalizing by a
// non-positive scalar would flip the signs and yield the WORST portfolio. The
// tangency portfolio is undefined in that regime, so we say so rather than
// return a misleading answer.
export function tangencyPortfolio(
  expReturns: number[],
  cov: number[][],
  rf = 0,
): number[] | null {
  const inv = invertMatrix(cov);
  const excess = expReturns.map((m) => m - rf);
  const raw = matVec(inv, excess);
  const s = raw.reduce((a, b) => a + b, 0);
  if (s <= 1e-12) return null;
  return raw.map((x) => x / s);
}

// Long-only efficient frontier by sampling the weight simplex and keeping the
// upper hull (max return per vol bucket). Avoids a QP solver; we note this is
// a sampled approximation. For 2 assets it traces the exact analytic curve.
export function efficientFrontier(
  expReturns: number[],
  cov: number[][],
  rf = 0,
  samples = 4000,
): FrontierPoint[] {
  const n = expReturns.length;

  if (n === 2) {
    // Exact 2-asset frontier: sweep w in [0,1].
    const pts: FrontierPoint[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const w0 = i / steps;
      const w = [w0, 1 - w0];
      const { ret, vol, sharpe } = portfolioStats(w, expReturns, cov, rf);
      pts.push({ ret, vol, sharpe, weights: w });
    }
    return pts;
  }

  // N-asset: Dirichlet-style sampling of long-only weights, bucket by vol,
  // keep the max-return portfolio in each bucket → the efficient edge.
  const rng = mulberry(123457);
  const buckets = new Map<number, FrontierPoint>();
  for (let s = 0; s < samples; s++) {
    const raw = Array.from({ length: n }, () => -Math.log(rng()));
    const sum = raw.reduce((a, b) => a + b, 0);
    const w = raw.map((x) => x / sum);
    const { ret, vol, sharpe } = portfolioStats(w, expReturns, cov, rf);
    const key = Math.round(vol * 200); // 0.5% vol buckets
    const existing = buckets.get(key);
    if (!existing || ret > existing.ret) {
      buckets.set(key, { ret, vol, sharpe, weights: w });
    }
  }
  return [...buckets.values()].sort((a, b) => a.vol - b.vol);
}

// The max-Sharpe point along a frontier (tangency portfolio touch point).
export function maxSharpePoint(frontier: FrontierPoint[]): FrontierPoint {
  return frontier.reduce((best, p) => (p.sharpe > best.sharpe ? p : best));
}

// CAPM beta = Cov(asset, market) / Var(market), from return series.
export function capmBeta(
  assetReturns: number[],
  marketReturns: number[],
): number {
  const n = assetReturns.length;
  const ma = assetReturns.reduce((s, x) => s + x, 0) / n;
  const mm = marketReturns.reduce((s, x) => s + x, 0) / n;
  let cov = 0;
  let varM = 0;
  for (let i = 0; i < n; i++) {
    cov += (assetReturns[i] - ma) * (marketReturns[i] - mm);
    varM += (marketReturns[i] - mm) * (marketReturns[i] - mm);
  }
  return varM === 0 ? 0 : cov / varM;
}

// CAPM expected return: rf + β·(E[Rm] − rf).
export function capmExpectedReturn(
  rf: number,
  beta: number,
  marketReturn: number,
): number {
  return rf + beta * (marketReturn - rf);
}

// Continuous Kelly fraction for a normally-distributed excess return:
//   f* = (μ − r) / σ².  Optimal growth-rate leverage.
export function kellyFraction(mu: number, rf: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return (mu - rf) / (sigma * sigma);
}

// Discrete Kelly for a binary bet: f* = (b·p − q)/b, b = net odds, q = 1−p.
export function kellyBinary(p: number, b: number): number {
  if (b <= 0) return 0;
  return (b * p - (1 - p)) / b;
}

export function buildAssets(
  names: string[],
  expReturns: number[],
  vols: number[],
): QuantAsset[] {
  return names.map((name, i) => ({
    name,
    expReturn: expReturns[i],
    vol: vols[i],
  }));
}

// Small deterministic PRNG for frontier sampling (independent of the seeded
// LCG so it never perturbs the path-simulation streams).
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
