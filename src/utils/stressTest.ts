import type { LBOInputs, LBOData } from "../types/fund";
import { calculateLBO } from "./lbo";

export const STRESS_SHOCKS = {
  // Entry multiple overpay shock: buyer pays 1x more than base, inflating equity
  // check-out price without changing FCFs — this breaks the EBITDA-scaling
  // symmetry that made an entryEBITDA haircut IRR-neutral.
  entryMultipleShock: 1.0, // +1.0x added to entryMultiple (overpay scenario)
  holdExtension: 2, // +2 years added to holdYears
  exitMultipleShock: 1.0, // -1.0x subtracted from exitMultiple
} as const;

export interface StressResult {
  stressedInputs: LBOInputs;
  irr: number | null;
  moic: number;
  irrDelta: number | null; // stressed IRR − base IRR (negative = worse)
  moicDelta: number; // stressed MOIC − base MOIC
  biggestDriver: "ebitda" | "holdPeriod" | "exitMultiple";
  driverImpacts: {
    ebitda: number | null; // IRR delta from EBITDA shock alone
    holdPeriod: number | null; // IRR delta from hold extension alone
    exitMultiple: number | null; // IRR delta from exit multiple shock alone
  };
}

export function runStressTest(
  base: LBOInputs,
  baseData: LBOData,
): StressResult {
  const stressedInputs: LBOInputs = {
    ...base,
    entryMultiple: base.entryMultiple + STRESS_SHOCKS.entryMultipleShock,
    holdYears: base.holdYears + STRESS_SHOCKS.holdExtension,
    exitMultiple: Math.max(
      4,
      base.exitMultiple - STRESS_SHOCKS.exitMultipleShock,
    ),
  };

  const stressData = calculateLBO(stressedInputs);

  const irrDelta =
    stressData.grossIRR !== null && baseData.grossIRR !== null
      ? stressData.grossIRR - baseData.grossIRR
      : null;

  const moicDelta = stressData.grossMOIC - baseData.grossMOIC;

  // Isolated single-factor shocks for driver attribution
  // Shock entryMultiple (overpay) rather than entryEBITDA: the latter scales
  // entryDebt, entryEquity, and all FCFs by the same factor, making IRR
  // invariant and attribution meaningless. Overpaying 1x raises entry equity
  // cost while FCFs are unchanged — producing a real, attributable IRR drag.
  const ebitdaOnly = calculateLBO({
    ...base,
    entryMultiple: base.entryMultiple + STRESS_SHOCKS.entryMultipleShock,
  });
  const holdOnly = calculateLBO({
    ...base,
    holdYears: base.holdYears + STRESS_SHOCKS.holdExtension,
  });
  const exitOnly = calculateLBO({
    ...base,
    exitMultiple: Math.max(
      4,
      base.exitMultiple - STRESS_SHOCKS.exitMultipleShock,
    ),
  });

  const ebitdaImpact =
    ebitdaOnly.grossIRR !== null && baseData.grossIRR !== null
      ? ebitdaOnly.grossIRR - baseData.grossIRR
      : null;
  const holdImpact =
    holdOnly.grossIRR !== null && baseData.grossIRR !== null
      ? holdOnly.grossIRR - baseData.grossIRR
      : null;
  const exitImpact =
    exitOnly.grossIRR !== null && baseData.grossIRR !== null
      ? exitOnly.grossIRR - baseData.grossIRR
      : null;

  // Biggest driver = largest absolute IRR impact; ties broken ebitda > exitMultiple > holdPeriod
  const impacts: Array<{
    key: "ebitda" | "holdPeriod" | "exitMultiple";
    abs: number;
  }> = [
    { key: "ebitda", abs: ebitdaImpact !== null ? Math.abs(ebitdaImpact) : 0 },
    {
      key: "exitMultiple",
      abs: exitImpact !== null ? Math.abs(exitImpact) : 0,
    },
    { key: "holdPeriod", abs: holdImpact !== null ? Math.abs(holdImpact) : 0 },
  ];
  // Sort descending; stable sort preserves ebitda > exitMultiple > holdPeriod on ties
  impacts.sort((a, b) => b.abs - a.abs);
  const biggestDriver = impacts[0].key;

  return {
    stressedInputs,
    irr: stressData.grossIRR,
    moic: stressData.grossMOIC,
    irrDelta,
    moicDelta,
    biggestDriver,
    driverImpacts: {
      ebitda: ebitdaImpact,
      holdPeriod: holdImpact,
      exitMultiple: exitImpact,
    },
  };
}
