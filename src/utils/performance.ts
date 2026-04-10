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
  const grossMOIC =
    lifecycle.netInvestableCapital > 0
      ? totalDistributions / lifecycle.netInvestableCapital
      : 0;
  const netMOIC = tvpi;

  // PME: compare to S&P
  const spGrowth = Math.pow(1 + inputs.spReturn, inputs.fundLife);
  const pme = spGrowth > 0 ? tvpi / spGrowth : 0;

  // Over-time data: navPct = (unrealizedNAV + distributions - capitalCalled) / fundSize * 100
  // → unrealizedNAV = navPct/100 * fundSize + capitalCalled - distributions
  const dpiOverTime = jCurve.points.map((p) => {
    const pointDPI =
      p.capitalCalled > 0 ? p.distributions / p.capitalCalled : 0;
    const navActual =
      (p.nav / 100) * inputs.fundSize + p.capitalCalled - p.distributions;
    const pointRVPI =
      p.capitalCalled > 0 ? Math.max(0, navActual / p.capitalCalled) : 0;
    return {
      year: p.year,
      dpi: pointDPI,
      rvpi: pointRVPI,
      tvpi: pointDPI + pointRVPI,
    };
  });

  // Quartile
  let quartile: "top" | "upper-mid" | "lower-mid" | "bottom";
  if (tvpi > 2.0) quartile = "top";
  else if (tvpi > 1.5) quartile = "upper-mid";
  else if (tvpi > 1.2) quartile = "lower-mid";
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
    dpiOverTime,
    quartile,
    sensitivityMatrix,
  };
}
