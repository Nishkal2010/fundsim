import type { FundInputs, WaterfallData, WaterfallTier } from "../types/fund";
import { calculateIRR } from "./irr";

export function calculateWaterfall(inputs: FundInputs): WaterfallData {
  const { fundSize, gpCommitment, waterfallType } = inputs;

  const gpCapital = fundSize * gpCommitment;
  const lpCapital = fundSize - gpCapital;
  const totalCapitalCalled = fundSize; // simplified: assume fully called

  if (waterfallType === "european") {
    return calculateEuropeanWaterfall(
      inputs,
      lpCapital,
      gpCapital,
      totalCapitalCalled,
    );
  } else {
    return calculateAmericanWaterfall(
      inputs,
      lpCapital,
      gpCapital,
      totalCapitalCalled,
    );
  }
}

function calculateEuropeanWaterfall(
  inputs: FundInputs,
  lpCapital: number,
  gpCapital: number,
  totalCapitalCalled: number,
): WaterfallData {
  const { totalProceeds, hurdleRate, carryPercentage, catchUpRate, fundLife } =
    inputs;

  const tiers: WaterfallTier[] = [];
  let remaining = totalProceeds;

  // Tier 1: Return of Capital
  const rocLP = Math.min(lpCapital, remaining);
  const rocGP = Math.min(gpCapital, Math.max(0, remaining - rocLP));
  remaining -= rocLP + rocGP;
  tiers.push({
    name: "Return of Capital",
    lpAmount: rocLP,
    gpAmount: rocGP,
    description: "LPs and GP receive back their invested capital",
  });

  if (remaining <= 0) {
    return buildWaterfallResult(
      tiers,
      lpCapital,
      gpCapital,
      totalCapitalCalled,
      inputs,
    );
  }

  // Tier 2: Preferred Return (Hurdle)
  const preferredReturnLP =
    lpCapital * (Math.pow(1 + hurdleRate, fundLife) - 1);
  const preferredLP = Math.min(preferredReturnLP, remaining);
  remaining -= preferredLP;

  const preferredReturnGP =
    gpCapital * (Math.pow(1 + hurdleRate, fundLife) - 1);
  const preferredGP = Math.min(preferredReturnGP, remaining);
  remaining -= preferredGP;

  tiers.push({
    name: "Preferred Return",
    lpAmount: preferredLP,
    gpAmount: preferredGP,
    description: `LPs and GP earn ${(hurdleRate * 100).toFixed(1)}% annualized preferred return on their capital`,
  });

  if (remaining <= 0) {
    return buildWaterfallResult(
      tiers,
      lpCapital,
      gpCapital,
      totalCapitalCalled,
      inputs,
    );
  }

  // Tier 3: GP Catch-Up
  //
  // Correct derivation: let P = catch-up pool, c = catchUpRate,
  // k = carryPercentage, R = remaining before catch-up,
  // F = totalFundProfit = totalProceeds - fundSize.
  //
  //   Total GP carry = P·c + (R - P)·k = k · F
  //   Solving for P:  P = k · (F - R) / (c - k)
  //                     = k · totalFundProfit / (c - k)
  //
  // Note: (F - R) = profit already distributed above capital (Tier 2 pref),
  // but targeting k·F (not k·prefPaid) is the correct nominal carry basis.
  // This ensures: effective carry ≡ carryPercentage over totalFundProfit.
  //
  const totalFundProfit = Math.max(0, totalProceeds - inputs.fundSize);
  const totalPrefPaid = preferredLP + preferredGP;
  let gpCatchUp = 0;
  let lpDuringCatchUp = 0;

  // Derivation: GP target carry = k·F where F = totalFundProfit.
  // GP carry = C·c + (F - P - C)·k where C = catchup pool, c = catchUpRate,
  // P = totalPrefPaid. Solving C·c + k(F - P - C) = k·F gives:
  //   C = k·P / (c - k)
  // (totalPrefPaid is the correct numerator, not totalFundProfit.)
  const effectiveCatchUpRate = catchUpRate || 0;
  if (effectiveCatchUpRate > carryPercentage && totalPrefPaid > 0) {
    const catchUpPool = Math.min(
      (carryPercentage * totalPrefPaid) /
        (effectiveCatchUpRate - carryPercentage),
      remaining,
    );
    gpCatchUp = catchUpPool * effectiveCatchUpRate;
    lpDuringCatchUp = catchUpPool * (1 - effectiveCatchUpRate);
    remaining -= catchUpPool;
  }

  tiers.push({
    name: "GP Catch-Up",
    lpAmount: lpDuringCatchUp,
    gpAmount: gpCatchUp,
    description: `GP catches up to ${(carryPercentage * 100).toFixed(0)}% carry on all profits`,
  });

  if (remaining <= 0) {
    return buildWaterfallResult(
      tiers,
      lpCapital,
      gpCapital,
      totalCapitalCalled,
      inputs,
    );
  }

  // Tier 4: Carried Interest Split
  const gpCarrySplit = remaining * carryPercentage;
  const lpCarrySplit = remaining * (1 - carryPercentage);
  tiers.push({
    name: "Carried Interest Split",
    lpAmount: lpCarrySplit,
    gpAmount: gpCarrySplit,
    description: `${(carryPercentage * 100).toFixed(0)}% to GP, ${((1 - carryPercentage) * 100).toFixed(0)}% to LPs`,
  });

  return buildWaterfallResult(
    tiers,
    lpCapital,
    gpCapital,
    totalCapitalCalled,
    inputs,
  );
}

function calculateAmericanWaterfall(
  inputs: FundInputs,
  lpCapital: number,
  gpCapital: number,
  totalCapitalCalled: number,
): WaterfallData {
  const {
    dealMultiples,
    fundSize,
    hurdleRate,
    carryPercentage,
    catchUpRate,
    gpCommitment,
    fundLife,
  } = inputs;

  const numDeals = dealMultiples.length;
  const capitalPerDeal = numDeals > 0 ? (fundSize * (1 - 0.15)) / numDeals : 0;
  const lpShare = 1 - gpCommitment;

  const tiers: WaterfallTier[] = [
    {
      name: "Return of Capital",
      lpAmount: 0,
      gpAmount: 0,
      description: "Per-deal capital return",
    },
    {
      name: "Preferred Return",
      lpAmount: 0,
      gpAmount: 0,
      description: "Per-deal preferred return",
    },
    {
      name: "GP Catch-Up",
      lpAmount: 0,
      gpAmount: 0,
      description: "Per-deal catch-up",
    },
    {
      name: "Carried Interest Split",
      lpAmount: 0,
      gpAmount: 0,
      description: "Per-deal carry split",
    },
  ];

  dealMultiples.forEach((multiple) => {
    const dealProceeds = capitalPerDeal * multiple;
    const dealLPCapital = capitalPerDeal * lpShare;
    let dealRemaining = dealProceeds;

    // Tier 1: Return of Capital
    const roc = Math.min(capitalPerDeal, dealRemaining);
    tiers[0].lpAmount += roc * lpShare;
    tiers[0].gpAmount += roc * gpCommitment;
    dealRemaining -= roc;

    if (dealRemaining <= 0) return;

    // Tier 2: Preferred Return on LP capital
    const holdPeriod =
      inputs.avgHoldPeriod && inputs.avgHoldPeriod > 0
        ? inputs.avgHoldPeriod
        : fundLife;
    const pref = dealLPCapital * (Math.pow(1 + hurdleRate, holdPeriod) - 1);
    const prefPaid = Math.min(pref, dealRemaining);
    tiers[1].lpAmount += prefPaid;
    dealRemaining -= prefPaid;

    if (dealRemaining <= 0) return;

    // Tiers 3 & 4: Catch-Up then Carried Interest Split
    //
    // FIX (Issue 3): The prior code set catch-up pool = targetCarry/catchUpRate,
    // where targetCarry = dealProfit * carryPct. This ignored the fact that
    // Tier 4 also pays GP carryPct of the remaining pool, producing a
    // compounding overstatement (e.g. 42% effective carry vs 25% nominal).
    //
    // Same identity as European waterfall applies per deal:
    //   GP carry = P·c + (remaining - P)·k = dealProfit·k
    //   → P = k · prefPaid / (c - k)
    //
    // where prefPaid is the LP pref actually paid this deal.
    // Constraint: effective per-deal carry ≡ carryPercentage (when c > k).
    //
    const dealProfit = dealProceeds - capitalPerDeal;
    if (dealProfit > 0) {
      if (catchUpRate > carryPercentage && prefPaid > 0) {
        const catchUpPool = Math.min(
          (carryPercentage * prefPaid) / (catchUpRate - carryPercentage),
          dealRemaining,
        );
        tiers[2].gpAmount += catchUpPool * catchUpRate;
        tiers[2].lpAmount += catchUpPool * (1 - catchUpRate);
        dealRemaining -= catchUpPool;
      }

      if (dealRemaining > 0) {
        tiers[3].gpAmount += dealRemaining * carryPercentage;
        tiers[3].lpAmount += dealRemaining * (1 - carryPercentage);
      }
    } else {
      // Loss deal: any remaining after pref shortfall returns to LPs
      if (dealRemaining > 0) {
        tiers[3].lpAmount += dealRemaining;
      }
    }
  });

  return buildWaterfallResult(
    tiers,
    lpCapital,
    gpCapital,
    totalCapitalCalled,
    inputs,
  );
}

function buildWaterfallResult(
  tiers: WaterfallTier[],
  lpCapital: number,
  gpCapital: number,
  totalCapitalCalled: number,
  inputs: FundInputs,
): WaterfallData {
  const totalLP = tiers.reduce((s, t) => s + t.lpAmount, 0);
  const totalGP = tiers.reduce((s, t) => s + t.gpAmount, 0);
  const gpCarry = tiers.slice(2).reduce((s, t) => s + t.gpAmount, 0);

  const totalProfit = totalLP + totalGP - (lpCapital + gpCapital);
  const effectiveCarryPct = totalProfit > 0 ? gpCarry / totalProfit : 0;

  const lpNetMultiple = lpCapital > 0 ? totalLP / lpCapital : 0;
  const gpNetMultiple = gpCapital > 0 ? totalGP / gpCapital : 0;

  const fundLife = inputs.fundLife || 10;
  const lpCashFlows = [-lpCapital, ...Array(fundLife - 1).fill(0), totalLP];
  const lpIRR = calculateIRR(lpCashFlows);

  return {
    tiers,
    totalLP,
    totalGP,
    gpCarry,
    lpNetMultiple,
    gpNetMultiple,
    lpIRR,
    effectiveCarryPct,
    totalCapitalCalled,
  };
}
