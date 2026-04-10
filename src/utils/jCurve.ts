import type { FundInputs, JCurveData, JCurvePoint } from "../types/fund";
import { calculateIRR } from "./irr";
import { calculateLifecycle } from "./fundLifecycle";

export function calculateJCurve(inputs: FundInputs): JCurveData {
  const {
    fundSize,
    fundLife,
    investmentPeriod,
    lossRatio,
    avgExitMultiple,
    avgHoldPeriod,
    exitDistribution,
  } = inputs;

  const lifecycle = calculateLifecycle(inputs);
  const netInvestable = lifecycle.netInvestableCapital;
  const numCompanies = 20;

  // Assign exit year to each company
  const companies = Array.from({ length: numCompanies }, (_, i) => {
    const investYear = Math.ceil(((i + 1) * investmentPeriod) / numCompanies);
    let exitYear: number;
    if (exitDistribution === "even") {
      exitYear = investYear + avgHoldPeriod;
    } else if (exitDistribution === "backloaded") {
      exitYear =
        investYear + avgHoldPeriod + Math.floor((i / numCompanies) * 3);
    } else {
      // bell curve
      const variance = Math.sin((i / numCompanies) * Math.PI) * 1.5;
      exitYear = Math.round(investYear + avgHoldPeriod + variance - 0.75);
    }
    return {
      investYear,
      exitYear: Math.min(fundLife, Math.max(investYear + 1, exitYear)),
      isLoss: i < Math.round(numCompanies * lossRatio),
      investedCapital: netInvestable / numCompanies,
    };
  });

  // For each year calculate cash flows
  const lpCashFlows: number[] = Array(fundLife + 1).fill(0);
  const yearlyData = lifecycle.years;

  // Capital calls are negative LP cash flows
  yearlyData.forEach((yd, idx) => {
    lpCashFlows[idx + 1] -= yd.capitalCalled * (1 - inputs.gpCommitment);
  });

  // Distributions from exits
  const distributionsByYear: number[] = Array(fundLife + 1).fill(0);
  companies.forEach((company) => {
    if (company.exitYear <= fundLife) {
      const proceeds = company.isLoss
        ? 0
        : company.investedCapital * avgExitMultiple;
      distributionsByYear[company.exitYear] += proceeds;
    }
  });

  distributionsByYear.forEach((dist, year) => {
    if (year > 0) {
      lpCashFlows[year] += dist * (1 - inputs.gpCommitment);
    }
  });

  // Build J-curve points
  const points: JCurvePoint[] = [];
  let cumulativeDistributions = 0;
  let cumulativeCapitalCalled = 0;

  for (let year = 0; year <= fundLife; year++) {
    if (year === 0) {
      points.push({
        year: 0,
        netCashFlow: 0,
        nav: 0,
        distributions: 0,
        capitalCalled: 0,
      });
      continue;
    }

    const yd = yearlyData[year - 1];
    cumulativeCapitalCalled += yd.capitalCalled;
    cumulativeDistributions += distributionsByYear[year];

    // NAV: unrealized investments at interpolated value
    let nav = 0;
    companies.forEach((company) => {
      if (company.investYear < year && company.exitYear >= year) {
        const yearsHeld = year - company.investYear;
        const holdPeriod = company.exitYear - company.investYear;
        const exitValue = company.isLoss
          ? 0
          : company.investedCapital * avgExitMultiple;
        const interpolatedValue =
          company.investedCapital +
          (exitValue - company.investedCapital) * (yearsHeld / holdPeriod);
        nav += interpolatedValue;
      }
    });

    const netCashPct =
      fundSize > 0
        ? ((cumulativeDistributions - cumulativeCapitalCalled) / fundSize) * 100
        : 0;
    const navPct =
      fundSize > 0
        ? ((nav + cumulativeDistributions - cumulativeCapitalCalled) /
            fundSize) *
          100
        : 0;

    points.push({
      year,
      netCashFlow: netCashPct,
      nav: navPct,
      distributions: cumulativeDistributions,
      capitalCalled: cumulativeCapitalCalled,
    });
  }

  // Find breakeven year
  let breakevenYear: number | null = null;
  for (let i = 1; i < points.length; i++) {
    if (points[i - 1].netCashFlow < 0 && points[i].netCashFlow >= 0) {
      breakevenYear = i;
      break;
    }
  }

  // Trough
  let troughYear = 1;
  let troughValue = 0;
  points.forEach((p) => {
    if (p.netCashFlow < troughValue) {
      troughValue = p.netCashFlow;
      troughYear = p.year;
    }
  });

  const finalNetMultiple =
    cumulativeCapitalCalled > 0
      ? cumulativeDistributions / cumulativeCapitalCalled
      : 0;

  const netIRR = calculateIRR(lpCashFlows.slice(1));

  return {
    points,
    breakevenYear,
    troughYear,
    troughValue,
    finalNetMultiple,
    netIRR,
  };
}
