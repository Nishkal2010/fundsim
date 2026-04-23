import { describe, it, expect } from "vitest";
import { calculateLifecycle } from "../fundLifecycle";
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

describe("calculateLifecycle", () => {
  it("returns the correct number of yearly data points", () => {
    const result = calculateLifecycle(baseInputs);
    expect(result.years).toHaveLength(baseInputs.fundLife);
  });

  it("totalMgmtFees equals fundSize minus netInvestableCapital", () => {
    const result = calculateLifecycle(baseInputs);
    expect(result.totalMgmtFees + result.netInvestableCapital).toBeCloseTo(
      baseInputs.fundSize,
      4,
    );
  });

  it("capitalEfficiency is netInvestableCapital / fundSize", () => {
    const result = calculateLifecycle(baseInputs);
    expect(result.capitalEfficiency).toBeCloseTo(
      result.netInvestableCapital / baseInputs.fundSize,
      6,
    );
  });

  it("management fee is 2% of fundSize during investment period", () => {
    const result = calculateLifecycle(baseInputs);
    for (let i = 0; i < baseInputs.investmentPeriod; i++) {
      expect(result.years[i].mgmtFee).toBeCloseTo(
        baseInputs.fundSize * baseInputs.managementFee,
        4,
      );
    }
  });

  it("harvest period fees decline (step-down)", () => {
    const result = calculateLifecycle(baseInputs);
    const harvestFees = result.years
      .slice(baseInputs.investmentPeriod)
      .map((y) => y.mgmtFee);
    for (let i = 1; i < harvestFees.length; i++) {
      expect(harvestFees[i]).toBeLessThanOrEqual(harvestFees[i - 1]);
    }
  });

  it("no capital deployed in harvest period", () => {
    const result = calculateLifecycle(baseInputs);
    const harvestYears = result.years.slice(baseInputs.investmentPeriod);
    harvestYears.forEach((y) => {
      expect(y.capitalDeployed).toBe(0);
    });
  });

  it("cumulative deployed equals netInvestableCapital at end of investment period", () => {
    const result = calculateLifecycle(baseInputs);
    const lastInvestYear = result.years[baseInputs.investmentPeriod - 1];
    expect(lastInvestYear.cumulativeDeployed).toBeCloseTo(
      result.netInvestableCapital,
      2,
    );
  });

  it("netInvestableCapital is less than fundSize", () => {
    const result = calculateLifecycle(baseInputs);
    expect(result.netInvestableCapital).toBeLessThan(baseInputs.fundSize);
  });

  it("works with zero harvest period (investmentPeriod === fundLife)", () => {
    const inputs = { ...baseInputs, investmentPeriod: 10 };
    const result = calculateLifecycle(inputs);
    expect(result.years).toHaveLength(10);
    expect(result.netInvestableCapital).toBeGreaterThan(0);
  });

  it("capitalEfficiency improves with lower management fee", () => {
    const highFee = calculateLifecycle({ ...baseInputs, managementFee: 0.025 });
    const lowFee = calculateLifecycle({ ...baseInputs, managementFee: 0.015 });
    expect(lowFee.capitalEfficiency).toBeGreaterThan(highFee.capitalEfficiency);
  });
});
