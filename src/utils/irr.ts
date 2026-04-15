export function calculateIRR(
  cashFlows: number[],
  guess: number = 0.1,
): number | null {
  // IRR requires both positive and negative cash flows to be defined
  const hasPositive = cashFlows.some((cf) => cf > 0);
  const hasNegative = cashFlows.some((cf) => cf < 0);
  if (!hasPositive || !hasNegative) return null;

  // Descartes' rule — warn when multiple sign changes exist,
  // meaning multiple IRRs are mathematically possible.
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
    console.warn(
      `calculateIRR: ${signChanges} sign changes detected in cash flows. ` +
        "Multiple IRRs are possible (Descartes' rule). " +
        "The returned value is the IRR closest to the initial guess.",
    );
  }

  const npvFn = (r: number): number =>
    cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);

  // ── Phase 1: Newton-Raphson ──────────────────────────────────────────────
  //
  // NPV(r) = Σ CF_t / (1+r)^t
  // NPV'(r) = Σ -t·CF_t / (1+r)^(t+1)   ← negative sign is critical
  //
  // FIX (Issue 1): the prior code computed +t·CF_t/(disc·(1+r)), which is
  // the WRONG sign. Newton-Raphson then stepped away from the root instead
  // of toward it, causing divergence or premature exit at 0% for all cases
  // such as [-100,0,0,0,0,200] (2x/5yr, true IRR ≈ 14.87%).
  //
  let rate = guess;
  let newtonConverged = false;

  for (let i = 0; i < 1000; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const cf = cashFlows[t];
      const disc = Math.pow(1 + rate, t);
      npv += cf / disc;
      dnpv -= (t * cf) / (disc * (1 + rate)); // FIXED: was +=, must be -=
    }
    if (Math.abs(dnpv) < 1e-12) break; // degenerate — fall through to bisection
    const newRate = rate - npv / dnpv;
    // Dual convergence: both step size and NPV residual must be tiny
    if (Math.abs(newRate - rate) < 1e-8 && Math.abs(npv) < 1e-8) {
      newtonConverged = true;
      rate = newRate;
      break;
    }
    rate = Math.min(100, Math.max(-0.9999, newRate));
  }

  if (newtonConverged && isFinite(rate)) return rate;

  // ── Phase 2: Bisection fallback ──────────────────────────────────────────
  //
  // Used when Newton diverges (e.g. pathological cash flow shapes).
  // Searches [-99.99%, +1000%] — covers virtually all real-world PE IRRs.
  //
  let lo = -0.9999;
  let hi = 10.0;
  const npvLo = npvFn(lo);
  const npvHi = npvFn(hi);
  if (npvLo * npvHi > 0) return null; // no sign change → no IRR in range

  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npvFn(mid);
    if (Math.abs(npvMid) < 1e-8 || hi - lo < 1e-10) return mid;
    if (npvLo * npvMid < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
