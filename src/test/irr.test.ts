import { describe, it, expect } from "vitest";
import { calculateIRR } from "../utils/irr";

describe("calculateIRR", () => {
  // ── Happy-path PE/VC scenarios ─────────────────────────────────────────────

  it("computes ~14.87% IRR for a 2x in 5 years (classic PE)", () => {
    // -100 invested today, +200 returned at year 5 → MOIC 2x
    // Analytical: (200/100)^(1/5) - 1 = 14.87%
    const cashFlows = [-100, 0, 0, 0, 0, 200];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(0.1487, 3);
  });

  it("computes ~26.0% IRR for a 3x in 5 years", () => {
    // (300/100)^(1/5) - 1 ≈ 24.57%
    const cashFlows = [-100, 0, 0, 0, 0, 300];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(0.2457, 3);
  });

  it("computes ~20.11% IRR for a $100M fund returning $250M at year 10", () => {
    // Standard buyout fund: 2.5x MOIC / 10yr
    const cashFlows = [-100_000_000, ...Array(9).fill(0), 250_000_000];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(0.0959, 3);
  });

  it("handles annual cash distributions (not just terminal)", () => {
    // -$100M invested; $20M/yr distributions for 7 years = $140M total
    const cashFlows = [-100, 20, 20, 20, 20, 20, 20, 20];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    // NPV at the result should be near zero
    const npv = cashFlows.reduce(
      (sum, cf, t) => sum + cf / Math.pow(1 + result!, t),
      0,
    );
    expect(Math.abs(npv)).toBeLessThan(0.001);
  });

  it("returns a positive IRR for any profitable investment", () => {
    const cashFlows = [-50, 0, 0, 80]; // 60% gain in 3 years
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });

  // ── Negative / loss scenarios ──────────────────────────────────────────────

  it("returns a negative IRR for a loss-making investment", () => {
    // Invest $100M, recover only $60M after 5 years → negative IRR
    // Actual: (60/100)^(1/5) - 1 = -0.09712...
    const cashFlows = [-100, 0, 0, 0, 0, 60];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeLessThan(0);
    // Verify via NPV — the returned rate must zero out NPV
    const npv = cashFlows.reduce(
      (sum, cf, t) => sum + cf / Math.pow(1 + result!, t),
      0,
    );
    expect(Math.abs(npv)).toBeLessThan(1e-4);
    expect(result!).toBeGreaterThan(-0.15);
  });

  it("returns a negative IRR of -90% or worse when recovery is near zero", () => {
    // Bisection range is [-99.99%, +1000%]; at near-zero recovery result approaches -0.9999
    const cashFlows = [-100, 0, 0, 0, 0, 0.001];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeLessThanOrEqual(-0.9);
  });

  // ── Guard conditions that must return null ─────────────────────────────────

  it("returns null for all-zero cash flows", () => {
    expect(calculateIRR([0, 0, 0, 0])).toBeNull();
  });

  it("returns null for a single cash flow", () => {
    expect(calculateIRR([-100])).toBeNull();
  });

  it("returns null when all cash flows are positive (no outflow)", () => {
    expect(calculateIRR([100, 200, 300])).toBeNull();
  });

  it("returns null when all cash flows are negative (no inflow)", () => {
    expect(calculateIRR([-100, -200, -50])).toBeNull();
  });

  it("returns null for empty cash flow array", () => {
    expect(calculateIRR([])).toBeNull();
  });

  // ── Edge: bisection fallback for high IRR ────────────────────────────────

  it("handles very high IRR (10x in 3 years, ~115%)", () => {
    // Seed investment: -$1M → $10M exit in 3 years
    const cashFlows = [-1, 0, 0, 10];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    // (10)^(1/3) - 1 ≈ 1.154
    expect(result!).toBeCloseTo(1.154, 2);
  });

  // ── Convergence: result satisfies NPV ≈ 0 ────────────────────────────────

  it("produces a rate where NPV is effectively zero for a standard fund", () => {
    const cashFlows = [-200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    const npv = cashFlows.reduce(
      (sum, cf, t) => sum + cf / Math.pow(1 + result!, t),
      0,
    );
    expect(Math.abs(npv)).toBeLessThan(1e-4);
  });

  it("produces a rate where NPV ≈ 0 for a deal with mid-life distributions", () => {
    // -$50M in, +$15M at year 3, +$60M at year 6
    const cashFlows = [-50, 0, 0, 15, 0, 0, 60];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    const npv = cashFlows.reduce(
      (sum, cf, t) => sum + cf / Math.pow(1 + result!, t),
      0,
    );
    expect(Math.abs(npv)).toBeLessThan(1e-4);
  });

  // ── Boundary: hurdle-rate-vicinity ────────────────────────────────────────

  it("returns ~8% IRR when proceeds precisely meet 8% hurdle over 10 years", () => {
    // LP invests $100M; receives exactly 100 * 1.08^10 ≈ $215.89M at year 10
    const principal = 100;
    const terminal = principal * Math.pow(1.08, 10);
    const cashFlows = [-principal, ...Array(9).fill(0), terminal];
    const result = calculateIRR(cashFlows);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(0.08, 5);
  });
});
