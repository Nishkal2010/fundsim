// Signal builders and a long/flat strategy backtest harness.
//
// Signals map a price series to a position series in [−1, 1] (entered at the
// NEXT bar to avoid look-ahead bias). The backtester compounds strategy
// returns into an equity curve and reports Sharpe, max drawdown, and turnover.

import { mean, std } from "./stats";
import { maxDrawdown, sharpeRatio } from "./risk";
import type { BacktestResult } from "./types";

// Simple returns from a price series (length n−1).
export function returns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    out.push(prices[i] / prices[i - 1] - 1);
  }
  return out;
}

// Simple moving average (NaN until the window fills).
export function sma(series: number[], window: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i];
    if (i >= window) sum -= series[i - window];
    out.push(i >= window - 1 ? sum / window : NaN);
  }
  return out;
}

// Exponential moving average (seeded with the first value).
export function ema(series: number[], window: number): number[] {
  const k = 2 / (window + 1);
  const out: number[] = [];
  let prev = series[0] ?? NaN;
  for (let i = 0; i < series.length; i++) {
    prev = i === 0 ? series[0] : series[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

// Rolling z-score of price vs its own window mean/std (mean-reversion signal).
export function zScore(series: number[], window: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < series.length; i++) {
    if (i + 1 < window) {
      out.push(NaN);
      continue;
    }
    const win = series.slice(i + 1 - window, i + 1);
    const m = mean(win);
    const s = std(win);
    out.push(s > 0 ? (series[i] - m) / s : 0);
  }
  return out;
}

// ── Position strategies (return a target position for each bar) ──────────────

// Momentum: long when price > its SMA, flat otherwise.
export function momentumPositions(prices: number[], window: number): number[] {
  const avg = sma(prices, window);
  return prices.map((p, i) => (isNaN(avg[i]) ? 0 : p > avg[i] ? 1 : 0));
}

// Mean reversion: long when z-score < −threshold, short when > +threshold.
export function meanReversionPositions(
  prices: number[],
  window: number,
  threshold = 1,
): number[] {
  const z = zScore(prices, window);
  return z.map((v) => {
    if (isNaN(v)) return 0;
    if (v < -threshold) return 1;
    if (v > threshold) return -1;
    return 0;
  });
}

export function buyAndHoldPositions(prices: number[]): number[] {
  return prices.map(() => 1);
}

// Backtest a position series against a price series. Positions are applied with
// a one-bar lag (decide on bar i, earn on bar i+1) to avoid look-ahead.
// `cost` is the per-unit-turnover transaction cost (decimal).
export function backtest(
  prices: number[],
  positions: number[],
  cost = 0,
  periodsPerYear = 252,
): BacktestResult {
  const rets = returns(prices); // length n−1, rets[i] is return from i→i+1
  const equityCurve: number[] = [1];
  const benchmark: number[] = [1];
  let trades = 0;
  let prevPos = 0;
  const stratReturns: number[] = [];
  const usedPositions: number[] = [];

  for (let i = 0; i < rets.length; i++) {
    const pos = positions[i] ?? 0; // position decided at bar i
    const turnover = Math.abs(pos - prevPos);
    if (turnover > 0) trades++;
    const grossRet = pos * rets[i];
    const netRet = grossRet - turnover * cost;
    stratReturns.push(netRet);
    usedPositions.push(pos);
    equityCurve.push(equityCurve[equityCurve.length - 1] * (1 + netRet));
    benchmark.push(benchmark[benchmark.length - 1] * (1 + rets[i]));
    prevPos = pos;
  }

  const totalReturn = equityCurve[equityCurve.length - 1] - 1;
  return {
    equityCurve,
    benchmark,
    totalReturn,
    sharpe: sharpeRatio(stratReturns, 0, periodsPerYear),
    maxDrawdown: maxDrawdown(equityCurve).maxDD,
    trades,
    positions: usedPositions,
  };
}
