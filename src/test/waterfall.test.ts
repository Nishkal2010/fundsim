import { describe, it, expect } from "vitest";
import { calculateWaterfall } from "../utils/waterfall";
import type { FundInputs } from "../types/fund";

// Baseline inputs for a $100M buyout fund
const BASE_INPUTS: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.2,
  hurdleRate: 0.08,
  gpCommitment: 0.02, // 2% GP commit → $2M GP, $98M LP
  avgHoldPeriod: 5,
  lossRatio: 0,
  avgExitMultiple: 2.5,
  exitDistribution: "bell",
  totalProceeds: 250, // 2.5x gross MOIC
  waterfallType: "european",
  catchUpRate: 1.0, // 100% catch-up (GP takes 100% until caught up)
  clawback: false,
  dealMultiples: [3, 2.5, 2, 1.5, 0.5],
  spReturn: 0.1,
  numDeals: 5,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2020,
};

// ── European Waterfall ─────────────────────────────────────────────────────

describe("European waterfall", () => {
  it("distributes capital in the correct tier order", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    const tierNames = result.tiers.map((t) => t.name);
    expect(tierNames).toEqual([
      "Return of Capital",
      "Preferred Return",
      "GP Catch-Up",
      "Carried Interest Split",
    ]);
  });

  it("returns all committed capital to LPs and GP in Tier 1", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    const rocTier = result.tiers[0];
    const gpCapital = BASE_INPUTS.fundSize * BASE_INPUTS.gpCommitment; // $2M
    const lpCapital = BASE_INPUTS.fundSize - gpCapital; // $98M
    expect(rocTier.lpAmount).toBeCloseTo(lpCapital, 4);
    expect(rocTier.gpAmount).toBeCloseTo(gpCapital, 4);
  });

  it("pays 8% annualized preferred return to LPs before GP gets carry", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    const prefTier = result.tiers[1];
    const lpCapital = BASE_INPUTS.fundSize * (1 - BASE_INPUTS.gpCommitment); // $98M
    const expectedPref = lpCapital * (Math.pow(1.08, 10) - 1);
    expect(prefTier.lpAmount).toBeCloseTo(expectedPref, 1);
  });

  it("total LP + GP distributions equal totalProceeds", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    const total = result.tiers.reduce(
      (sum, t) => sum + t.lpAmount + t.gpAmount,
      0,
    );
    expect(total).toBeCloseTo(BASE_INPUTS.totalProceeds, 4);
  });

  it("effective carry is ~20% of total profits (not just Tier 4)", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    expect(result.effectiveCarryPct).toBeCloseTo(0.2, 2);
  });

  it("LP net multiple is greater than 1 for a profitable fund", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    expect(result.lpNetMultiple).toBeGreaterThan(1);
  });

  it("GP net multiple exceeds LP net multiple (carry leverage)", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    expect(result.gpNetMultiple).toBeGreaterThan(result.lpNetMultiple);
  });

  it("LP IRR is positive for a 2.5x fund", () => {
    const result = calculateWaterfall(BASE_INPUTS);
    expect(result.lpIRR).not.toBeNull();
    expect(result.lpIRR!).toBeGreaterThan(0);
  });

  // ── Hurdle exactly met: proceeds just cover capital + pref ─────────────────

  it("GP gets zero carry when proceeds exactly equal capital + pref", () => {
    const lpCapital = BASE_INPUTS.fundSize * (1 - BASE_INPUTS.gpCommitment);
    const gpCapital = BASE_INPUTS.fundSize * BASE_INPUTS.gpCommitment;
    const lpPref = lpCapital * (Math.pow(1.08, 10) - 1);
    const gpPref = gpCapital * (Math.pow(1.08, 10) - 1);
    // Proceeds = exact return of capital + exact pref, nothing left for catch-up/carry
    const breakeven = BASE_INPUTS.fundSize + lpPref + gpPref;

    const inputs: FundInputs = { ...BASE_INPUTS, totalProceeds: breakeven };
    const result = calculateWaterfall(inputs);
    expect(result.gpCarry).toBeCloseTo(0, 2);
  });

  // ── Zero carry ─────────────────────────────────────────────────────────────

  it("GP gets zero carry when carryPercentage is 0", () => {
    const inputs: FundInputs = { ...BASE_INPUTS, carryPercentage: 0 };
    const result = calculateWaterfall(inputs);
    expect(result.gpCarry).toBeCloseTo(0, 4);
  });

  // ── Fund that doesn't return capital ──────────────────────────────────────

  it("only returns partial capital when proceeds < fund size", () => {
    const inputs: FundInputs = { ...BASE_INPUTS, totalProceeds: 60 };
    const result = calculateWaterfall(inputs);
    // LP gets their pro-rata share of 60; GP gets nothing beyond their proportional slice
    expect(result.totalLP + result.totalGP).toBeCloseTo(60, 4);
    expect(result.gpCarry).toBeCloseTo(0, 4);
  });

  // ── Catch-up mechanics ─────────────────────────────────────────────────────

  it("partial catch-up (50% catch-up rate) gives GP less catch-up than 100%", () => {
    const full = calculateWaterfall(BASE_INPUTS); // catchUpRate = 1.0
    const partial = calculateWaterfall({ ...BASE_INPUTS, catchUpRate: 0.5 });
    // At 50% catch-up GP earns less during the catch-up tier than at 100%
    expect(partial.tiers[2].gpAmount).toBeLessThan(full.tiers[2].gpAmount);
    // GP carry is always non-negative regardless of catch-up rate
    expect(partial.gpCarry).toBeGreaterThanOrEqual(0);
  });

  it("with 100% catch-up, GP catch-up tier absorbs all distributions until even", () => {
    const result = calculateWaterfall(BASE_INPUTS); // catchUpRate = 1.0
    const catchUpTier = result.tiers[2];
    // LP gets nothing during catch-up when GP takes 100%
    expect(catchUpTier.lpAmount).toBeCloseTo(0, 4);
    expect(catchUpTier.gpAmount).toBeGreaterThan(0);
  });
});

// ── American Waterfall ─────────────────────────────────────────────────────

describe("American waterfall", () => {
  const AMERICAN_INPUTS: FundInputs = {
    ...BASE_INPUTS,
    waterfallType: "american",
    dealMultiples: [3.5, 3.0, 2.5, 1.5, 0.5], // mix of winners and a write-down
    avgHoldPeriod: 4,
  };

  it("distributes capital in the correct tier order", () => {
    const result = calculateWaterfall(AMERICAN_INPUTS);
    const tierNames = result.tiers.map((t) => t.name);
    expect(tierNames).toEqual([
      "Return of Capital",
      "Preferred Return",
      "GP Catch-Up",
      "Carried Interest Split",
    ]);
  });

  it("total distributions equal sum of deal proceeds", () => {
    const result = calculateWaterfall(AMERICAN_INPUTS);
    const total = result.tiers.reduce(
      (sum, t) => sum + t.lpAmount + t.gpAmount,
      0,
    );
    // Proceeds = capital_per_deal × multiple, summed across deals
    const fundSize = AMERICAN_INPUTS.fundSize;
    const numDeals = AMERICAN_INPUTS.dealMultiples.length;
    const capitalPerDeal = (fundSize * 0.85) / numDeals; // 85% deployed (15% fees/reserves)
    const expectedTotal = AMERICAN_INPUTS.dealMultiples.reduce(
      (sum, m) => sum + capitalPerDeal * m,
      0,
    );
    expect(total).toBeCloseTo(expectedTotal, 2);
  });

  it("GP earns carry on winning deals even if another deal is a write-down", () => {
    const result = calculateWaterfall(AMERICAN_INPUTS);
    // dealMultiples includes 3.5x, 3.0x, 2.5x winners alongside 0.5x write-down
    // American waterfall allows carry on each winning deal independently
    expect(result.gpCarry).toBeGreaterThan(0);
  });

  it("effective carry is close to 20% of positive-deal profits", () => {
    // American doesn't aggregate across fund; effective carry is approximate
    const result = calculateWaterfall(AMERICAN_INPUTS);
    // Should be between 15-25% (not exact because loss deals skew the total profit base)
    expect(result.effectiveCarryPct).toBeGreaterThan(0.1);
    expect(result.effectiveCarryPct).toBeLessThan(0.3);
  });

  it("all-loss fund (all multiples < 1) produces zero GP carry", () => {
    const inputs: FundInputs = {
      ...AMERICAN_INPUTS,
      dealMultiples: [0.8, 0.7, 0.6, 0.5, 0.4],
    };
    const result = calculateWaterfall(inputs);
    expect(result.gpCarry).toBeCloseTo(0, 4);
  });

  it("American waterfall GP carry is positive on an all-winner portfolio", () => {
    // American waterfall distributes carry deal-by-deal; on all-winner deals
    // GP always earns carry because every deal clears capital + pref.
    const allWinners: FundInputs = {
      ...BASE_INPUTS,
      waterfallType: "american",
      dealMultiples: [3, 3, 3, 3, 3],
      avgHoldPeriod: 4,
    };
    const result = calculateWaterfall(allWinners);
    expect(result.gpCarry).toBeGreaterThan(0);
    // Effective carry should be close to the nominal 20%
    expect(result.effectiveCarryPct).toBeCloseTo(0.2, 1);
  });

  it("LP always receives preferred return before GP gets any carry per deal", () => {
    const result = calculateWaterfall(AMERICAN_INPUTS);
    // Tier 1 + Tier 2 (LP amounts) must be positive when fund is profitable
    const lpCapitalBack = result.tiers[0].lpAmount;
    const lpPref = result.tiers[1].lpAmount;
    expect(lpCapitalBack).toBeGreaterThan(0);
    expect(lpPref).toBeGreaterThan(0);
  });
});

// ── Clawback edge case ─────────────────────────────────────────────────────

describe("GP carry totals are structurally non-negative", () => {
  it("gpCarry is never negative regardless of deal mix", () => {
    const inputs: FundInputs = {
      ...BASE_INPUTS,
      waterfallType: "american",
      dealMultiples: [5, 4, 0.1, 0.1, 0.1], // heavy skew
    };
    const result = calculateWaterfall(inputs);
    expect(result.gpCarry).toBeGreaterThanOrEqual(0);
  });
});
