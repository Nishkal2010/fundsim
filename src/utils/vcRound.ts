import type {
  VCRoundInput,
  VCRoundSnapshot,
  VCData,
  VCExitScenario,
} from "../types/fund";

export const DEFAULT_VC_ROUNDS: VCRoundInput[] = [
  {
    name: "Seed",
    preMoney: 8,
    raise: 2,
    optionPoolTopUp: 0,
    liquidationPref: 1,
    participating: false,
    enabled: true,
  },
  {
    name: "Series A",
    preMoney: 20,
    raise: 8,
    optionPoolTopUp: 0.05,
    liquidationPref: 1,
    participating: false,
    enabled: true,
  },
  {
    name: "Series B",
    preMoney: 60,
    raise: 20,
    optionPoolTopUp: 0.05,
    liquidationPref: 1,
    participating: false,
    enabled: true,
  },
  {
    name: "Series C",
    preMoney: 150,
    raise: 40,
    optionPoolTopUp: 0.03,
    liquidationPref: 1,
    participating: false,
    enabled: false,
  },
  {
    name: "Series D",
    preMoney: 400,
    raise: 80,
    optionPoolTopUp: 0.02,
    liquidationPref: 1,
    participating: false,
    enabled: false,
  },
];

export const DEFAULT_VC_FOUNDER_SHARES = 10_000_000; // 10M shares
export const DEFAULT_ESOP_FOUNDING_PCT = 0.1; // 10% option pool at founding

export interface VCInputState {
  founderShares: number;
  foundingESOPPct: number;
  rounds: VCRoundInput[];
}

/**
 * Compute full cap table snapshots and exit scenarios.
 *
 * Share-based approach (not %-based) so dilution is exact:
 *   pricePerShare = preMoney / shares_before_round
 *   newShares     = raise / pricePerShare
 *   optionShares  = optionPoolTopUp * totalSharesAfter  (option pool is expressed as % of post)
 */
export function calculateVCCapTable(state: VCInputState): VCData {
  const { founderShares, foundingESOPPct, rounds } = state;

  // Founding state
  // ESOP expressed as % of post-founding fully diluted; solve for esopShares:
  // esopShares / (founderShares + esopShares) = foundingESOPPct
  // => esopShares = founderShares * foundingESOPPct / (1 - foundingESOPPct)
  const esopFoundingShares = Math.round(
    (founderShares * foundingESOPPct) / (1 - foundingESOPPct),
  );
  let totalShares = founderShares + esopFoundingShares;
  let totalESOPShares = esopFoundingShares;
  let cumulativeRaised = 0;

  // Per-round investor tracking: { round, shares, cost, liquidationPref, participating }
  const investorPools: Array<{
    round: string;
    shares: number;
    cost: number;
    liquidationPref: number;
    participating: boolean;
  }> = [];

  const snapshots: VCRoundSnapshot[] = [];

  for (const round of rounds) {
    if (!round.enabled) continue;

    const preMoney = round.preMoney;
    const raise = round.raise;

    // Price per share before this round
    const pricePerShare = preMoney / totalShares;

    // New investor shares
    const newShares = Math.round(raise / pricePerShare);

    // Option pool top-up: issued as % of post-money fully diluted shares
    // post = totalShares + newShares + optionShares → solve for optionShares
    // optionShares = topUp * (totalShares + newShares + optionShares)
    // optionShares * (1 - topUp) = topUp * (totalShares + newShares)
    const topUp = round.optionPoolTopUp;
    let optionShares = 0;
    if (topUp > 0) {
      optionShares = Math.round(
        (topUp / (1 - topUp)) * (totalShares + newShares),
      );
    }

    const postMoney = preMoney + raise;
    const totalSharesAfter = totalShares + newShares + optionShares;

    const founderOwnershipPct = founderShares / totalSharesAfter;
    const esopPct = (totalESOPShares + optionShares) / totalSharesAfter;
    const prevInvestorShares = investorPools.reduce((s, p) => s + p.shares, 0);
    const prevInvestorsPct = prevInvestorShares / totalSharesAfter;
    const newInvestorPct = newShares / totalSharesAfter;

    cumulativeRaised += raise;

    snapshots.push({
      roundName: round.name,
      preMoneyValuation: preMoney,
      newInvestment: raise,
      postMoneyValuation: postMoney,
      pricePerShare: parseFloat(pricePerShare.toFixed(4)),
      newSharesIssued: newShares,
      optionSharesIssued: optionShares,
      totalSharesAfter,
      founderOwnershipPct: parseFloat(founderOwnershipPct.toFixed(4)),
      esopPct: parseFloat(esopPct.toFixed(4)),
      newInvestorPct: parseFloat(newInvestorPct.toFixed(4)),
      prevInvestorsPct: parseFloat(prevInvestorsPct.toFixed(4)),
      cumulativeRaised,
      investorCost: raise,
    });

    investorPools.push({
      round: round.name,
      shares: newShares,
      cost: raise,
      liquidationPref: round.liquidationPref,
      participating: round.participating,
    });

    totalShares = totalSharesAfter;
    totalESOPShares += optionShares;
  }

  // Final state
  const currentFounderOwnershipPct =
    totalShares > 0 ? founderShares / totalShares : 0;
  const currentESOPPct = totalShares > 0 ? totalESOPShares / totalShares : 0;

  // Exit scenarios
  const exitValues = [50, 100, 250, 500, 1000, 2500, 5000]; // $M
  const exitScenarios: VCExitScenario[] = exitValues.map((exitVal) => {
    const label = exitVal >= 1000 ? `$${exitVal / 1000}B` : `$${exitVal}M`;

    // Liquidation preference waterfall:
    // Process investors in reverse order (last money in, first out — senior preference)
    // For simplicity: all investors rank pari-passu (same seniority)
    // Each investor has liquidation pref = liquidationPref × cost
    // Non-participating: gets max(liq pref, pro-rata share of exit)
    // Participating: gets liq pref + pro-rata share of remainder

    const investorResults: Array<{
      round: string;
      cost: number;
      proceeds: number;
      moic: number;
    }> = [];

    // Calculate total liquidation preferences
    const totalLiqPrefs = investorPools.reduce(
      (s, p) => s + p.cost * p.liquidationPref,
      0,
    );

    if (exitVal <= totalLiqPrefs) {
      // Proceeds < total liq prefs: distribute pro-rata among investors.
      // Guard against 0/0 when totalLiqPrefs===0 (all rounds disabled or zero-cost).
      investorPools.forEach((p) => {
        const ownPref = p.cost * p.liquidationPref;
        const proceeds =
          totalLiqPrefs > 0 ? exitVal * (ownPref / totalLiqPrefs) : 0;
        investorResults.push({
          round: p.round,
          cost: p.cost,
          proceeds: parseFloat(proceeds.toFixed(2)),
          moic: p.cost > 0 ? parseFloat((proceeds / p.cost).toFixed(2)) : 0,
        });
      });
      const totalProceeds = investorResults.reduce((s, r) => s + r.proceeds, 0);
      return {
        exitValuation: exitVal,
        label,
        founderProceeds: 0,
        esopProceeds: 0,
        investorsByRound: investorResults,
        totalInvestorProceeds: parseFloat(totalProceeds.toFixed(2)),
        totalInvestorMOIC:
          cumulativeRaised > 0
            ? parseFloat((totalProceeds / cumulativeRaised).toFixed(2))
            : 0,
      };
    }

    // Above liq prefs — handle participating vs non-participating
    const esopSharesFinal = totalESOPShares;

    const nonParticipating: typeof investorPools = [];
    const participating: typeof investorPools = [];

    investorPools.forEach((p) => {
      if (p.participating) {
        participating.push(p);
      } else {
        nonParticipating.push(p);
      }
    });

    const participatingPrefsPaid = participating.reduce(
      (s, p) => s + p.cost * p.liquidationPref,
      0,
    );
    const participatingShares = participating.reduce((s, p) => s + p.shares, 0);

    // Fixed-point iteration: each NP investor's conversion decision depends on
    // which other NPs convert (because sharesInRemainder changes). We iterate
    // until no investor's optimal action flips. Caps at 20 iterations to
    // prevent oscillation; typical convergence is 2-3 iterations.
    type NPState = {
      round: string;
      shares: number;
      cost: number;
      myPref: number;
    };
    const npList: NPState[] = nonParticipating.map((p) => ({
      round: p.round,
      shares: p.shares,
      cost: p.cost,
      myPref: p.cost * p.liquidationPref,
    }));
    const converts: boolean[] = new Array(npList.length).fill(true);

    // Helper: derive {sharesInRemainder, leftover} from the current converts[].
    // Used by both Gauss-Seidel updates and the final settlement so the two
    // can't drift out of sync.
    const computeRemainder = (
      convertsArr: boolean[],
      list: NPState[],
    ): { sharesInRemainder: number; leftover: number } => {
      let sir = founderShares + esopSharesFinal + participatingShares;
      let npPrefsUsed = 0;
      for (let i = 0; i < list.length; i++) {
        if (convertsArr[i]) {
          sir += list[i].shares;
        } else {
          npPrefsUsed += list[i].myPref;
        }
      }
      const lo = Math.max(0, exitVal - npPrefsUsed - participatingPrefsPaid);
      return { sharesInRemainder: sir, leftover: lo };
    };

    const MAX_ITERS = 20;
    let iters = 0;
    let stable = false;
    let sharesInRemainder = 0;
    let leftover = 0;

    // Gauss-Seidel: update converts[i] in place so subsequent investors in
    // the same pass observe the new decision. Breaks symmetric ping-pongs
    // that Jacobi-style updates can sustain near breakeven exits.
    while (!stable && iters < MAX_ITERS) {
      stable = true;
      iters++;

      for (let i = 0; i < npList.length; i++) {
        const { shares, myPref } = npList[i];
        const { sharesInRemainder: sir, leftover: lo } = computeRemainder(
          converts,
          npList,
        );
        const sharesIfConvert = sir + (converts[i] ? 0 : shares);
        const leftoverIfConvert = lo + (converts[i] ? 0 : myPref);
        const proceedsIfConvert =
          sharesIfConvert === 0
            ? 0
            : (shares / sharesIfConvert) * leftoverIfConvert;
        const wantsToConvert = proceedsIfConvert > myPref;

        if (wantsToConvert !== converts[i]) {
          converts[i] = wantsToConvert;
          stable = false;
        }
      }
    }

    // Deterministic fallback: if iteration hit the cap without converging,
    // pick each NP's choice based on the FINAL state — convert iff pro-rata
    // beats pref. This is the rational individual choice and kills any
    // residual oscillation.
    if (iters === MAX_ITERS && !stable) {
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `[vcRound] NP-conversion fixed-point did not converge in ${MAX_ITERS} iterations at exitVal=${exitVal}; applying deterministic fallback.`,
        );
      }
      const { sharesInRemainder: sir, leftover: lo } = computeRemainder(
        converts,
        npList,
      );
      for (let i = 0; i < npList.length; i++) {
        const { shares, myPref } = npList[i];
        const sharesIfConvert = sir + (converts[i] ? 0 : shares);
        const leftoverIfConvert = lo + (converts[i] ? 0 : myPref);
        const proRataIfConvert =
          sharesIfConvert === 0
            ? 0
            : (shares / sharesIfConvert) * leftoverIfConvert;
        converts[i] = proRataIfConvert > myPref;
      }
    }

    // Final sharesInRemainder/leftover using converged converts[]
    ({ sharesInRemainder, leftover } = computeRemainder(converts, npList));

    const npFinal = npList.map((r, i) => {
      const proceeds = converts[i]
        ? sharesInRemainder > 0
          ? (r.shares / sharesInRemainder) * leftover
          : 0
        : r.myPref;
      return {
        round: r.round,
        cost: r.cost,
        proceeds: parseFloat(proceeds.toFixed(2)),
        moic: r.cost > 0 ? parseFloat((proceeds / r.cost).toFixed(2)) : 0,
      };
    });

    const pFinal = participating.map((p) => {
      const myPref = p.cost * p.liquidationPref;
      const shareOfRemainder =
        sharesInRemainder > 0 ? (p.shares / sharesInRemainder) * leftover : 0;
      const proceeds = myPref + shareOfRemainder;
      return {
        round: p.round,
        cost: p.cost,
        proceeds: parseFloat(proceeds.toFixed(2)),
        moic: p.cost > 0 ? parseFloat((proceeds / p.cost).toFixed(2)) : 0,
      };
    });

    const founderShareOfRemainder =
      sharesInRemainder > 0
        ? (founderShares / sharesInRemainder) * leftover
        : 0;
    const esopShareOfRemainder =
      sharesInRemainder > 0
        ? (esopSharesFinal / sharesInRemainder) * leftover
        : 0;

    const allInvestorResults = [...npFinal, ...pFinal];
    const totalInvestorProceeds = allInvestorResults.reduce(
      (s, r) => s + r.proceeds,
      0,
    );
    const totalInvestorMOIC =
      cumulativeRaised > 0 ? totalInvestorProceeds / cumulativeRaised : 0;

    // Residual reconciliation: rounding from toFixed(2) can leave a small gap
    // between sum(all proceeds) and exitVal. Push it onto founderProceeds so
    // the cap table sums exactly.
    const founderProceedsRaw = parseFloat(founderShareOfRemainder.toFixed(2));
    const esopProceedsRaw = parseFloat(esopShareOfRemainder.toFixed(2));
    const sumAll = founderProceedsRaw + esopProceedsRaw + totalInvestorProceeds;
    const residual = parseFloat((exitVal - sumAll).toFixed(2));
    const founderProceedsFinal = parseFloat(
      (founderProceedsRaw + residual).toFixed(2),
    );

    return {
      exitValuation: exitVal,
      label,
      founderProceeds: founderProceedsFinal,
      esopProceeds: esopProceedsRaw,
      investorsByRound: allInvestorResults,
      totalInvestorProceeds: parseFloat(totalInvestorProceeds.toFixed(2)),
      totalInvestorMOIC: parseFloat(totalInvestorMOIC.toFixed(2)),
    };
  });

  return {
    rounds: snapshots,
    founderShares,
    esopShares: totalESOPShares,
    currentFounderOwnershipPct: parseFloat(
      currentFounderOwnershipPct.toFixed(4),
    ),
    currentESOPPct: parseFloat(currentESOPPct.toFixed(4)),
    currentTotalRaised: cumulativeRaised,
    fullyDilutedShares: totalShares,
    exitScenarios,
  };
}
