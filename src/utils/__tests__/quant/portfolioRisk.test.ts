import { describe, it, expect } from "vitest";
import {
  covFromCorr,
  portfolioStats,
  minVariancePortfolio,
  tangencyPortfolio,
  efficientFrontier,
  maxSharpePoint,
  capmBeta,
  kellyFraction,
  kellyBinary,
} from "../../quant/portfolioTheory";
import {
  parametricVaR,
  historicalVaR,
  maxDrawdown,
  underwaterCurve,
  ewmaVol,
  sharpeRatio,
  trackingError,
} from "../../quant/risk";

describe("portfolio stats", () => {
  it("two uncorrelated equal-weight assets: vol = σ/√2 diversification", () => {
    const cov = covFromCorr(
      [0.2, 0.2],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const stats = portfolioStats([0.5, 0.5], [0.1, 0.1], cov);
    expect(stats.vol).toBeCloseTo(0.2 / Math.sqrt(2), 6);
    expect(stats.ret).toBeCloseTo(0.1, 6);
  });
  it("perfectly correlated assets: no diversification (vol = weighted avg)", () => {
    const cov = covFromCorr(
      [0.2, 0.3],
      [
        [1, 1],
        [1, 1],
      ],
    );
    const stats = portfolioStats([0.5, 0.5], [0.1, 0.12], cov);
    expect(stats.vol).toBeCloseTo(0.25, 6);
  });
});

describe("minVariancePortfolio", () => {
  it("equal vols + zero correlation → equal weights", () => {
    const cov = covFromCorr(
      [0.2, 0.2],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const w = minVariancePortfolio(cov);
    expect(w[0]).toBeCloseTo(0.5, 6);
    expect(w[1]).toBeCloseTo(0.5, 6);
  });
  it("tilts toward the lower-vol asset", () => {
    const cov = covFromCorr(
      [0.1, 0.4],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const w = minVariancePortfolio(cov);
    expect(w[0]).toBeGreaterThan(w[1]);
    expect(w[0] + w[1]).toBeCloseTo(1, 6);
  });
});

describe("tangencyPortfolio", () => {
  it("weights sum to 1 when a positive-Sharpe portfolio exists", () => {
    const cov = covFromCorr(
      [0.2, 0.25],
      [
        [1, 0.2],
        [0.2, 1],
      ],
    );
    const w = tangencyPortfolio([0.12, 0.1], cov, 0.03);
    expect(w).not.toBeNull();
    expect(w![0] + w![1]).toBeCloseTo(1, 6);
  });
  it("returns null when every excess return is negative (degenerate)", () => {
    const cov = covFromCorr(
      [0.2, 0.25],
      [
        [1, 0.2],
        [0.2, 1],
      ],
    );
    // rf above both expected returns → no positive-Sharpe combination.
    expect(tangencyPortfolio([0.02, 0.01], cov, 0.05)).toBeNull();
  });
});

describe("efficientFrontier", () => {
  it("2-asset frontier max-Sharpe ≥ either single asset's Sharpe", () => {
    const cov = covFromCorr(
      [0.18, 0.28],
      [
        [1, 0.1],
        [0.1, 1],
      ],
    );
    const f = efficientFrontier([0.1, 0.15], cov, 0.02);
    const best = maxSharpePoint(f);
    const a0 = (0.1 - 0.02) / 0.18;
    const a1 = (0.15 - 0.02) / 0.28;
    expect(best.sharpe).toBeGreaterThanOrEqual(Math.max(a0, a1) - 1e-9);
  });
  it("N-asset frontier is vol-sorted and non-empty", () => {
    const cov = covFromCorr(
      [0.2, 0.25, 0.3],
      [
        [1, 0.2, 0.1],
        [0.2, 1, 0.3],
        [0.1, 0.3, 1],
      ],
    );
    const f = efficientFrontier([0.1, 0.12, 0.15], cov, 0.02, 5000);
    expect(f.length).toBeGreaterThan(1);
    for (let i = 1; i < f.length; i++)
      expect(f[i].vol).toBeGreaterThanOrEqual(f[i - 1].vol);
  });
});

describe("CAPM & Kelly", () => {
  it("β of an asset that is 2× the market = 2", () => {
    const market = [0.01, -0.02, 0.03, -0.01, 0.02];
    const asset = market.map((r) => 2 * r);
    expect(capmBeta(asset, market)).toBeCloseTo(2, 6);
  });
  it("continuous Kelly f* = (μ−r)/σ²", () => {
    expect(kellyFraction(0.1, 0.02, 0.2)).toBeCloseTo(0.08 / 0.04, 6);
  });
  it("binary Kelly for a 60/40 even-money bet = 0.2", () => {
    expect(kellyBinary(0.6, 1)).toBeCloseTo(0.2, 6);
  });
});

describe("parametricVaR", () => {
  it("uses the 1.645 multiplier at 95% (zero drift)", () => {
    const r = parametricVaR(1_000_000, 0, 0.02, 1, 0.95);
    // VaR ≈ value · 1.645 · 0.02
    expect(r.var).toBeCloseTo(1_000_000 * 1.64485 * 0.02, 0);
  });
  it("CVaR ≥ VaR (expected shortfall is deeper in the tail)", () => {
    const r = parametricVaR(1_000_000, 0, 0.02, 1, 0.95);
    expect(r.cvar).toBeGreaterThan(r.var);
  });
});

describe("historicalVaR", () => {
  it("identifies the left-tail loss", () => {
    const returns = [-0.1, -0.05, -0.02, 0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06];
    const r = historicalVaR(1000, returns, 0.9);
    expect(r.var).toBeGreaterThan(0);
    expect(r.cvar).toBeGreaterThanOrEqual(r.var);
  });
});

describe("maxDrawdown & underwater", () => {
  it("computes a clean 50% drawdown", () => {
    const eq = [100, 120, 60, 80, 150];
    const { maxDD } = maxDrawdown(eq);
    expect(maxDD).toBeCloseTo(0.5, 6); // 120 → 60
  });
  it("underwater curve is ≤ 0 and 0 at new highs", () => {
    const uw = underwaterCurve([100, 90, 110, 100]);
    expect(uw[0]).toBe(0);
    expect(uw[1]).toBeLessThan(0);
    expect(uw[2]).toBe(0);
  });
});

describe("ewmaVol & sharpe", () => {
  it("EWMA vol is positive and same length as input", () => {
    const rets = [0.01, -0.02, 0.015, -0.01, 0.005];
    const v = ewmaVol(rets, 0.94);
    expect(v).toHaveLength(rets.length);
    expect(v.every((x) => x >= 0)).toBe(true);
  });
  it("annualized Sharpe of a constant positive return is large/undefined-safe", () => {
    const rets = new Array(252).fill(0.001);
    expect(sharpeRatio(rets)).toBe(0); // zero variance → guarded to 0
  });
  it("tracking error of identical series is 0", () => {
    const a = [0.01, 0.02, -0.01];
    expect(trackingError(a, a)).toBeCloseTo(0, 9);
  });
});
