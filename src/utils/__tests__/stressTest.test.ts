import { describe, it, expect } from "vitest";
import { runStressTest } from "../stressTest";
import { calculateLBO } from "../lbo";
import type { LBOInputs } from "../../types/fund";

// DEFAULT_LBO matches LBOTab.tsx defaults
const DEFAULT_LBO: LBOInputs = {
  entryEBITDA: 50,
  entryMultiple: 12,
  debtPercent: 0.6,
  interestRate: 0.075,
  ebitdaGrowthRate: 0.1,
  exitMultiple: 14,
  holdYears: 5,
  fcfConversion: 0.55,
  mandatoryAmortization: 0.05,
};

const baseData = calculateLBO(DEFAULT_LBO);
const stressResult = runStressTest(DEFAULT_LBO, baseData);

describe("runStressTest", () => {
  it("1. stressedInputs.entryMultiple === 13.0 (12 + 1.0 overpay shock)", () => {
    expect(stressResult.stressedInputs.entryMultiple).toBeCloseTo(13.0, 8);
  });

  it("2. stressedInputs.holdYears === 7 (5 + 2)", () => {
    expect(stressResult.stressedInputs.holdYears).toBe(7);
  });

  it("3. stressedInputs.exitMultiple === 13.0 (14 - 1.0)", () => {
    expect(stressResult.stressedInputs.exitMultiple).toBeCloseTo(13.0, 8);
  });

  it("4. irrDelta < 0 — stress always worsens IRR vs base", () => {
    expect(stressResult.irrDelta).not.toBeNull();
    expect(stressResult.irrDelta!).toBeLessThan(0);
  });

  it("5. stressResult.moic is a finite positive number", () => {
    // MOIC can increase under stress when hold extension lets debt fully amortize.
    // The important invariant is that a stressed MOIC is computed and finite.
    expect(stressResult.moic).toBeGreaterThan(0);
    expect(isFinite(stressResult.moic)).toBe(true);
  });

  it("6. biggestDriver is one of the valid keys", () => {
    expect(["ebitda", "holdPeriod", "exitMultiple"]).toContain(
      stressResult.biggestDriver,
    );
  });

  it("7. driverImpacts.ebitda is a real negative IRR delta (entry overpay hurts returns)", () => {
    // Shocking entryMultiple +1x raises the equity check-out price while FCFs are
    // unchanged — producing a genuine IRR drag. This replaces the old entryEBITDA
    // haircut which was ratio-invariant (scaled entryDebt and entryEquity equally,
    // leaving MOIC and IRR unchanged — attribution was always effectively zero).
    expect(stressResult.driverImpacts.ebitda).not.toBeNull();
    expect(isFinite(stressResult.driverImpacts.ebitda!)).toBe(true);
    expect(stressResult.driverImpacts.ebitda!).toBeLessThan(-0.001); // must be a real drag
  });

  it("8. Floor: base exitMultiple=4.5 → stressed exitMultiple=4.0 (not 3.5)", () => {
    const floorBase: LBOInputs = { ...DEFAULT_LBO, exitMultiple: 4.5 };
    const floorBaseData = calculateLBO(floorBase);
    const floorResult = runStressTest(floorBase, floorBaseData);
    expect(floorResult.stressedInputs.exitMultiple).toBeCloseTo(4.0, 8);
  });

  it("9. Magnitude sanity: |irrDelta| < 0.5 for default inputs", () => {
    expect(Math.abs(stressResult.irrDelta!)).toBeLessThan(0.5);
  });

  it("10. Identity: irrDelta ≈ stressResult.irr - baseData.grossIRR", () => {
    expect(stressResult.irr).not.toBeNull();
    expect(baseData.grossIRR).not.toBeNull();
    const expected = stressResult.irr! - baseData.grossIRR!;
    expect(stressResult.irrDelta).toBeCloseTo(expected, 10);
  });
});
