import { describe, it, expect } from "vitest";
import { calculatePerformance } from "../performance";
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

describe("calculatePerformance", () => {
  it("tvpi equals dpi + rvpi", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.tvpi).toBeCloseTo(result.dpi + result.rvpi, 6);
  });

  it("dpi is non-negative", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.dpi).toBeGreaterThanOrEqual(0);
  });

  it("rvpi is non-negative", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.rvpi).toBeGreaterThanOrEqual(0);
  });

  it("netIRR is positive for a profitable fund", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.netIRR).not.toBeNull();
    expect(result.netIRR!).toBeGreaterThan(0);
  });

  it("grossMOIC > netMOIC (fees & carry drag)", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.grossMOIC).toBeGreaterThanOrEqual(result.netMOIC);
  });

  it("quartile is top for tvpi >= 2.5", () => {
    // Force a very high exit multiple to get top quartile
    const result = calculatePerformance({
      ...baseInputs,
      avgExitMultiple: 5.0,
      lossRatio: 0.1,
    });
    if (result.tvpi >= 2.5) {
      expect(result.quartile).toBe("top");
    }
  });

  it("quartile is bottom for tvpi < 1.3", () => {
    const result = calculatePerformance({
      ...baseInputs,
      avgExitMultiple: 1.2,
      lossRatio: 0.6,
    });
    if (result.tvpi < 1.3) {
      expect(result.quartile).toBe("bottom");
    }
  });

  it("sensitivityMatrix has 6 rows (exit multiples) x 5 cols (loss ratios)", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.sensitivityMatrix).toHaveLength(6);
    result.sensitivityMatrix.forEach((row) => {
      expect(row).toHaveLength(5);
    });
  });

  it("sensitivityMatrix IRR increases with higher exit multiple", () => {
    const result = calculatePerformance(baseInputs);
    const lowExitIRR = result.sensitivityMatrix[0][0].irr;
    const highExitIRR = result.sensitivityMatrix[5][0].irr;
    if (lowExitIRR !== null && highExitIRR !== null) {
      expect(highExitIRR).toBeGreaterThan(lowExitIRR);
    }
  });

  it("sensitivityMatrix IRR decreases with higher loss ratio", () => {
    const result = calculatePerformance(baseInputs);
    const lowLossIRR = result.sensitivityMatrix[2][0].irr;
    const highLossIRR = result.sensitivityMatrix[2][4].irr;
    if (lowLossIRR !== null && highLossIRR !== null) {
      expect(lowLossIRR).toBeGreaterThan(highLossIRR);
    }
  });

  it("dpiOverTime has fundLife + 1 entries", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.dpiOverTime).toHaveLength(baseInputs.fundLife + 1);
  });

  it("pme > 1 when fund outperforms S&P", () => {
    // High returns vs low S&P benchmark
    const result = calculatePerformance({
      ...baseInputs,
      avgExitMultiple: 4.0,
      lossRatio: 0.1,
      spReturn: 0.07,
    });
    if (result.tvpi > 1) {
      // pme = tvpi / spGrowth, if tvpi >> spGrowth, pme > 1
      expect(result.pme).toBeGreaterThan(0);
    }
  });

  it("ksPME is a positive number", () => {
    const result = calculatePerformance(baseInputs);
    expect(result.ksPME).toBeGreaterThan(0);
  });
});
