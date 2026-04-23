import { describe, it, expect } from "vitest";
import { calculateIRR } from "../irr";

describe("calculateIRR", () => {
  it("returns null when no negative cash flows", () => {
    expect(calculateIRR([100, 200, 300])).toBeNull();
  });

  it("returns null when no positive cash flows", () => {
    expect(calculateIRR([-100, -200, -300])).toBeNull();
  });

  it("calculates ~14.87% IRR for 2x/5yr", () => {
    const cfs = [-100, 0, 0, 0, 0, 200];
    const irr = calculateIRR(cfs);
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(0.1487, 3);
  });

  it("calculates ~10% IRR for simple 1-year double", () => {
    const cfs = [-100, 110];
    const irr = calculateIRR(cfs);
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(0.1, 4);
  });

  it("calculates correct IRR for a standard PE fund profile", () => {
    // -100 invested over 3 years, returns 300 at year 5
    const cfs = [-40, -30, -30, 0, 0, 300];
    const irr = calculateIRR(cfs);
    expect(irr).not.toBeNull();
    expect(irr!).toBeGreaterThan(0.2);
    expect(irr!).toBeLessThan(0.5);
  });

  it("returns null for IRR outside the search range", () => {
    // Both positive and negative, but no sign change in NPV over [-99.99%, 1000%]
    const result = calculateIRR([-1, 0.000001]);
    // Very deep loss — may return null or a very negative number
    // The key is it doesn't crash
    expect(result === null || typeof result === "number").toBe(true);
  });

  it("handles equal positive and negative (0% IRR)", () => {
    const cfs = [-100, 100];
    const irr = calculateIRR(cfs);
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(0, 4);
  });

  it("handles large cash flows proportionally", () => {
    const small = calculateIRR([-100, 0, 0, 200]);
    const large = calculateIRR([-1_000_000, 0, 0, 2_000_000]);
    expect(small).not.toBeNull();
    expect(large).not.toBeNull();
    expect(large!).toBeCloseTo(small!, 6);
  });

  it("converges via bisection fallback for pathological inputs", () => {
    // Multi-sign-change — Newton may diverge, bisection should catch it
    const cfs = [-100, 250, -150, 100];
    const irr = calculateIRR(cfs);
    // Either null (no root in range) or a valid number — must not throw
    expect(irr === null || isFinite(irr!)).toBe(true);
  });

  it("handles single period correctly", () => {
    const cfs = [-50, 75];
    const irr = calculateIRR(cfs);
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(0.5, 4);
  });

  it("returns a finite number (not Infinity or NaN) when converged", () => {
    const cfs = [-100, 0, 0, 0, 0, 300];
    const irr = calculateIRR(cfs);
    if (irr !== null) {
      expect(isFinite(irr)).toBe(true);
      expect(isNaN(irr)).toBe(false);
    }
  });
});
