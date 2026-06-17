// Risk metrics: Value-at-Risk (parametric / historical / Monte Carlo),
// Conditional VaR (Expected Shortfall), max drawdown, EWMA & rolling vol,
// and tracking error.
//
// VaR/CVaR are reported as POSITIVE loss magnitudes at the given confidence
// (e.g. confidence 0.95 → the 5% left-tail loss).

import {
  inverseNormalCDF,
  mean,
  std,
  percentile,
  makeNormalSampler,
  seededRand,
} from "./stats";
import type { VaRResult } from "./types";

// Parametric (variance-covariance) VaR on a normal P&L assumption.
//   VaR = value · (−μ·h + σ·√h · z_{1−c}),  z from the inverse normal.
// `mu`/`sigma` are per-period; `horizon` scales them (√-time for vol).
export function parametricVaR(
  value: number,
  mu: number,
  sigma: number,
  horizon: number,
  confidence: number,
): VaRResult {
  const z = inverseNormalCDF(confidence); // e.g. 1.645 at 95%
  const driftH = mu * horizon;
  const volH = sigma * Math.sqrt(horizon);
  const varFrac = -driftH + z * volH;
  // CVaR (ES) for a normal: σ·φ(z)/(1−c) − μ.
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const esFrac = -driftH + volH * (phi / (1 - confidence));
  return {
    var: Math.max(0, value * varFrac),
    cvar: Math.max(0, value * esFrac),
    confidence,
  };
}

// Historical VaR/CVaR from a sample of period returns (decimal).
export function historicalVaR(
  value: number,
  returns: number[],
  confidence: number,
): VaRResult {
  // The (1−c) quantile of returns is the VaR threshold return (a loss → negative).
  const qReturn = percentile(returns, (1 - confidence) * 100);
  const varLoss = Math.max(0, -qReturn * value);
  // CVaR = mean of returns at or below the threshold.
  const tail = returns.filter((r) => r <= qReturn);
  const cvarReturn = tail.length > 0 ? mean(tail) : qReturn;
  return {
    var: varLoss,
    cvar: Math.max(0, -cvarReturn * value),
    confidence,
  };
}

// Monte Carlo VaR: simulate normal returns and apply the historical estimator.
export function monteCarloVaR(
  value: number,
  mu: number,
  sigma: number,
  horizon: number,
  confidence: number,
  nSims: number,
  seed: number,
): VaRResult {
  const sample = makeNormalSampler(seededRand(seed));
  const driftH = mu * horizon;
  const volH = sigma * Math.sqrt(horizon);
  const returns: number[] = [];
  for (let i = 0; i < nSims; i++) {
    returns.push(driftH + volH * sample());
  }
  return historicalVaR(value, returns, confidence);
}

// Maximum drawdown of an equity curve: the largest peak-to-trough decline.
export function maxDrawdown(equityCurve: number[]): {
  maxDD: number; // positive fraction (0.2 = −20%)
  peakIdx: number;
  troughIdx: number;
} {
  let peak = equityCurve[0] ?? 0;
  let peakIdx = 0;
  let maxDD = 0;
  let bestPeakIdx = 0;
  let bestTroughIdx = 0;
  for (let i = 0; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      peakIdx = i;
    }
    const dd = peak > 0 ? (peak - equityCurve[i]) / peak : 0;
    if (dd > maxDD) {
      maxDD = dd;
      bestPeakIdx = peakIdx;
      bestTroughIdx = i;
    }
  }
  return { maxDD, peakIdx: bestPeakIdx, troughIdx: bestTroughIdx };
}

// The underwater curve: drawdown from the running peak at each point (for the
// "underwater" risk chart). Values ≤ 0.
export function underwaterCurve(equityCurve: number[]): number[] {
  let peak = equityCurve[0] ?? 0;
  return equityCurve.map((v) => {
    if (v > peak) peak = v;
    return peak > 0 ? (v - peak) / peak : 0;
  });
}

// EWMA volatility (RiskMetrics): σ²_t = λ·σ²_{t−1} + (1−λ)·r²_{t−1}.
// Returns the per-period vol series aligned to `returns`.
export function ewmaVol(returns: number[], lambda = 0.94): number[] {
  if (returns.length === 0) return [];
  // Seed with the sample variance of the first chunk.
  const seedVar = returns.length > 1 ? variancePop(returns) : returns[0] ** 2;
  let v = seedVar;
  const out: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    v = lambda * v + (1 - lambda) * returns[i] * returns[i];
    out.push(Math.sqrt(v));
  }
  return out;
}

// Rolling (windowed) volatility.
export function rollingVol(returns: number[], window: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    if (i + 1 < window) {
      out.push(NaN);
      continue;
    }
    out.push(std(returns.slice(i + 1 - window, i + 1)));
  }
  return out;
}

// Tracking error = std of (portfolio − benchmark) return differences.
export function trackingError(
  portfolioReturns: number[],
  benchmarkReturns: number[],
): number {
  const diff = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
  return std(diff);
}

// Annualized Sharpe from a per-period return series.
export function sharpeRatio(
  returns: number[],
  rfPerPeriod = 0,
  periodsPerYear = 252,
): number {
  const excess = returns.map((r) => r - rfPerPeriod);
  const s = std(excess);
  // Guard a degenerate (effectively constant) series — floating-point dust
  // can leave std at ~1e-19, which would blow the ratio up to ~1e16.
  if (s < 1e-12) return 0;
  return (mean(excess) / s) * Math.sqrt(periodsPerYear);
}

// Sortino ratio: like Sharpe but penalizing only downside deviation.
export function sortinoRatio(
  returns: number[],
  rfPerPeriod = 0,
  periodsPerYear = 252,
): number {
  const excess = returns.map((r) => r - rfPerPeriod);
  const downside = excess.filter((r) => r < 0);
  if (downside.length === 0) return Infinity;
  const dd = Math.sqrt(
    downside.reduce((s, r) => s + r * r, 0) / downside.length,
  );
  if (dd === 0) return 0;
  return (mean(excess) / dd) * Math.sqrt(periodsPerYear);
}

// Population variance helper (EWMA seeding uses the biased estimator).
function variancePop(xs: number[]): number {
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / xs.length;
}
