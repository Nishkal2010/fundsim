import { describe, it, expect } from "vitest";
import { calculatePortfolio } from "../utils/portfolio";
import type { FundInputs } from "../types/fund";

const BASE_INPUTS: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.2,
  hurdleRate: 0.08,
  gpCommitment: 0.02,
  avgHoldPeriod: 5,
  lossRatio: 0.3,
  avgExitMultiple: 3,
  exitDistribution: "bell",
  totalProceeds: 300,
  waterfallType: "european",
  catchUpRate: 1,
  clawback: true,
  dealMultiples: [2, 2.5, 3, 4, 5],
  spReturn: 0.1,
  numDeals: 20,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2015,
};

describe("calculatePortfolio", () => {
  it("returns the correct number of companies", () => {
    const { companies } = calculatePortfolio(BASE_INPUTS);
    expect(companies).toHaveLength(BASE_INPUTS.numDeals);
  });

  it("is deterministic — same inputs produce identical results", () => {
    const a = calculatePortfolio(BASE_INPUTS);
    const b = calculatePortfolio(BASE_INPUTS);
    expect(a.grossMOIC).toBe(b.grossMOIC);
    expect(a.companies[0].currentMOIC).toBe(b.companies[0].currentMOIC);
  });

  it("different inputs produce different results", () => {
    const a = calculatePortfolio(BASE_INPUTS);
    const b = calculatePortfolio({ ...BASE_INPUTS, lossRatio: 0.5 });
    expect(a.grossMOIC).not.toBe(b.grossMOIC);
  });

  it("TVPI = DPI + RVPI", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    expect(r.tvpi).toBeCloseTo(r.dpi + r.rvpi, 10);
  });

  it("grossMOIC = totalValue / totalInvested", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const totalValue = r.totalCurrentValue + r.totalRealizedValue;
    expect(r.grossMOIC).toBeCloseTo(totalValue / r.totalInvested, 10);
  });

  it("concentrationTop3Pct is between 0 and 1", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    expect(r.concentrationTop3Pct).toBeGreaterThanOrEqual(0);
    expect(r.concentrationTop3Pct).toBeLessThanOrEqual(1);
  });

  it("moicBuckets counts sum to numDeals", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const total = r.moicBuckets.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(BASE_INPUTS.numDeals);
  });

  it("sectorBreakdown covers all companies", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const sectorTotal = r.sectorBreakdown.reduce((s, b) => s + b.invested, 0);
    expect(sectorTotal).toBeCloseTo(r.totalInvested, 1);
  });

  it("reserveCapital is correct fraction of deployable capital", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const deployable = BASE_INPUTS.fundSize * (1 - BASE_INPUTS.gpCommitment);
    const expected = deployable * BASE_INPUTS.followOnReservePercent;
    expect(r.reserveCapital).toBeCloseTo(expected, 5);
  });

  it("all companies have valid status values", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const valid = new Set([
      "realized",
      "unrealized",
      "written-off",
      "partial-exit",
    ]);
    r.companies.forEach((c) => {
      expect(valid.has(c.status)).toBe(true);
    });
  });

  it("written-off companies have near-zero MOIC (< 0.25)", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    const writtenOff = r.companies.filter((c) => c.status === "written-off");
    writtenOff.forEach((c) => {
      expect(c.currentMOIC).toBeLessThan(0.25);
    });
  });

  it("all companies have non-negative invested capital", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    r.companies.forEach((c) => {
      expect(c.totalInvested).toBeGreaterThan(0);
      expect(c.followOnCapital).toBeGreaterThanOrEqual(0);
    });
  });

  it("investYear is within investmentPeriod for all companies", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    r.companies.forEach((c) => {
      expect(c.investYear).toBeGreaterThanOrEqual(1);
      expect(c.investYear).toBeLessThanOrEqual(BASE_INPUTS.investmentPeriod);
    });
  });

  it("venture strategy produces correct stages", () => {
    const r = calculatePortfolio({ ...BASE_INPUTS, fundStrategy: "venture" });
    const stages = new Set(r.companies.map((c) => c.stage));
    // venture funds should have seed/early/growth stages
    expect(
      stages.has("seed") || stages.has("early") || stages.has("growth"),
    ).toBe(true);
  });

  it("growth strategy produces growth stage", () => {
    const r = calculatePortfolio({ ...BASE_INPUTS, fundStrategy: "growth" });
    r.companies.forEach((c) => expect(c.stage).toBe("growth"));
  });

  it("buyout strategy produces buyout stage", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    r.companies.forEach((c) => expect(c.stage).toBe("buyout"));
  });

  it("0% loss ratio has no written-off companies", () => {
    const r = calculatePortfolio({ ...BASE_INPUTS, lossRatio: 0 });
    const writtenOff = r.companies.filter((c) => c.status === "written-off");
    expect(writtenOff).toHaveLength(0);
  });

  it("higher lossRatio reduces grossMOIC", () => {
    const low = calculatePortfolio({ ...BASE_INPUTS, lossRatio: 0.1 });
    const high = calculatePortfolio({ ...BASE_INPUTS, lossRatio: 0.6 });
    expect(low.grossMOIC).toBeGreaterThan(high.grossMOIC);
  });

  it("higher avgExitMultiple increases grossMOIC", () => {
    const low = calculatePortfolio({ ...BASE_INPUTS, avgExitMultiple: 2 });
    const high = calculatePortfolio({ ...BASE_INPUTS, avgExitMultiple: 5 });
    expect(high.grossMOIC).toBeGreaterThan(low.grossMOIC);
  });

  it("numDeals: 1 — returns a single company with valid metrics", () => {
    const r = calculatePortfolio({ ...BASE_INPUTS, numDeals: 1 });
    expect(r.companies).toHaveLength(1);
    expect(r.totalInvested).toBeGreaterThan(0);
  });

  it("DPI and RVPI are non-negative", () => {
    const r = calculatePortfolio(BASE_INPUTS);
    expect(r.dpi).toBeGreaterThanOrEqual(0);
    expect(r.rvpi).toBeGreaterThanOrEqual(0);
  });
});
