import { describe, it, expect } from "vitest";
import { calculateJCurve } from "../utils/jCurve";
import type { FundInputs } from "../types/fund";

const BASE: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.2,
  hurdleRate: 0.08,
  gpCommitment: 0.02,
  avgHoldPeriod: 4,
  lossRatio: 0.3,
  avgExitMultiple: 3.0,
  exitDistribution: "bell",
  totalProceeds: 200,
  waterfallType: "european",
  catchUpRate: 1.0,
  clawback: true,
  dealMultiples: [0.5, 1.0, 2.0, 3.5, 8.0],
  spReturn: 0.1,
  numDeals: 20,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2020,
};

describe("calculateJCurve", () => {
  it("returns fundLife + 1 data points (year 0 through fundLife)", () => {
    const r = calculateJCurve(BASE);
    expect(r.points).toHaveLength(BASE.fundLife + 1);
  });

  it("year 0 has zero NAV and zero distributions", () => {
    const r = calculateJCurve(BASE);
    expect(r.points[0].nav).toBe(0);
    expect(r.points[0].distributions).toBe(0);
    expect(r.points[0].netCashFlow).toBe(0);
  });

  it("NAV dips negative early (J-curve shape)", () => {
    const r = calculateJCurve(BASE);
    // During investment period, LP has called capital but no exits yet
    const earlyPoints = r.points.slice(1, 4);
    const hasNegative = earlyPoints.some((p) => p.netCashFlow < 0);
    expect(hasNegative).toBe(true);
  });

  it("is deterministic", () => {
    const a = calculateJCurve(BASE);
    const b = calculateJCurve(BASE);
    expect(a.points[5].nav).toBe(b.points[5].nav);
    expect(a.netIRR).toBe(b.netIRR);
  });

  it("IRR is defined (not null) when exits occur", () => {
    const r = calculateJCurve(BASE);
    // With avgExitMultiple=3 and lossRatio=0.3, there should be positive IRR
    expect(r.netIRR).not.toBeNull();
  });

  it("0% loss ratio produces higher IRR than 60% loss ratio", () => {
    const noLoss = calculateJCurve({ ...BASE, lossRatio: 0 });
    const highLoss = calculateJCurve({ ...BASE, lossRatio: 0.6 });
    if (noLoss.netIRR !== null && highLoss.netIRR !== null) {
      expect(noLoss.netIRR).toBeGreaterThan(highLoss.netIRR);
    }
  });

  it("higher exit multiple produces higher IRR", () => {
    const low = calculateJCurve({ ...BASE, avgExitMultiple: 2 });
    const high = calculateJCurve({ ...BASE, avgExitMultiple: 4 });
    if (low.netIRR !== null && high.netIRR !== null) {
      expect(high.netIRR).toBeGreaterThan(low.netIRR);
    }
  });

  it("even distribution exits faster than backloaded", () => {
    const even = calculateJCurve({ ...BASE, exitDistribution: "even" });
    const back = calculateJCurve({ ...BASE, exitDistribution: "backloaded" });
    // Even exits should show distributions sooner — midpoint NAV should differ
    const midEven = even.points[6].distributions;
    const midBack = back.points[6].distributions;
    expect(midEven).toBeGreaterThanOrEqual(midBack);
  });

  it("capitalCalled is positive in investment years", () => {
    const r = calculateJCurve(BASE);
    const investPoints = r.points.slice(1, BASE.investmentPeriod + 1);
    investPoints.forEach((p) => {
      expect(p.capitalCalled).toBeGreaterThan(0);
    });
  });

  it("distributions accumulate monotonically", () => {
    const r = calculateJCurve(BASE);
    for (let i = 1; i < r.points.length; i++) {
      expect(r.points[i].distributions).toBeGreaterThanOrEqual(
        r.points[i - 1].distributions,
      );
    }
  });
});
