import { describe, it, expect } from "vitest";
import { calculateWaterfall } from "../waterfall";
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
  // Need >313M to clear ROC (100) + LP pref (113M at 8%/10yr) + GP pref and reach carry tiers
  totalProceeds: 500,
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

describe("calculateWaterfall (European)", () => {
  it("returns 4 tiers", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.tiers).toHaveLength(4);
  });

  it("total LP + GP equals totalProceeds", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.totalLP + result.totalGP).toBeCloseTo(
      baseInputs.totalProceeds,
      2,
    );
  });

  it("effective carry percentage is close to nominal carry (20%)", () => {
    const result = calculateWaterfall(baseInputs);
    // Allow small floating point tolerance
    expect(result.effectiveCarryPct).toBeCloseTo(0.2, 1);
  });

  it("LP gets back at least their capital (ROC tier)", () => {
    const result = calculateWaterfall(baseInputs);
    const lpCapital = baseInputs.fundSize * (1 - baseInputs.gpCommitment);
    expect(result.tiers[0].lpAmount).toBeCloseTo(lpCapital, 2);
  });

  it("GP gets back their capital (ROC tier)", () => {
    const result = calculateWaterfall(baseInputs);
    const gpCapital = baseInputs.fundSize * baseInputs.gpCommitment;
    expect(result.tiers[0].gpAmount).toBeCloseTo(gpCapital, 2);
  });

  it("lpNetMultiple > 1 when profitable", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.lpNetMultiple).toBeGreaterThan(1);
  });

  it("gpNetMultiple > lpNetMultiple (carry leverage)", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.gpNetMultiple).toBeGreaterThan(result.lpNetMultiple);
  });

  it("totalCapitalCalled equals fundSize", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.totalCapitalCalled).toBeCloseTo(baseInputs.fundSize, 4);
  });

  it("no carry earned when proceeds barely cover capital (below hurdle)", () => {
    // Below total capital — only ROC tier pays out, no carry
    const result = calculateWaterfall({ ...baseInputs, totalProceeds: 95 });
    expect(result.gpCarry).toBeCloseTo(0, 1);
  });

  it("with insufficient proceeds GP earns no carry", () => {
    // At 150M proceeds, 8% hurdle over 10yr consumes all profits before carry
    const result = calculateWaterfall({ ...baseInputs, totalProceeds: 150 });
    expect(result.gpCarry).toBeCloseTo(0, 1);
    // tiers count may be fewer when proceeds are exhausted early
    expect(result.tiers.length).toBeGreaterThanOrEqual(1);
  });

  it("lpIRR is a number when fund is profitable", () => {
    const result = calculateWaterfall(baseInputs);
    expect(result.lpIRR).not.toBeNull();
    expect(result.lpIRR!).toBeGreaterThan(0);
  });
});

describe("calculateWaterfall (American)", () => {
  const americanInputs = { ...baseInputs, waterfallType: "american" as const };

  it("returns 4 tiers", () => {
    const result = calculateWaterfall(americanInputs);
    expect(result.tiers).toHaveLength(4);
  });

  it("total LP + GP approximately equals sum of deal proceeds", () => {
    const result = calculateWaterfall(americanInputs);
    const numDeals = americanInputs.dealMultiples.length;
    const capitalPerDeal = (americanInputs.fundSize * 0.85) / numDeals;
    const totalProceeds = americanInputs.dealMultiples.reduce(
      (sum, m) => sum + capitalPerDeal * m,
      0,
    );
    expect(result.totalLP + result.totalGP).toBeCloseTo(totalProceeds, 1);
  });

  it("losing deals contribute no GP carry", () => {
    // All deals at 0.5x (below capital return)
    const result = calculateWaterfall({
      ...americanInputs,
      dealMultiples: [0.5, 0.5, 0.5, 0.5, 0.5],
    });
    expect(result.gpCarry).toBeCloseTo(0, 2);
  });

  it("high multiple deals generate positive GP carry", () => {
    const result = calculateWaterfall({
      ...americanInputs,
      dealMultiples: [5, 5, 5, 5, 5],
    });
    expect(result.gpCarry).toBeGreaterThan(0);
  });
});
