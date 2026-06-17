import { describe, it, expect } from "vitest";
import {
  bondPrice,
  yieldToMaturity,
  macaulayDuration,
  modifiedDuration,
  convexity,
} from "../../quant/fixedIncome";
import {
  returns,
  sma,
  zScore,
  buyAndHoldPositions,
  momentumPositions,
  backtest,
} from "../../quant/backtest";

describe("bondPrice", () => {
  it("par bond (coupon = ytm) prices to face", () => {
    expect(bondPrice(1000, 0.05, 0.05, 10, 2)).toBeCloseTo(1000, 6);
  });
  it("discount bond (ytm > coupon) prices below face", () => {
    expect(bondPrice(1000, 0.05, 0.08, 10, 2)).toBeLessThan(1000);
  });
  it("premium bond (ytm < coupon) prices above face", () => {
    expect(bondPrice(1000, 0.08, 0.05, 10, 2)).toBeGreaterThan(1000);
  });
  it("zero-coupon = face / (1+y)^n", () => {
    const p = bondPrice(1000, 0, 0.06, 5, 1);
    expect(p).toBeCloseTo(1000 / Math.pow(1.06, 5), 6);
  });
});

describe("yieldToMaturity", () => {
  it("inverts bondPrice (round-trip)", () => {
    const price = bondPrice(1000, 0.06, 0.045, 8, 2);
    expect(yieldToMaturity(price, 1000, 0.06, 8, 2)).toBeCloseTo(0.045, 6);
  });
  it("par bond yields its coupon rate", () => {
    expect(yieldToMaturity(1000, 1000, 0.05, 10, 2)).toBeCloseTo(0.05, 6);
  });
});

describe("duration & convexity", () => {
  it("Macaulay duration of a zero = its maturity", () => {
    expect(macaulayDuration(1000, 0, 0.05, 7, 1)).toBeCloseTo(7, 6);
  });
  it("Macaulay duration of a coupon bond < its maturity", () => {
    expect(macaulayDuration(1000, 0.06, 0.06, 10, 2)).toBeLessThan(10);
  });
  it("modified duration = Macaulay / (1 + y/freq)", () => {
    const mac = macaulayDuration(1000, 0.06, 0.06, 10, 2);
    expect(modifiedDuration(1000, 0.06, 0.06, 10, 2)).toBeCloseTo(
      mac / 1.03,
      6,
    );
  });
  it("convexity is positive", () => {
    expect(convexity(1000, 0.06, 0.06, 10, 2)).toBeGreaterThan(0);
  });
});

describe("signal builders", () => {
  it("returns computes simple returns", () => {
    const r = returns([100, 110, 99]);
    expect(r[0]).toBeCloseTo(0.1, 6);
    expect(r[1]).toBeCloseTo(-0.1, 6);
  });
  it("SMA averages the window", () => {
    const s = sma([1, 2, 3, 4, 5], 3);
    expect(s[2]).toBeCloseTo(2, 6);
    expect(s[4]).toBeCloseTo(4, 6);
    expect(Number.isNaN(s[0])).toBe(true);
  });
  it("z-score of a flat series is 0", () => {
    const z = zScore([5, 5, 5, 5, 5], 3);
    expect(z[4]).toBe(0);
  });
});

describe("backtest harness", () => {
  // A deterministic up-trending price series.
  const prices = Array.from({ length: 60 }, (_, i) => 100 * Math.pow(1.01, i));

  it("buy-and-hold reproduces the underlying total return", () => {
    const r = backtest(prices, buyAndHoldPositions(prices));
    const underlying = prices[prices.length - 1] / prices[0] - 1;
    expect(r.totalReturn).toBeCloseTo(underlying, 6);
    expect(r.benchmark[r.benchmark.length - 1]).toBeCloseTo(
      prices[prices.length - 1] / prices[0],
      6,
    );
  });

  it("flat position (no exposure) yields zero return", () => {
    const r = backtest(prices, new Array(prices.length).fill(0));
    expect(r.totalReturn).toBeCloseTo(0, 9);
    expect(r.trades).toBe(0);
  });

  it("transaction costs reduce returns and count trades", () => {
    const pos = momentumPositions(prices, 5);
    const free = backtest(prices, pos, 0);
    const costly = backtest(prices, pos, 0.01);
    expect(costly.totalReturn).toBeLessThanOrEqual(free.totalReturn);
    expect(free.trades).toBeGreaterThan(0);
  });

  it("equity curve starts at 1 and has length = prices", () => {
    const r = backtest(prices, buyAndHoldPositions(prices));
    expect(r.equityCurve[0]).toBe(1);
    expect(r.equityCurve).toHaveLength(prices.length);
  });
});
