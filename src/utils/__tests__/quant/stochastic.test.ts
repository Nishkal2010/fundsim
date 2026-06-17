import { describe, it, expect } from "vitest";
import {
  gbmPath,
  ouPath,
  correlatedGbmPaths,
  simulateGbmStats,
} from "../../quant/stochastic";
import {
  makeNormalSampler,
  seededRand,
  mean,
  correlation,
} from "../../quant/stats";

describe("gbmPath", () => {
  it("with σ=0 is deterministic: S(T) = S0·exp(μT)", () => {
    const sample = makeNormalSampler(seededRand(1));
    const path = gbmPath(100, 0.1, 0, 1, 252, sample);
    expect(path[0]).toBe(100);
    expect(path[252]).toBeCloseTo(100 * Math.exp(0.1), 6);
  });

  it("is reproducible for a fixed seed", () => {
    const a = gbmPath(100, 0.05, 0.2, 1, 50, makeNormalSampler(seededRand(99)));
    const b = gbmPath(100, 0.05, 0.2, 1, 50, makeNormalSampler(seededRand(99)));
    expect(a).toEqual(b);
  });

  it("mean of log-returns matches risk-neutral drift over many paths", () => {
    const sample = makeNormalSampler(seededRand(2024));
    const T = 1;
    const mu = 0.08;
    const sigma = 0.25;
    const terminals: number[] = [];
    for (let i = 0; i < 20000; i++) {
      const p = gbmPath(100, mu, sigma, T, 1, sample);
      terminals.push(Math.log(p[1] / 100));
    }
    // E[ln(S_T/S_0)] = (μ − σ²/2)·T
    expect(mean(terminals)).toBeCloseTo((mu - 0.5 * sigma * sigma) * T, 2);
  });
});

describe("ouPath", () => {
  it("reverts toward θ from a distant start", () => {
    const sample = makeNormalSampler(seededRand(7));
    // Strong mean reversion, low noise → ends near θ.
    const path = ouPath(50, 5, 10, 0.5, 5, 500, sample);
    expect(path[path.length - 1]).toBeCloseTo(10, 0);
  });
});

describe("correlatedGbmPaths", () => {
  it("recovers the target correlation in log-returns", () => {
    const sample = makeNormalSampler(seededRand(555));
    const rho = 0.7;
    const corr = [
      [1, rho],
      [rho, 1],
    ];
    // Many 1-step paths; collect log returns of each asset.
    const r0: number[] = [];
    const r1: number[] = [];
    for (let i = 0; i < 8000; i++) {
      const paths = correlatedGbmPaths(
        [100, 100],
        [0.05, 0.05],
        [0.2, 0.2],
        corr,
        1 / 252,
        1,
        sample,
      );
      r0.push(Math.log(paths[0][1] / 100));
      r1.push(Math.log(paths[1][1] / 100));
    }
    expect(correlation(r0, r1)).toBeCloseTo(rho, 1);
  });
});

describe("simulateGbmStats", () => {
  it("produces ordered percentile bands and a full terminal distribution", () => {
    const stats = simulateGbmStats(100, 0.07, 0.2, 1, 50, 2000, 42, 10);
    expect(stats.times).toHaveLength(51);
    expect(stats.terminal).toHaveLength(2000);
    expect(stats.paths).toHaveLength(10);
    // Bands must be monotonically ordered at the terminal step.
    const last = stats.times.length - 1;
    expect(stats.bands.p5[last]).toBeLessThanOrEqual(stats.bands.p25[last]);
    expect(stats.bands.p25[last]).toBeLessThanOrEqual(stats.bands.p50[last]);
    expect(stats.bands.p50[last]).toBeLessThanOrEqual(stats.bands.p75[last]);
    expect(stats.bands.p75[last]).toBeLessThanOrEqual(stats.bands.p95[last]);
    // All paths start at S0.
    expect(stats.bands.p50[0]).toBeCloseTo(100, 6);
  });
});
