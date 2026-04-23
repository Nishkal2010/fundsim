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

    let remainingProceeds = exitVal;
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
      // Proceeds < total liq prefs: distribute pro-rata among investors
      investorPools.forEach((p) => {
        const ownPref = p.cost * p.liquidationPref;
        const proceeds = exitVal * (ownPref / totalLiqPrefs);
        investorResults.push({
          round: p.round,
          cost: p.cost,
          proceeds: parseFloat(proceeds.toFixed(2)),
          moic: p.cost > 0 ? parseFloat((proceeds / p.cost).toFixed(2)) : 0,
        });
      });
      return {
        exitValuation: exitVal,
        label,
        founderProceeds: 0,
        esopProceeds: 0,
        investorsByRound: investorResults,
        totalInvestorProceeds: exitVal,
        totalInvestorMOIC:
          cumulativeRaised > 0
            ? parseFloat((exitVal / cumulativeRaised).toFixed(2))
            : 0,
      };
    }

    // Above liq prefs — handle participating vs non-participating
    // Step 1: pay liquidation preferences
    const prefPaidPerInvestor = investorPools.map(
      (p) => p.cost * p.liquidationPref,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    remainingProceeds -= prefPaidPerInvestor.reduce((a, b) => a + b, 0);

    // Step 2: distribute remainder pro-rata on fully diluted shares
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalInvestorShares = investorPools.reduce((s, p) => s + p.shares, 0);
    const esopSharesFinal = totalESOPShares;
    const totalFDShares = totalShares; // founderShares + esopShares + all investor shares

    // Participating preferred: investor gets pref + pro-rata remainder
    // Non-participating: investor gets max(pref, pro-rata of TOTAL proceeds)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let totalParticipatingShares = 0;
    const nonParticipating: typeof investorPools = [];
    const participating: typeof investorPools = [];

    investorPools.forEach((p) => {
      if (p.participating) {
        participating.push(p);
        totalParticipatingShares += p.shares;
      } else {
        nonParticipating.push(p);
      }
    });

    // For non-participating: compare pref vs pro-rata of total exit, take max
    let nonParticipatingPrefsUsed = 0;
    let nonParticipatingProRataSharesOut = 0; // shares no longer in the pool if they convert

    const npResults = nonParticipating.map((p) => {
      const myPref = p.cost * p.liquidationPref;
      const proRata =
        totalFDShares > 0 ? (p.shares / totalFDShares) * exitVal : 0;
      if (proRata >= myPref) {
        // Convert — give up pref, take pro-rata of total
        nonParticipatingProRataSharesOut += p.shares;
        return { ...p, proceeds: proRata, usedPref: false };
      } else {
        nonParticipatingPrefsUsed += myPref;
        return { ...p, proceeds: myPref, usedPref: true };
      }
    });

    // Remaining after non-participating prefs paid and participating prefs paid
    const participatingPrefsPaid = participating.reduce(
      (s, p) => s + p.cost * p.liquidationPref,
      0,
    );
    const totalPrefsPaid = nonParticipatingPrefsUsed + participatingPrefsPaid;
    const leftover = Math.max(0, exitVal - totalPrefsPaid);

    // Shares participating in the remainder:
    const sharesInRemainder =
      founderShares +
      esopSharesFinal +
      participating.reduce((s, p) => s + p.shares, 0) +
      nonParticipatingProRataSharesOut;

    // Non-participating who convert receive their pro-rata share of the leftover
    // pool (same pool as founders, ESOP, and participating preferred).
    // Using (shares/sharesInRemainder)*leftover — NOT (shares/totalFDShares)*exitVal —
    // ensures all proceeds sum exactly to exitVal regardless of who took their pref.
    const npFinal = npResults.map((r) => {
      const proceeds = r.usedPref
        ? r.proceeds // liq pref amount already capped
        : sharesInRemainder > 0
          ? (r.shares / sharesInRemainder) * leftover
          : 0;
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

    return {
      exitValuation: exitVal,
      label,
      founderProceeds: parseFloat(founderShareOfRemainder.toFixed(2)),
      esopProceeds: parseFloat(esopShareOfRemainder.toFixed(2)),
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
