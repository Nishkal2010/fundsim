import { describe, it, expect } from "vitest";
import {
  normalPDF,
  normalCDF,
  inverseNormalCDF,
  seededRand,
  makeNormalSampler,
  mean,
  variance,
  std,
  covariance,
  correlation,
  percentile,
  cholesky,
  invertMatrix,
  matMul,
  matVec,
} from "../../quant/stats";

describe("normalCDF / normalPDF", () => {
  it("Φ(0) = 0.5", () => {
    expect(normalCDF(0)).toBeCloseTo(0.5, 6);
  });
  it("Φ(1.96) ≈ 0.975", () => {
    expect(normalCDF(1.96)).toBeCloseTo(0.975, 4);
  });
  it("Φ(-1.96) ≈ 0.025", () => {
    expect(normalCDF(-1.96)).toBeCloseTo(0.025, 4);
  });
  it("Φ is symmetric: Φ(x) + Φ(-x) = 1", () => {
    expect(normalCDF(0.7) + normalCDF(-0.7)).toBeCloseTo(1, 6);
  });
  it("pdf peak at 0 is 1/√(2π)", () => {
    expect(normalPDF(0)).toBeCloseTo(0.3989423, 6);
  });
});

describe("inverseNormalCDF", () => {
  it("Φ⁻¹(0.975) ≈ 1.95996", () => {
    expect(inverseNormalCDF(0.975)).toBeCloseTo(1.95996, 4);
  });
  it("Φ⁻¹(0.95) ≈ 1.64485 (the VaR multiplier)", () => {
    expect(inverseNormalCDF(0.95)).toBeCloseTo(1.64485, 4);
  });
  it("Φ⁻¹(0.5) = 0", () => {
    expect(inverseNormalCDF(0.5)).toBeCloseTo(0, 6);
  });
  it("round-trips with normalCDF", () => {
    for (const p of [0.01, 0.1, 0.3, 0.6, 0.9, 0.99]) {
      expect(normalCDF(inverseNormalCDF(p))).toBeCloseTo(p, 6);
    }
  });
});

describe("seededRand", () => {
  it("is deterministic for a given seed", () => {
    const a = seededRand(42);
    const b = seededRand(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });
  it("produces uniforms in [0,1)", () => {
    const r = seededRand(7);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe("makeNormalSampler (Box-Muller)", () => {
  it("has mean ≈ 0 and variance ≈ 1 over many draws", () => {
    const sample = makeNormalSampler(seededRand(123));
    const xs: number[] = [];
    for (let i = 0; i < 50000; i++) xs.push(sample());
    expect(mean(xs)).toBeCloseTo(0, 1);
    expect(variance(xs)).toBeCloseTo(1, 1);
  });
});

describe("moments", () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  it("mean", () => {
    expect(mean(xs)).toBeCloseTo(5, 6);
  });
  it("sample variance (n−1)", () => {
    // Population var of this classic set is 4; sample var = 4*8/7
    expect(variance(xs)).toBeCloseTo(32 / 7, 6);
  });
  it("std is √variance", () => {
    expect(std(xs)).toBeCloseTo(Math.sqrt(32 / 7), 6);
  });
});

describe("covariance / correlation", () => {
  it("perfectly correlated series → ρ = 1", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [2, 4, 6, 8, 10];
    expect(correlation(a, b)).toBeCloseTo(1, 6);
  });
  it("perfectly anti-correlated series → ρ = -1", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [10, 8, 6, 4, 2];
    expect(correlation(a, b)).toBeCloseTo(-1, 6);
  });
  it("covariance of a series with itself = its variance", () => {
    const a = [3, 1, 4, 1, 5, 9, 2, 6];
    expect(covariance(a, a)).toBeCloseTo(variance(a), 6);
  });
});

describe("percentile", () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it("median (p50)", () => {
    expect(percentile(xs, 50)).toBeCloseTo(5.5, 6);
  });
  it("min and max", () => {
    expect(percentile(xs, 0)).toBe(1);
    expect(percentile(xs, 100)).toBe(10);
  });
});

describe("cholesky", () => {
  it("reconstructs a 2×2 correlation matrix: L·Lᵀ = A", () => {
    const rho = 0.6;
    const A = [
      [1, rho],
      [rho, 1],
    ];
    const L = cholesky(A);
    const recon = matMul(L, [
      [L[0][0], L[1][0]],
      [L[0][1], L[1][1]],
    ]);
    expect(recon[0][0]).toBeCloseTo(1, 6);
    expect(recon[0][1]).toBeCloseTo(rho, 6);
    expect(recon[1][0]).toBeCloseTo(rho, 6);
    expect(recon[1][1]).toBeCloseTo(1, 6);
  });
  it("is lower-triangular", () => {
    const L = cholesky([
      [4, 2],
      [2, 3],
    ]);
    expect(L[0][1]).toBe(0);
    expect(L[0][0]).toBeCloseTo(2, 6);
  });
});

describe("invertMatrix", () => {
  it("A · A⁻¹ = I for a 2×2", () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    const inv = invertMatrix(A);
    const I = matMul(A, inv);
    expect(I[0][0]).toBeCloseTo(1, 6);
    expect(I[0][1]).toBeCloseTo(0, 6);
    expect(I[1][0]).toBeCloseTo(0, 6);
    expect(I[1][1]).toBeCloseTo(1, 6);
  });
  it("throws on a singular matrix", () => {
    expect(() =>
      invertMatrix([
        [1, 2],
        [2, 4],
      ]),
    ).toThrow();
  });
});

describe("matVec", () => {
  it("multiplies matrix by vector", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    expect(matVec(A, [1, 1])).toEqual([3, 7]);
  });
});
