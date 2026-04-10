export function calculateIRR(
  cashFlows: number[],
  guess: number = 0.1,
): number | null {
  // IRR requires both positive and negative cash flows to be defined
  const hasPositive = cashFlows.some((cf) => cf > 0);
  const hasNegative = cashFlows.some((cf) => cf < 0);
  if (!hasPositive || !hasNegative) return null;

  const maxIterations = 1000;
  const tolerance = 0.0001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const cf = cashFlows[t];
      const disc = Math.pow(1 + rate, t);
      npv += cf / disc;
      dnpv -= (t * cf) / (disc * (1 + rate));
    }
    if (Math.abs(dnpv) < 1e-12) return null;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) {
      return isFinite(newRate) ? newRate : null;
    }
    rate = Math.max(-0.9999, newRate); // clamp to prevent domain errors
  }
  return null;
}
