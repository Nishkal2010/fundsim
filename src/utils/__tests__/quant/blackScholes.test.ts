import { describe, it, expect } from "vitest";
import {
  bsmPrice,
  greeks,
  impliedVol,
  binomialTree,
  mcOptionPrice,
  europeanCallPayoff,
  asianCallPayoff,
} from "../../quant/blackScholes";
import { normalCDF } from "../../quant/stats";

const S = 100,
  K = 100,
  r = 0.05,
  sigma = 0.2,
  T = 1;

describe("bsmPrice — textbook golden values", () => {
  it("ATM call = 10.4506", () => {
    expect(bsmPrice("call", S, K, r, sigma, T)).toBeCloseTo(10.4506, 4);
  });
  it("ATM put = 5.5735", () => {
    expect(bsmPrice("put", S, K, r, sigma, T)).toBeCloseTo(5.5735, 4);
  });
  it("satisfies put-call parity: C − P = S·e^{−qT} − K·e^{−rT}", () => {
    const q = 0.03;
    const c = bsmPrice("call", S, K, r, sigma, T, q);
    const p = bsmPrice("put", S, K, r, sigma, T, q);
    expect(c - p).toBeCloseTo(S * Math.exp(-q * T) - K * Math.exp(-r * T), 8);
  });
  it("deep ITM call ≈ discounted intrinsic forward", () => {
    const price = bsmPrice("call", 200, 100, r, sigma, T);
    expect(price).toBeGreaterThan(200 - 100 * Math.exp(-r * T) - 0.5);
  });
  it("zero vol collapses to discounted intrinsic", () => {
    expect(bsmPrice("call", 110, 100, r, 0, T)).toBeCloseTo(
      110 - 100 * Math.exp(-r * T),
      6,
    );
  });
});

describe("greeks", () => {
  it("ATM call delta ≈ Φ(d1)", () => {
    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));
    expect(greeks("call", S, K, r, sigma, T).delta).toBeCloseTo(
      normalCDF(d1),
      6,
    );
  });
  it("call delta − put delta = e^{−qT} (parity on delta)", () => {
    const q = 0.02;
    const cd = greeks("call", S, K, r, sigma, T, q).delta;
    const pd = greeks("put", S, K, r, sigma, T, q).delta;
    expect(cd - pd).toBeCloseTo(Math.exp(-q * T), 6);
  });
  it("gamma and vega are identical for call and put", () => {
    const c = greeks("call", S, K, r, sigma, T);
    const p = greeks("put", S, K, r, sigma, T);
    expect(c.gamma).toBeCloseTo(p.gamma, 8);
    expect(c.vega).toBeCloseTo(p.vega, 8);
  });
  it("vega matches a finite-difference bump", () => {
    const h = 1e-4;
    const fd =
      (bsmPrice("call", S, K, r, sigma + h, T) -
        bsmPrice("call", S, K, r, sigma - h, T)) /
      (2 * h);
    expect(greeks("call", S, K, r, sigma, T).vega).toBeCloseTo(fd, 2);
  });
});

describe("impliedVol", () => {
  it("round-trips: price at σ=0.2 then recover 0.2", () => {
    const price = bsmPrice("call", S, K, r, 0.2, T);
    expect(impliedVol(price, "call", S, K, r, T)).toBeCloseTo(0.2, 6);
  });
  it("recovers a high vol", () => {
    const price = bsmPrice("put", S, K, r, 0.85, T);
    expect(impliedVol(price, "put", S, K, r, T)).toBeCloseTo(0.85, 5);
  });
  it("returns null for an arbitrage-violating price", () => {
    expect(impliedVol(200, "call", S, K, r, T)).toBeNull();
  });
});

describe("binomialTree", () => {
  it("European limit converges to BSM", () => {
    expect(binomialTree("call", false, S, K, r, sigma, T, 1500)).toBeCloseTo(
      bsmPrice("call", S, K, r, sigma, T),
      2,
    );
  });
  it("American put ≥ European put (early-exercise premium)", () => {
    const amer = binomialTree("put", true, 90, 100, 0.08, 0.3, 1, 800);
    const euro = binomialTree("put", false, 90, 100, 0.08, 0.3, 1, 800);
    expect(amer).toBeGreaterThanOrEqual(euro);
  });
  it("American call without dividends equals European call", () => {
    const amer = binomialTree("call", true, S, K, r, sigma, T, 800);
    const euro = binomialTree("call", false, S, K, r, sigma, T, 800);
    expect(amer).toBeCloseTo(euro, 4);
  });
});

describe("mcOptionPrice", () => {
  it("European call MC converges to BSM within ~3 std errors", () => {
    const bsm = bsmPrice("call", S, K, r, sigma, T);
    const { price, stdError } = mcOptionPrice(
      europeanCallPayoff(K),
      S,
      r,
      sigma,
      T,
      1,
      60000,
      2024,
    );
    expect(Math.abs(price - bsm)).toBeLessThan(3 * stdError + 0.05);
  });
  it("Asian call is cheaper than the vanilla European call", () => {
    const asian = mcOptionPrice(
      asianCallPayoff(K),
      S,
      r,
      sigma,
      T,
      50,
      40000,
      7,
    ).price;
    const euro = bsmPrice("call", S, K, r, sigma, T);
    expect(asian).toBeLessThan(euro);
  });
});
