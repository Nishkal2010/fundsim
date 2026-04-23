import { describe, it, expect } from "vitest";
import { calculateJCurve } from "../jCurve";
import type { FundInputs } from "../../types/fund";

const baseInputs: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.2,
  hurdleRate: 0.08,
  gpCommitment: 0.02,
  avgHoldPeriod: 5,
  lossRatio: 0.3,
  avgExitMultiple: 3.0,
  exitDistribution: "bell",
  totalProceeds: 200,
  waterfallType: "european",
  catchUpRate: 1.0,
  clawback: true,
  dealMultiples: [2, 3, 4, 1.5, 2.5],
  spReturn: 0.1,
  numDeals: 20,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2024,
};

describe("calculateJCurve", () => {
  it("returns fundLife + 1 data points (year 0 through fundLife)", () => {
    const result = calculateJCurve(baseInputs);
    expect(result.points).toHaveLength(baseInputs.fundLife + 1);
  });

  it("starts at zero at year 0", () => {
    const result = calculateJCurve(baseInputs);
    const year0 = result.points[0];
    expect(year0.netCashFlow).toBe(0);
    expect(year0.nav).toBe(0);
    expect(year0.distributions).toBe(0);
    expect(year0.capitalCalled).toBe(0);
  });

  it("trough is negative (the J-curve dip)", () => {
    const result = calculateJCurve(baseInputs);
    expect(result.troughValue).toBeLessThan(0);
  });

  it("trough occurs during early years", () => {
    const result = calculateJCurve(baseInputs);
    expect(result.troughYear).toBeGreaterThanOrEqual(1);
    expect(result.troughYear).toBeLessThanOrEqual(
      baseInputs.investmentPeriod + 2,
    );
  });

  it("finalNetMultiple > 1 for profitable fund", () => {
    const result = calculateJCurve(baseInputs);
    expect(result.finalNetMultiple).toBeGreaterThan(1);
  });

  it("netIRR is positive for profitable fund", () => {
    const result = calculateJCurve(baseInputs);
    expect(result.netIRR).not.toBeNull();
    expect(result.netIRR!).toBeGreaterThan(0);
  });

  it("breakeven year is after the trough", () => {
    const result = calculateJCurve(baseInputs);
    if (result.breakevenYear !== null) {
      expect(result.breakevenYear).toBeGreaterThan(result.troughYear);
    }
  });

  it("high loss ratio reduces finalNetMultiple", () => {
    const lowLoss = calculateJCurve({ ...baseInputs, lossRatio: 0.1 });
    const highLoss = calculateJCurve({ ...baseInputs, lossRatio: 0.5 });
    expect(lowLoss.finalNetMultiple).toBeGreaterThan(highLoss.finalNetMultiple);
  });

  it("higher exit multiple improves IRR", () => {
    const low = calculateJCurve({ ...baseInputs, avgExitMultiple: 2.0 });
    const high = calculateJCurve({ ...baseInputs, avgExitMultiple: 4.0 });
    if (low.netIRR !== null && high.netIRR !== null) {
      expect(high.netIRR).toBeGreaterThan(low.netIRR);
    }
  });

  it("cumulative distributions are non-decreasing", () => {
    const result = calculateJCurve(baseInputs);
    for (let i = 1; i < result.points.length; i++) {
      expect(result.points[i].distributions).toBeGreaterThanOrEqual(
        result.points[i - 1].distributions,
      );
    }
  });

  it("cumulative capitalCalled is non-decreasing", () => {
    const result = calculateJCurve(baseInputs);
    for (let i = 1; i < result.points.length; i++) {
      expect(result.points[i].capitalCalled).toBeGreaterThanOrEqual(
        result.points[i - 1].capitalCalled,
      );
    }
  });

  it("even exit distribution produces a breakeven year", () => {
    const result = calculateJCurve({ ...baseInputs, exitDistribution: "even" });
    expect(result.breakevenYear).not.toBeNull();
  });
});
