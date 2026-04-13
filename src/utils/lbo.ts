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

  const maxYears = Math.max(holdYears, 10);
  const debtSchedule: LBODebtYear[] = [];
  let remainingDebt = entryDebt;

  for (let year = 1; year <= maxYears; year++) {
    const ebitda = entryEBITDA * Math.pow(1 + ebitdaGrowthRate, year);
    const beginning = remainingDebt;
    const interest = beginning * interestRate;
    const fcf = ebitda * fcfConversion;
    // Mandatory amort as % of original debt per year
    const mandatory = entryDebt * mandatoryAmortization;
    // Cash sweep: any FCF beyond interest and mandatory amort repays debt early
    const cashAfterInterest = Math.max(0, fcf - interest);
    const totalAmort = Math.min(
      beginning,
      Math.max(mandatory, cashAfterInterest),
    );
    const ending = Math.max(0, beginning - totalAmort);

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
    });

    remainingDebt = ending;
    if (remainingDebt <= 0.001) {
      // Debt fully paid — fill remaining years with zero debt
      for (let y2 = year + 1; y2 <= maxYears; y2++) {
        const e2 = entryEBITDA * Math.pow(1 + ebitdaGrowthRate, y2);
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

  // Value Creation Bridge
  // EV growth = EBITDA growth contribution (at entry multiple) + multiple expansion (at exit EBITDA)
  const ebitdaGrowthContrib = (exitEBITDA - entryEBITDA) * entryMultiple;
  const multipleExpansionContrib = exitEBITDA * (exitMultiple - entryMultiple);
  const debtPaydownContrib = entryDebt - exitDebt;
  const total = exitEquity - entryEquity;

  // Sensitivity: exit multiple (8x-20x) vs EBITDA growth rate (-5% to 20%)
  const exitMults = [8, 10, 12, 14, 16, 18, 20];
  const growthRates = [-0.05, 0, 0.05, 0.1, 0.15, 0.2];
  const sensitivityGrid = exitMults.flatMap((em) =>
    growthRates.map((gr) => {
      const exitEB = entryEBITDA * Math.pow(1 + gr, holdYears);
      // Simplified: assume same debt paydown schedule, just different exit EBITDA
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
  };
}
