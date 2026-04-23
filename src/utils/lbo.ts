import type { LBOInputs, LBOData, LBODebtYear } from "../types/fund";
import { calculateIRR } from "./irr";

export function calculateLBO(inputs: LBOInputs): LBOData {
  const {
    entryEBITDA,
    entryMultiple,
    debtPercent,
    interestRate,
    ebitdaGrowthRate,
    exitMultiple,
    holdYears,
    fcfConversion,
    mandatoryAmortization,
  } = inputs;

  const entryEV = entryEBITDA * entryMultiple;
  const entryDebt = entryEV * debtPercent;
  const entryEquity = entryEV - entryDebt;

  // ── Debt paydown schedule with DSCR ────────────────────────────────────────
  // Uses a proper cash-flow sweep: FCF covers interest first, mandatory amort
  // second, then any surplus goes to optional principal paydown (cash sweep).
  const maxYears = Math.max(holdYears, 10);
  const debtSchedule: LBODebtYear[] = [];
  let remainingDebt = entryDebt;

  for (let year = 1; year <= maxYears; year++) {
    const ebitda = entryEBITDA * Math.pow(1 + ebitdaGrowthRate, year);
    const beginning = remainingDebt;
    const interest = beginning * interestRate;
    // FCF = EBITDA × FCF conversion rate (captures capex, NWC, taxes implicitly)
    const fcf = ebitda * fcfConversion;
    // Mandatory amortization: fixed % of original debt per year
    const mandatory = entryDebt * mandatoryAmortization;
    // Cash available after interest
    const cashAfterInterest = Math.max(0, fcf - interest);
    // Sweep: repay at least mandatory; sweep any additional FCF beyond mandatory
    const totalAmort = Math.min(
      beginning,
      Math.max(mandatory, cashAfterInterest),
    );
    const ending = Math.max(0, beginning - totalAmort);

    // DSCR = EBITDA / (interest + mandatory principal) — standard credit metric
    const debtService = interest + mandatory;
    const dscr = debtService > 0 ? fcf / debtService : 99;

    // Hypothetical exit at this year
    const ev = ebitda * exitMultiple;
    const equity = Math.max(0, ev - ending);
    const moic = entryEquity > 0 ? equity / entryEquity : 0;

    debtSchedule.push({
      year,
      beginningDebt: beginning,
      interest,
      amortization: totalAmort,
      endingDebt: ending,
      ebitda,
      ev,
      equity,
      moic,
      debtToEBITDA: ebitda > 0 ? ending / ebitda : 0,
      dscr,
      fcf,
    });

    remainingDebt = ending;
    if (remainingDebt <= 0.001) {
      // Debt fully repaid — fill remaining years with zero debt
      for (let y2 = year + 1; y2 <= maxYears; y2++) {
        const e2 = entryEBITDA * Math.pow(1 + ebitdaGrowthRate, y2);
        const fcf2 = e2 * fcfConversion;
        const ev2 = e2 * exitMultiple;
        debtSchedule.push({
          year: y2,
          beginningDebt: 0,
          interest: 0,
          amortization: 0,
          endingDebt: 0,
          ebitda: e2,
          ev: ev2,
          equity: ev2,
          moic: entryEquity > 0 ? ev2 / entryEquity : 0,
          debtToEBITDA: 0,
          dscr: 99,
          fcf: fcf2,
        });
      }
      break;
    }
  }

  const targetIdx = holdYears - 1;
  const target = debtSchedule[Math.min(targetIdx, debtSchedule.length - 1)];

  const exitEBITDA = target.ebitda;
  const exitEV = target.ev;
  const exitDebt = target.endingDebt;
  const exitEquity = target.equity;
  const grossMOIC = entryEquity > 0 ? exitEquity / entryEquity : 0;

  // IRR: initial equity outflow, then exit equity as terminal inflow
  const cashFlows = [-entryEquity, ...Array(holdYears - 1).fill(0), exitEquity];
  const grossIRR = calculateIRR(cashFlows);

  // ── Value Creation Bridge ───────────────────────────────────────────────────
  // Entry equity → exit equity decomposed into three drivers
  // 1. EBITDA growth: incremental EBITDA at entry multiple
  // 2. Multiple expansion: exit EBITDA at incremental multiple
  // 3. Debt paydown: reduction in net debt converts EV to equity dollar-for-dollar
  const ebitdaGrowthContrib = (exitEBITDA - entryEBITDA) * entryMultiple;
  const multipleExpansionContrib = exitEBITDA * (exitMultiple - entryMultiple);
  const debtPaydownContrib = entryDebt - exitDebt;
  const total = exitEquity - entryEquity;

  // ── EBITDA Scenario Modeling ────────────────────────────────────────────────
  // Bull / Base / Bear growth rates and resulting exit metrics
  const SCENARIO_GROWTH_DELTA = 0.05; // ±5% around base

  function runScenario(growthRate: number) {
    const scenExitEBITDA = entryEBITDA * Math.pow(1 + growthRate, holdYears);
    // Run same debt sweep with scenario growth affecting FCF
    let scenDebt = entryDebt;
    for (let yr = 1; yr <= holdYears; yr++) {
      const scenEBITDA = entryEBITDA * Math.pow(1 + growthRate, yr);
      const scenFCF = scenEBITDA * fcfConversion;
      const scenInterest = scenDebt * interestRate;
      const scenMandatory = entryDebt * mandatoryAmortization;
      const cashAfter = Math.max(0, scenFCF - scenInterest);
      const amort = Math.min(scenDebt, Math.max(scenMandatory, cashAfter));
      scenDebt = Math.max(0, scenDebt - amort);
    }
    const scenExitEV = scenExitEBITDA * exitMultiple;
    const scenExitEquity = Math.max(0, scenExitEV - scenDebt);
    const scenMOIC = entryEquity > 0 ? scenExitEquity / entryEquity : 0;
    const scenCF = [
      -entryEquity,
      ...Array(holdYears - 1).fill(0),
      scenExitEquity,
    ];
    return {
      exitEBITDA: scenExitEBITDA,
      exitEV: scenExitEV,
      exitEquity: scenExitEquity,
      moic: scenMOIC,
      irr: calculateIRR(scenCF),
      growthRate,
    };
  }

  const scenarios = {
    bull: runScenario(ebitdaGrowthRate + SCENARIO_GROWTH_DELTA),
    base: runScenario(ebitdaGrowthRate),
    bear: runScenario(Math.max(-0.1, ebitdaGrowthRate - SCENARIO_GROWTH_DELTA)),
  };

  // ── Returns Sensitivity: Entry Multiple × Exit Multiple → IRR ───────────────
  // Classic PE sensitivity table: row = entry multiple, col = exit multiple
  const entryMultiples = [
    Math.max(4, entryMultiple - 4),
    Math.max(4, entryMultiple - 2),
    entryMultiple,
    entryMultiple + 2,
    entryMultiple + 4,
  ];
  const exitMultiples = [
    Math.max(4, exitMultiple - 4),
    Math.max(4, exitMultiple - 2),
    exitMultiple,
    exitMultiple + 2,
    exitMultiple + 4,
  ];

  const entryExitSensitivity = entryMultiples.map((em) => {
    const entryEVS = entryEBITDA * em;
    const entryDebtS = entryEVS * debtPercent;
    const entryEquityS = entryEVS - entryDebtS;

    return {
      entryMult: em,
      irrs: exitMultiples.map((xm) => {
        // Run debt sweep for this scenario
        let scenDebt = entryDebtS;
        for (let yr = 1; yr <= holdYears; yr++) {
          const scenEBITDA = entryEBITDA * Math.pow(1 + ebitdaGrowthRate, yr);
          const scenFCF = scenEBITDA * fcfConversion;
          const scenInterest = scenDebt * interestRate;
          const scenMandatory = entryDebtS * mandatoryAmortization;
          const cashAfter = Math.max(0, scenFCF - scenInterest);
          const amort = Math.min(scenDebt, Math.max(scenMandatory, cashAfter));
          scenDebt = Math.max(0, scenDebt - amort);
        }
        const xExitEBITDA =
          entryEBITDA * Math.pow(1 + ebitdaGrowthRate, holdYears);
        const xExitEV = xExitEBITDA * xm;
        const xExitEq = Math.max(0, xExitEV - scenDebt);
        const xMOIC = entryEquityS > 0 ? xExitEq / entryEquityS : 0;
        const xCF = [-entryEquityS, ...Array(holdYears - 1).fill(0), xExitEq];
        return {
          exitMult: xm,
          moic: xMOIC,
          irr: calculateIRR(xCF),
        };
      }),
    };
  });

  // ── Legacy sensitivity grid (exit multiple × EBITDA growth) ────────────────
  const exitMults = [8, 10, 12, 14, 16, 18, 20];
  const growthRates = [-0.05, 0, 0.05, 0.1, 0.15, 0.2];
  const sensitivityGrid = exitMults.flatMap((em) =>
    growthRates.map((gr) => {
      const exitEB = entryEBITDA * Math.pow(1 + gr, holdYears);
      const eqAtExit = Math.max(0, exitEB * em - exitDebt);
      const m = entryEquity > 0 ? eqAtExit / entryEquity : 0;
      const cf = [-entryEquity, ...Array(holdYears - 1).fill(0), eqAtExit];
      return { exitMult: em, growthRate: gr, moic: m, irr: calculateIRR(cf) };
    }),
  );

  return {
    entryEV,
    entryEquity,
    entryDebt,
    debtSchedule,
    exitEV,
    exitDebt,
    exitEquity,
    grossMOIC,
    grossIRR,
    valueCreation: {
      multipleExpansion: multipleExpansionContrib,
      ebitdaGrowth: ebitdaGrowthContrib,
      debtPaydown: debtPaydownContrib,
      total,
    },
    sensitivityGrid,
    scenarios,
    entryExitSensitivity,
    entryMultiples,
    exitMultiples,
  };
}
