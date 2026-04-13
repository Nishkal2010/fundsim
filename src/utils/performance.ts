import type { FundInputs, PerformanceData } from "../types/fund";
import { calculateLifecycle } from "./fundLifecycle";
import { calculateJCurve } from "./jCurve";

export function calculatePerformance(inputs: FundInputs): PerformanceData {
  const lifecycle = calculateLifecycle(inputs);
  const jCurve = calculateJCurve(inputs);

  const lastPoint = jCurve.points[jCurve.points.length - 1];
  const totalCapitalCalled = lastPoint.capitalCalled;
  const totalDistributions = lastPoint.distributions;

  const dpi =
    totalCapitalCalled > 0 ? totalDistributions / totalCapitalCalled : 0;
  const navActual =
    (lastPoint.nav / 100) * inputs.fundSize +
    lastPoint.capitalCalled -
    lastPoint.distributions;
  const rvpi =
    totalCapitalCalled > 0 ? Math.max(0, navActual / totalCapitalCalled) : 0;
  const tvpi = dpi + rvpi;
  const netIRR = jCurve.netIRR;

  const lpScale = 1 - inputs.gpCommitment;
  const grossMOIC =
    lifecycle.netInvestableCapital > 0 && lpScale > 0
      ? totalDistributions / lifecycle.netInvestableCapital
      : 0;
  const netMOIC = tvpi;

  // ── Simplified PME (TVPI / index terminal value) ──────────────────────────
  const spGrowth = Math.pow(1 + inputs.spReturn, inputs.fundLife);
  const pme = spGrowth > 0 ? tvpi / spGrowth : 0;

  // ── Kaplan-Schoar PME ─────────────────────────────────────────────────────
  // KS-PME = PV(distributions) / PV(capital calls), both discounted at index return
  // Each cash flow is discounted to time 0 using (1 + spReturn)^(fundLife - t)
  // so that capital calls early in the fund have a larger present value.
  let ksPMENumer = 0; // sum of FV-adjusted distributions
  let ksPMEDenom = 0; // sum of FV-adjusted capital calls

  jCurve.points.forEach((p, idx) => {
    if (idx === 0) return;
    const yearlyData = idx <= jCurve.points.length - 1 ? idx : null;
    if (yearlyData === null) return;

    // Factor to compound to end of fund life
    const compoundFactor = Math.pow(1 + inputs.spReturn, inputs.fundLife - idx);

    // Annual capital called this year
    const annualCalled =
      idx === 1
        ? p.capitalCalled
        : p.capitalCalled - jCurve.points[idx - 1].capitalCalled;

    // Annual distributions this year
    const annualDist =
      idx === 1
        ? p.distributions
        : p.distributions - jCurve.points[idx - 1].distributions;

    ksPMENumer += annualDist * compoundFactor;
    ksPMEDenom += annualCalled * compoundFactor;
  });

  // Add terminal NAV to numerator
  ksPMENumer += Math.max(0, navActual);
  const ksPME = ksPMEDenom > 0 ? ksPMENumer / ksPMEDenom : 0;

  // Over-time data
  const dpiOverTime = jCurve.points.map((p) => {
    const pointDPI =
      p.capitalCalled > 0 ? p.distributions / p.capitalCalled : 0;
    const navAtPoint =
      (p.nav / 100) * inputs.fundSize + p.capitalCalled - p.distributions;
    const pointRVPI =
      p.capitalCalled > 0 ? Math.max(0, navAtPoint / p.capitalCalled) : 0;
    return {
      year: p.year,
      dpi: pointDPI,
      rvpi: pointRVPI,
      tvpi: pointDPI + pointRVPI,
    };
  });

  // Quartile benchmarks (Cambridge Associates / Preqin buyout medians)
  let quartile: "top" | "upper-mid" | "lower-mid" | "bottom";
  if (tvpi >= 2.5) quartile = "top";
  else if (tvpi >= 1.8) quartile = "upper-mid";
  else if (tvpi >= 1.3) quartile = "lower-mid";
  else quartile = "bottom";

  // Sensitivity matrix
  const exitMultiples = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  const lossRatios = [0.1, 0.2, 0.3, 0.4, 0.5];
  const sensitivityMatrix = exitMultiples.map((em) =>
    lossRatios.map((lr) => {
      const modifiedInputs = { ...inputs, avgExitMultiple: em, lossRatio: lr };
      const modJCurve = calculateJCurve(modifiedInputs);
      return { exitMultiple: em, lossRatio: lr, irr: modJCurve.netIRR };
    }),
  );

  return {
    dpi,
    rvpi,
    tvpi,
    netIRR,
    grossMOIC,
    netMOIC,
    pme,
    ksPME,
    dpiOverTime,
    quartile,
    sensitivityMatrix,
  };
}
