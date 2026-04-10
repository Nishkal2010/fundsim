export function calculateIRR(
  cashFlows: number[],
  guess: number = 0.1,
): number | null {
  // IRR requires both positive and negative cash flows to be defined
  const hasPositive = cashFlows.some((cf) => cf > 0);
  const hasNegative = cashFlows.some((cf) => cf < 0);
  if (!hasPositive || !hasNegative) return null;

  // Bug 3 fix: Descartes' rule — warn when multiple sign changes exist,
  // meaning multiple IRRs are mathematically possible. We still solve but
  // the caller should be aware the result may not be the only valid IRR.
  let signChanges = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    if (
      cashFlows[t] !== 0 &&
      cashFlows[t - 1] !== 0 &&
      Math.sign(cashFlows[t]) !== Math.sign(cashFlows[t - 1])
    ) {
      signChanges++;
    }
  }
  if (signChanges > 1) {
    // Multiple IRRs are possible; result is the one nearest the initial guess.
    console.warn(
      `calculateIRR: ${signChanges} sign changes detected in cash flows. ` +
        "Multiple IRRs are possible (Descartes' rule). " +
        "The returned value is the IRR closest to the initial guess.",
    );
  }

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
    // Bug 2 fix: dual convergence criterion — require both the step size and
    // the NPV residual to be below tolerance before declaring convergence.
    if (Math.abs(newRate - rate) < tolerance && Math.abs(npv) < 1e-6) {
      return isFinite(newRate) ? newRate : null;
    }
    // Bug 1 fix: clamp both below AND above to prevent domain / divergence errors.
    rate = Math.min(100, Math.max(-0.9999, newRate));
  }
  return null;
}
