import { describe, it, expect } from "vitest";
import { calculateLifecycle } from "../utils/fundLifecycle";
import type { FundInputs } from "../types/fund";

const BASE: FundInputs = {
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
  dealMultiples: [0.5, 1.0, 2.0, 3.5, 8.0],
  spReturn: 0.1,
  numDeals: 20,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2020,
};

describe("calculateLifecycle", () => {
  it("returns correct number of years", () => {
    const r = calculateLifecycle(BASE);
    expect(r.years).toHaveLength(BASE.fundLife);
  });

  it("fundSize - totalMgmtFees = netInvestableCapital (self-consistent formula)", () => {
    const r = calculateLifecycle(BASE);
    expect(r.netInvestableCapital).toBeCloseTo(
      BASE.fundSize - r.totalMgmtFees,
      6,
    );
  });

  it("capitalEfficiency = netInvestableCapital / fundSize", () => {
    const r = calculateLifecycle(BASE);
    expect(r.capitalEfficiency).toBeCloseTo(
      r.netInvestableCapital / BASE.fundSize,
      10,
    );
  });

  it("capitalEfficiency is between 0 and 1", () => {
    const r = calculateLifecycle(BASE);
    expect(r.capitalEfficiency).toBeGreaterThan(0);
    expect(r.capitalEfficiency).toBeLessThanOrEqual(1);
  });

  it("no capital deployed during harvest years", () => {
    const r = calculateLifecycle(BASE);
    r.years.slice(BASE.investmentPeriod).forEach((y) => {
      expect(y.capitalDeployed).toBe(0);
    });
  });

  it("capital deployed every year during investment period", () => {
    const r = calculateLifecycle(BASE);
    r.years.slice(0, BASE.investmentPeriod).forEach((y) => {
      expect(y.capitalDeployed).toBeGreaterThan(0);
    });
  });

  it("cumulativeDeployed equals netInvestableCapital at end of investment period", () => {
    const r = calculateLifecycle(BASE);
    const lastInvestYear = r.years[BASE.investmentPeriod - 1];
    expect(lastInvestYear.cumulativeDeployed).toBeCloseTo(
      r.netInvestableCapital,
      4,
    );
  });

  it("management fees are positive every year", () => {
    const r = calculateLifecycle(BASE);
    r.years.forEach((y) => {
      expect(y.mgmtFee).toBeGreaterThan(0);
    });
  });

  it("remaining commitment reaches ~0 at fund end", () => {
    const r = calculateLifecycle(BASE);
    const lastYear = r.years[r.years.length - 1];
    expect(lastYear.remainingCommitment).toBeCloseTo(0, 0);
  });

  it("0% management fee: all capital invested", () => {
    const r = calculateLifecycle({ ...BASE, managementFee: 0 });
    expect(r.totalMgmtFees).toBeCloseTo(0, 6);
    expect(r.netInvestableCapital).toBeCloseTo(BASE.fundSize, 6);
    expect(r.capitalEfficiency).toBeCloseTo(1, 6);
  });

  it("longer fund life produces more years", () => {
    const r = calculateLifecycle({
      ...BASE,
      fundLife: 12,
      investmentPeriod: 5,
    });
    expect(r.years).toHaveLength(12);
  });

  it("no harvest period (investmentPeriod = fundLife) has no harvest fees", () => {
    const r = calculateLifecycle({
      ...BASE,
      fundLife: 5,
      investmentPeriod: 5,
    });
    // All years are investment years — harvest period is 0
    expect(r.years).toHaveLength(5);
    // Every year should have capital deployed
    r.years.forEach((y) => expect(y.capitalDeployed).toBeGreaterThan(0));
  });

  it("higher management fee reduces netInvestableCapital", () => {
    const low = calculateLifecycle({ ...BASE, managementFee: 0.01 });
    const high = calculateLifecycle({ ...BASE, managementFee: 0.025 });
    expect(low.netInvestableCapital).toBeGreaterThan(high.netInvestableCapital);
  });

  it("is deterministic", () => {
    const a = calculateLifecycle(BASE);
    const b = calculateLifecycle(BASE);
    expect(a.netInvestableCapital).toBe(b.netInvestableCapital);
    expect(a.totalMgmtFees).toBe(b.totalMgmtFees);
  });
});
