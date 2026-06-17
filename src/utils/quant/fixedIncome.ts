// Fixed-income analytics: bond pricing, yield-to-maturity, Macaulay & modified
// duration, and convexity. A quant-interview staple.
//
// Conventions: `face` is redemption value; `couponRate` and `ytm` are annual
// decimals; `freq` is coupons per year; `years` is time to maturity. Internally
// we work in periods (n = years·freq) with per-period rate y = ytm/freq.

import type { BondResult } from "./types";

// Present value of a coupon bond. With couponRate == ytm the price equals face.
export function bondPrice(
  face: number,
  couponRate: number,
  ytm: number,
  years: number,
  freq = 2,
): number {
  const n = Math.round(years * freq);
  const c = (couponRate * face) / freq; // coupon per period
  const y = ytm / freq;
  let pv = 0;
  for (let t = 1; t <= n; t++) {
    pv += c / Math.pow(1 + y, t);
  }
  pv += face / Math.pow(1 + y, n);
  return pv;
}

// Yield to maturity by bisection on price (monotone decreasing in y), mirroring
// the root-finder discipline in irr.ts. Returns annualized ytm.
export function yieldToMaturity(
  price: number,
  face: number,
  couponRate: number,
  years: number,
  freq = 2,
): number | null {
  let lo = -0.99; // allow deeply discounted / distressed
  let hi = 2.0; // 200% upper bound
  const f = (y: number) => bondPrice(face, couponRate, y, years, freq) - price;
  const fLo = f(lo);
  const fHi = f(hi);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-9 || hi - lo < 1e-12) return mid;
    if (fLo * fMid < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

// Macaulay duration: PV-weighted average time (in years) to cash flows.
export function macaulayDuration(
  face: number,
  couponRate: number,
  ytm: number,
  years: number,
  freq = 2,
): number {
  const n = Math.round(years * freq);
  const c = (couponRate * face) / freq;
  const y = ytm / freq;
  let weightedTime = 0;
  let price = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + face : c;
    const pv = cf / Math.pow(1 + y, t);
    weightedTime += (t / freq) * pv; // time in years
    price += pv;
  }
  return price > 0 ? weightedTime / price : 0;
}

// Modified duration = Macaulay / (1 + y/freq). Price sensitivity to yield.
export function modifiedDuration(
  face: number,
  couponRate: number,
  ytm: number,
  years: number,
  freq = 2,
): number {
  return (
    macaulayDuration(face, couponRate, ytm, years, freq) / (1 + ytm / freq)
  );
}

// Convexity: second-order price/yield sensitivity (in years²).
export function convexity(
  face: number,
  couponRate: number,
  ytm: number,
  years: number,
  freq = 2,
): number {
  const n = Math.round(years * freq);
  const c = (couponRate * face) / freq;
  const y = ytm / freq;
  let conv = 0;
  let price = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + face : c;
    const pv = cf / Math.pow(1 + y, t);
    conv += (t * (t + 1) * pv) / Math.pow(1 + y, 2);
    price += pv;
  }
  // Scale period² → year² by dividing by freq².
  return price > 0 ? conv / price / (freq * freq) : 0;
}

export function analyzeBond(
  face: number,
  couponRate: number,
  ytm: number,
  years: number,
  freq = 2,
): BondResult {
  return {
    price: bondPrice(face, couponRate, ytm, years, freq),
    macaulayDuration: macaulayDuration(face, couponRate, ytm, years, freq),
    modifiedDuration: modifiedDuration(face, couponRate, ytm, years, freq),
    convexity: convexity(face, couponRate, ytm, years, freq),
  };
}

// Estimated price change from a yield shock using the duration+convexity
// approximation: ΔP/P ≈ −D_mod·Δy + ½·C·Δy².
export function priceChangeEstimate(
  modDuration: number,
  conv: number,
  deltaYield: number,
): number {
  return -modDuration * deltaYield + 0.5 * conv * deltaYield * deltaYield;
}
