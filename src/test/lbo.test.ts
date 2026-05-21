import { describe, it, expect } from "vitest";
import { calculateLBO } from "../utils/lbo";
import type { LBOInputs } from "../types/fund";

// Baseline PE deal used as the reference point for most tests
const BASE_INPUTS: LBOInputs = {
  entryEBITDA: 50, // $50M EBITDA
  entryMultiple: 10, // 10x entry → $500M EV
  debtPercent: 0.5, // 50% leverage → $250M debt
  interestRate: 0.08, // 8% interest
  ebitdaGrowthRate: 0.1, // 10% annual EBITDA growth
  exitMultiple: 10, // same-multiple exit
  holdYears: 5,
  fcfConversion: 0.4, // 40% FCF / EBITDA
  mandatoryAmortization: 0.05, // 5% of original debt per year
};

describe("calculateLBO", () => {
  // ── 1. Baseline ──────────────────────────────────────────────────────────────

  it("baseline: entryEV=500, entryDebt=250, entryEquity=250", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.entryEV).toBeCloseTo(500, 4);
    expect(r.entryDebt).toBeCloseTo(250, 4);
    expect(r.entryEquity).toBeCloseTo(250, 4);
  });

  // Golden values verified by running calculateLBO(BASE_INPUTS) once:
  // grossMOIC=2.4859, grossIRR=0.1998
  it("baseline: grossMOIC ≈ 2.49 (pinned golden value)", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.grossMOIC).toBeCloseTo(2.4859, 2);
  });

  it("baseline: grossIRR ≈ 0.20 (pinned golden value)", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.grossIRR).not.toBeNull();
    expect(r.grossIRR!).toBeCloseTo(0.1998, 2);
  });

  // ── 2. Early debt payoff branch ──────────────────────────────────────────────

  it("early debt payoff: high FCF + low leverage → endingDebt=0 and dscr=99 sentinel in tail years", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      debtPercent: 0.3, // 30% leverage → only $150M debt
      fcfConversion: 0.7, // 70% FCF → aggressive cash sweep
      mandatoryAmortization: 0.1, // 10% mandatory per year
    };
    const r = calculateLBO(inputs);

    // With 70% FCF on $50M EBITDA and only 30% leverage, debt should pay off early
    const zeroDebtYears = r.debtSchedule.filter((y) => y.endingDebt <= 0.001);
    expect(zeroDebtYears.length).toBeGreaterThan(0);

    // Sentinel DSCR of 99 must appear once debt hits zero
    const sentinelYears = r.debtSchedule.filter((y) => y.dscr === 99);
    expect(sentinelYears.length).toBeGreaterThan(0);
  });

  // ── 3. DSCR < 1 (distress) ───────────────────────────────────────────────────

  it("distress: DSCR < 1 when FCF cannot cover interest + mandatory amort", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      debtPercent: 0.8, // 80% leverage → $400M debt
      interestRate: 0.12, // 12% PIK-like rate
      fcfConversion: 0.1, // very low FCF conversion
      mandatoryAmortization: 0.05,
    };
    const r = calculateLBO(inputs);

    // Year 1: interest = 400 * 0.12 = $48M, mandatory = 400*0.05 = $20M
    // FCF = 50 * 0.1 = $5M → DSCR = 5 / (48+20) ≈ 0.074
    const year1 = r.debtSchedule[0];
    expect(year1.dscr).toBeLessThan(1);
  });

  // ── 4. Mandatory amortization applied even with negative FCF coverage ─────────
  // Regression for C-05 from sprint 1 audit: mandatory amort fires regardless of FCF

  it("mandatory amort still reduces debt when FCF < interest (C-05 regression)", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      debtPercent: 0.9, // heavy leverage
      interestRate: 0.15, // very high rate → FCF < interest
      fcfConversion: 0.05, // near-zero FCF
      mandatoryAmortization: 0.05,
    };
    const r = calculateLBO(inputs);

    const year1 = r.debtSchedule[0];
    // FCF = 50 * 0.05 = $2.5M; interest = 450 * 0.15 = $67.5M → FCF << interest
    // Mandatory = 450 * 0.05 = $22.5M; beginning debt = 450
    // The cash-flow sweep: cashAfterInterest = max(0, 2.5 - 67.5) = 0
    // totalAmort = min(450, max(22.5, 0)) = 22.5 → debt DOES decrease
    expect(year1.endingDebt).toBeLessThan(year1.beginningDebt);

    // The reduction must be at least the mandatory amortization amount
    const mandatoryAmt =
      inputs.entryEBITDA *
      inputs.entryMultiple *
      inputs.debtPercent *
      inputs.mandatoryAmortization;
    const debtReduction = year1.beginningDebt - year1.endingDebt;
    expect(debtReduction).toBeGreaterThanOrEqual(mandatoryAmt - 0.01);
    // When FCF < interest, cash sweep contributes zero above mandatory → tight equality
    expect(debtReduction).toBeCloseTo(mandatoryAmt, 2);
  });

  // ── 5. Sensitivity grid uses per-cell debt (sprint 2 fix) ─────────────────────

  it("sensitivity grid: low-growth cell has higher exitDebt than high-growth cell at same exit multiple", () => {
    const r = calculateLBO(BASE_INPUTS);

    // exitMult=10, growthRate=-0.05 vs growthRate=0.20
    const bearCell = r.sensitivityGrid.find(
      (c) => c.exitMult === 10 && c.growthRate === -0.05,
    );
    const bullCell = r.sensitivityGrid.find(
      (c) => c.exitMult === 10 && c.growthRate === 0.2,
    );

    expect(bearCell).toBeDefined();
    expect(bullCell).toBeDefined();

    // Pin bearCell moic: exitMult=10, growthRate=-0.05, BASE_INPUTS → 0.7976 (verified)
    expect(bearCell!.moic).toBeCloseTo(0.7976, 2);

    // Bull growth → more FCF → more cash sweep → less exit debt → higher exit equity
    // This asserts the sprint 2 per-cell debt fix is functioning
    expect(bullCell!.moic).toBeGreaterThan(bearCell!.moic);

    // The difference should be non-trivial (not just floating-point noise)
    expect(bullCell!.moic - bearCell!.moic).toBeGreaterThan(0.1);
  });

  it("sensitivity grid: bear-growth exitEquity is materially lower than bull-growth exitEquity", () => {
    const r = calculateLBO(BASE_INPUTS);

    // Same exit multiple, wildly different growth → different exit debt → different equity
    const bearCell = r.sensitivityGrid.find(
      (c) => c.exitMult === 12 && c.growthRate === -0.05,
    );
    const bullCell = r.sensitivityGrid.find(
      (c) => c.exitMult === 12 && c.growthRate === 0.15,
    );

    expect(bearCell).toBeDefined();
    expect(bullCell).toBeDefined();
    // MOIC diff > 0.5x is a meaningful delta driven by per-cell debt calculation
    expect(bullCell!.moic - bearCell!.moic).toBeGreaterThan(0.5);
  });

  // ── 6. Entry/exit sensitivity grid shape and middle cell ─────────────────────

  it("entryExitSensitivity has 5 rows (entry multiples) each with 5 irr cells", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.entryExitSensitivity).toHaveLength(5);
    for (const row of r.entryExitSensitivity) {
      expect(row.irrs).toHaveLength(5);
    }
  });

  it("entryExitSensitivity middle cell (index [2][2]) moic ≈ base case grossMOIC", () => {
    const r = calculateLBO(BASE_INPUTS);
    // Middle row = index 2 (base entryMultiple), middle col = index 2 (base exitMultiple)
    const middleRow = r.entryExitSensitivity[2];
    const middleCell = middleRow.irrs[2];

    expect(middleRow.entryMult).toBeCloseTo(BASE_INPUTS.entryMultiple, 4);
    expect(middleCell.exitMult).toBeCloseTo(BASE_INPUTS.exitMultiple, 4);
    // MOIC at center of the grid should closely match the main calculation
    expect(middleCell.moic).toBeCloseTo(r.grossMOIC, 2);
  });

  // ── 7. Value creation bridge reconciliation ───────────────────────────────────

  it("value creation bridge: three drivers sum to total equity gain", () => {
    const r = calculateLBO(BASE_INPUTS);
    const { ebitdaGrowth, multipleExpansion, debtPaydown, total } =
      r.valueCreation;
    const componentSum = ebitdaGrowth + multipleExpansion + debtPaydown;
    // Sum of the three drivers must equal total equity gain
    expect(componentSum).toBeCloseTo(total, 3);
  });

  it("value creation bridge: total equals exitEquity minus entryEquity", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.valueCreation.total).toBeCloseTo(r.exitEquity - r.entryEquity, 3);
  });

  // ── 8. Zero growth ────────────────────────────────────────────────────────────

  it("zero growth: MOIC >= 1.0 because debt paydown still creates equity value", () => {
    const inputs: LBOInputs = { ...BASE_INPUTS, ebitdaGrowthRate: 0 };
    const r = calculateLBO(inputs);
    // Same entry and exit multiple, flat EBITDA, but debt reduces → equity grows
    expect(r.grossMOIC).toBeGreaterThanOrEqual(1.0);
  });

  // ── 9. Negative growth — equity clamp at zero ─────────────────────────────────

  it("negative growth: exitEquity is clamped at 0 (max(0,...) guard)", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      ebitdaGrowthRate: -0.05,
      debtPercent: 0.8, // high leverage amplifies downside
      fcfConversion: 0.1, // barely any cash sweep
      holdYears: 5,
    };
    const r = calculateLBO(inputs);
    // Even with heavy losses, equity cannot be negative
    expect(r.exitEquity).toBeGreaterThanOrEqual(0);
  });

  // ── 10. Edge: holdYears = 1 ───────────────────────────────────────────────────

  it("holdYears=1: debt schedule target is year 1, exit math is valid", () => {
    const inputs: LBOInputs = { ...BASE_INPUTS, holdYears: 1 };
    const r = calculateLBO(inputs);

    // debtSchedule must have at least 1 entry
    expect(r.debtSchedule.length).toBeGreaterThanOrEqual(1);

    // The exit values must be derived from year 1
    const year1 = r.debtSchedule[0];
    // exitEV / exitMultiple must equal year-1 EBITDA (verifies exit math uses holdYears=1 row)
    expect(r.exitEV / inputs.exitMultiple).toBeCloseTo(year1.ebitda, 4);
    expect(r.exitDebt).toBeCloseTo(year1.endingDebt, 4);
    expect(r.exitEquity).toBeCloseTo(year1.equity, 4);

    // grossMOIC and grossIRR should still be valid numbers
    expect(r.grossMOIC).toBeGreaterThan(0);
    expect(r.grossIRR).not.toBeNull();
  });

  // ── 11. Edge: 0% leverage (all-equity buyout) ─────────────────────────────────

  it("all-equity buyout: entryDebt=0, entryEquity=entryEV, no meaningful debt service", () => {
    const inputs: LBOInputs = { ...BASE_INPUTS, debtPercent: 0 };
    const r = calculateLBO(inputs);

    expect(r.entryDebt).toBeCloseTo(0, 6);
    expect(r.entryEquity).toBeCloseTo(r.entryEV, 4);

    // Debt schedule beginning debt should be 0 throughout
    expect(r.debtSchedule[0].beginningDebt).toBeCloseTo(0, 6);
    expect(r.debtSchedule[0].endingDebt).toBeCloseTo(0, 6);

    // grossIRR must still compute without crashing
    expect(r.grossIRR).not.toBeNull();
    expect(r.grossMOIC).toBeGreaterThan(0);
  });

  // ── 12. Edge: 100% leverage → entryEquity ≈ 0, division-by-zero guard ─────────

  it("100% leverage: entryEquity≈0, grossMOIC returns 0 (no division-by-zero crash)", () => {
    const inputs: LBOInputs = { ...BASE_INPUTS, debtPercent: 1.0 };
    const r = calculateLBO(inputs);

    expect(r.entryEquity).toBeCloseTo(0, 4);
    // grossMOIC guard: entryEquity > 0 ? ... : 0
    expect(r.grossMOIC).toBe(0);
    // No equity outflow → IRR is undefined; calculateIRR returns null
    expect(r.grossIRR).toBeNull();
    expect(r.entryEV).toBeCloseTo(500, 4);
  });

  // ── 13. High FCF + low rates → DSCR > 1 throughout ───────────────────────────

  it("healthy deal: DSCR > 1 in every scheduled year with strong FCF", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      debtPercent: 0.4, // moderate leverage
      interestRate: 0.06, // low rate
      fcfConversion: 0.55, // strong cash generation
      mandatoryAmortization: 0.05,
    };
    const r = calculateLBO(inputs);

    // Pin year-1 DSCR: fcf=55*0.55=30.25, interest=200*0.06=12, mandatory=200*0.05=10
    // debtService=22, dscr=30.25/22 ≈ 1.375 (verified)
    expect(r.debtSchedule[0].dscr).toBeCloseTo(1.375, 2);

    // All years with actual debt (beginning > 0) should show DSCR >= 1
    const yearsWithDebt = r.debtSchedule.filter(
      (y) => y.beginningDebt > 0.001 && y.dscr !== 99,
    );
    expect(yearsWithDebt.length).toBeGreaterThan(0);
    for (const yr of yearsWithDebt) {
      expect(yr.dscr).toBeGreaterThan(1);
    }
  });

  // ── 14. Bull scenario MOIC strictly higher than base ─────────────────────────

  it("bull scenario grossMOIC > base grossMOIC (higher growth → better returns)", () => {
    const base = calculateLBO(BASE_INPUTS);
    const bull = calculateLBO({ ...BASE_INPUTS, ebitdaGrowthRate: 0.2 });
    expect(bull.grossMOIC).toBeGreaterThan(base.grossMOIC);
  });

  // ── 15. Bear scenario MOIC strictly lower than base, but ≥ 0 ─────────────────

  it("bear scenario grossMOIC < base grossMOIC, and grossMOIC >= 0", () => {
    const base = calculateLBO(BASE_INPUTS);
    const bear = calculateLBO({ ...BASE_INPUTS, ebitdaGrowthRate: -0.05 });
    expect(bear.grossMOIC).toBeLessThan(base.grossMOIC);
    expect(bear.grossMOIC).toBeGreaterThanOrEqual(0);
  });

  // ── Bonus: scenarios block reflects bull > base > bear ordering ──────────────

  it("scenarios block: bull.moic > base.moic > bear.moic", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.scenarios.bull.moic).toBeGreaterThan(r.scenarios.base.moic);
    expect(r.scenarios.base.moic).toBeGreaterThan(r.scenarios.bear.moic);
  });

  it("sensitivityGrid covers all combinations: 7 exit multiples × 6 growth rates = 42 cells", () => {
    const r = calculateLBO(BASE_INPUTS);
    expect(r.sensitivityGrid).toHaveLength(42);
  });

  // ── 16. Edge: holdYears=0 throws ─────────────────────────────────────────────
  // lbo.ts accesses debtSchedule[holdYears-1] = debtSchedule[-1] = undefined → throws

  it("holdYears=0: throws because targetIdx=-1 dereferences undefined", () => {
    expect(() => calculateLBO({ ...BASE_INPUTS, holdYears: 0 })).toThrow();
  });

  // ── 17. Edge: exitMultiple=0 → grossMOIC ≈ 0 ─────────────────────────────────

  it("exitMultiple=0: exitEV=0, grossMOIC=0 (no terminal value)", () => {
    const r = calculateLBO({ ...BASE_INPUTS, exitMultiple: 0 });
    expect(r.grossMOIC).toBeCloseTo(0, 6);
  });

  // ── 18. Edge: fcfConversion=0 → debtReduction === mandatoryAmt exactly ────────

  it("fcfConversion=0: debt reduces by exactly mandatory amort (no sweep contribution)", () => {
    const inputs: LBOInputs = {
      ...BASE_INPUTS,
      debtPercent: 0.9,
      interestRate: 0.15,
      fcfConversion: 0,
      mandatoryAmortization: 0.05,
    };
    const r = calculateLBO(inputs);
    const mandatoryAmt =
      inputs.entryEBITDA *
      inputs.entryMultiple *
      inputs.debtPercent *
      inputs.mandatoryAmortization;
    const debtReduction =
      r.debtSchedule[0].beginningDebt - r.debtSchedule[0].endingDebt;
    // Zero FCF → cashAfterInterest=0 → totalAmort = mandatory exactly
    expect(debtReduction).toBeCloseTo(mandatoryAmt, 4);
  });

  // ── 19. Edge: debtPercent=0.95 → no NaN in returns ───────────────────────────

  it("debtPercent=0.95: grossMOIC and grossIRR are finite numbers, not NaN", () => {
    const r = calculateLBO({ ...BASE_INPUTS, debtPercent: 0.95 });
    expect(r.grossMOIC).not.toBeNaN();
    expect(r.grossIRR).not.toBeNull();
    expect(r.grossIRR!).not.toBeNaN();
    expect(isFinite(r.grossMOIC)).toBe(true);
    expect(isFinite(r.grossIRR!)).toBe(true);
  });

  // ── 20. Edge: DSCR === 1.0 boundary ─────────────────────────────────────────
  // fcfConversion=32.5/55 makes year-1 FCF exactly equal to debtService (DSCR=1.0)

  it("dscr=1.0 boundary: year-1 DSCR is exactly 1 when FCF equals debt service", () => {
    // year1 ebitda=55, debt=250, interest=250*0.08=20, mandatory=250*0.05=12.5
    // debtService=32.5; fcf=55*fcfConv=32.5 → fcfConv=32.5/55 ≈ 0.5909
    const fcfConversion = 32.5 / 55;
    const r = calculateLBO({ ...BASE_INPUTS, fcfConversion });
    expect(r.debtSchedule[0].dscr).toBeCloseTo(1.0, 4);
  });
});
