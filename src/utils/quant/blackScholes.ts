// Black-Scholes-Merton option pricing, Greeks, implied vol, and a binomial
// tree for American exercise. Continuous dividend yield q is supported.
//
// Conventions:
//   • All rates/vols are annual decimals; T is in years.
//   • vega is reported per 1.00 (i.e. per 100%) change in σ; theta per year;
//     rho per 1.00 change in r. The UI divides as needed (vega/100, theta/365).

import { normalCDF, normalPDF } from "./stats";
import { gbmPath } from "./stochastic";
import { makeNormalSampler, seededRand } from "./stats";
import type { OptionType, GreekSet, BsmResult } from "./types";

function d1d2(
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  q: number,
): [number, number] {
  const vsqrt = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / vsqrt;
  const d2 = d1 - vsqrt;
  return [d1, d2];
}

// Black-Scholes-Merton price for a European call or put.
// Golden: call S=K=100, r=0.05, σ=0.20, T=1, q=0 → 10.4506; put → 5.5735.
export function bsmPrice(
  type: OptionType,
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  q = 0,
): number {
  // Degenerate cases: zero time or zero vol collapse to discounted intrinsic.
  if (T <= 0 || sigma <= 0) {
    const fwd = S * Math.exp(-q * T) - K * Math.exp(-r * T);
    return type === "call" ? Math.max(0, fwd) : Math.max(0, -fwd);
  }
  const [d1, d2] = d1d2(S, K, r, sigma, T, q);
  const df = Math.exp(-r * T);
  const dq = Math.exp(-q * T);
  if (type === "call") {
    return S * dq * normalCDF(d1) - K * df * normalCDF(d2);
  }
  return K * df * normalCDF(-d2) - S * dq * normalCDF(-d1);
}

// Analytic Greeks. delta/gamma dimensionless; vega per unit σ; theta per year;
// rho per unit r.
export function greeks(
  type: OptionType,
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  q = 0,
): GreekSet {
  const [d1, d2] = d1d2(S, K, r, sigma, T, q);
  const df = Math.exp(-r * T);
  const dq = Math.exp(-q * T);
  const pdf = normalPDF(d1);
  const sqrtT = Math.sqrt(T);

  const gamma = (dq * pdf) / (S * sigma * sqrtT);
  const vega = S * dq * pdf * sqrtT;

  let delta: number;
  let theta: number;
  let rho: number;
  if (type === "call") {
    delta = dq * normalCDF(d1);
    theta =
      -(S * dq * pdf * sigma) / (2 * sqrtT) -
      r * K * df * normalCDF(d2) +
      q * S * dq * normalCDF(d1);
    rho = K * T * df * normalCDF(d2);
  } else {
    delta = -dq * normalCDF(-d1);
    theta =
      -(S * dq * pdf * sigma) / (2 * sqrtT) +
      r * K * df * normalCDF(-d2) -
      q * S * dq * normalCDF(-d1);
    rho = -K * T * df * normalCDF(-d2);
  }
  return { delta, gamma, vega, theta, rho };
}

export function bsm(
  type: OptionType,
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  q = 0,
): BsmResult {
  const [d1, d2] = d1d2(S, K, r, sigma, T, q);
  return {
    price: bsmPrice(type, S, K, r, sigma, T, q),
    d1,
    d2,
    greeks: greeks(type, S, K, r, sigma, T, q),
  };
}

// Implied volatility: invert bsmPrice for σ. Newton-Raphson on vega with a
// bisection fallback — mirrors the solver discipline in irr.ts. Returns null
// when the target price violates no-arbitrage bounds.
export function impliedVol(
  price: number,
  type: OptionType,
  S: number,
  K: number,
  r: number,
  T: number,
  q = 0,
): number | null {
  const df = Math.exp(-r * T);
  const dq = Math.exp(-q * T);
  // No-arbitrage bounds.
  const lower =
    type === "call"
      ? Math.max(0, S * dq - K * df)
      : Math.max(0, K * df - S * dq);
  const upper = type === "call" ? S * dq : K * df;
  if (price < lower - 1e-9 || price > upper + 1e-9) return null;

  let sigma = 0.2;
  for (let i = 0; i < 100; i++) {
    const p = bsmPrice(type, S, K, r, sigma, T, q);
    const v = greeks(type, S, K, r, sigma, T, q).vega;
    const diff = p - price;
    if (Math.abs(diff) < 1e-8) return sigma;
    if (v < 1e-10) break; // vega vanished — switch to bisection
    sigma = sigma - diff / v;
    if (sigma <= 0 || sigma > 10) break;
  }

  // Bisection over a wide vol range.
  let lo = 1e-6;
  let hi = 10;
  const fLo = bsmPrice(type, S, K, r, lo, T, q) - price;
  const fHi = bsmPrice(type, S, K, r, hi, T, q) - price;
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = bsmPrice(type, S, K, r, mid, T, q) - price;
    if (Math.abs(fMid) < 1e-8 || hi - lo < 1e-10) return mid;
    if (fLo * fMid < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

// Cox-Ross-Rubinstein binomial tree. `american` allows early exercise.
// The European limit converges to bsmPrice as steps → ∞.
export function binomialTree(
  type: OptionType,
  american: boolean,
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  steps: number,
  q = 0,
): number {
  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const disc = Math.exp(-r * dt);
  const p = (Math.exp((r - q) * dt) - d) / (u - d);

  // Terminal payoffs.
  const values: number[] = new Array(steps + 1);
  for (let i = 0; i <= steps; i++) {
    const ST = S * Math.pow(u, steps - i) * Math.pow(d, i);
    values[i] = type === "call" ? Math.max(0, ST - K) : Math.max(0, K - ST);
  }
  // Backward induction.
  for (let step = steps - 1; step >= 0; step--) {
    for (let i = 0; i <= step; i++) {
      values[i] = disc * (p * values[i] + (1 - p) * values[i + 1]);
      if (american) {
        const ST = S * Math.pow(u, step - i) * Math.pow(d, i);
        const intrinsic =
          type === "call" ? Math.max(0, ST - K) : Math.max(0, K - ST);
        if (intrinsic > values[i]) values[i] = intrinsic;
      }
    }
  }
  return values[0];
}

// Monte Carlo price for path-dependent European payoffs. `payoff` receives the
// full simulated path and returns the (undiscounted) terminal payoff.
export function mcOptionPrice(
  payoff: (path: number[]) => number,
  S: number,
  r: number,
  sigma: number,
  T: number,
  steps: number,
  nPaths: number,
  seed: number,
  q = 0,
): { price: number; stdError: number } {
  const sample = makeNormalSampler(seededRand(seed));
  const df = Math.exp(-r * T);
  // Risk-neutral drift is (r − q).
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < nPaths; i++) {
    const path = gbmPath(S, r - q, sigma, T, steps, sample);
    const pv = df * payoff(path);
    sum += pv;
    sumSq += pv * pv;
  }
  const mean = sum / nPaths;
  const v = nPaths > 1 ? (sumSq - nPaths * mean * mean) / (nPaths - 1) : 0;
  return { price: mean, stdError: Math.sqrt(Math.max(0, v) / nPaths) };
}

// Common path-dependent payoffs.
export const asianCallPayoff =
  (K: number) =>
  (path: number[]): number => {
    const avg = path.reduce((s, x) => s + x, 0) / path.length;
    return Math.max(0, avg - K);
  };

export const europeanCallPayoff =
  (K: number) =>
  (path: number[]): number =>
    Math.max(0, path[path.length - 1] - K);
