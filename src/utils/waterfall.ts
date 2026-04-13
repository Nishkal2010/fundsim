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
  const {
    totalProceeds,
    hurdleRate,
    carryPercentage,
    catchUpRate,
    fundLife,
    gpCommitment,
  } = inputs;

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
  // LPs receive their preferred return first; GP then receives its own preferred
  // return on gpCapital at the same hurdle rate before any carry is computed.
  const preferredReturnLP =
    lpCapital * (Math.pow(1 + hurdleRate, fundLife) - 1);
  const preferredLP = Math.min(preferredReturnLP, remaining);
  remaining -= preferredLP;

  // GP preferred return on GP's own committed capital (Bug 2 fix)
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

  // Tier 3: GP Catch-Up — carry is on LP profits only, not GP's own gains
  const lpShare = 1 - gpCommitment;
  const lpProfits = totalProceeds * lpShare - lpCapital;
  const targetGPCarry = Math.max(0, lpProfits * carryPercentage);

  let gpCatchUp = 0;
  let lpDuringCatchUp = 0;

  const effectiveCatchUpRate = catchUpRate || 0;
  if (effectiveCatchUpRate > 0 && targetGPCarry > 0) {
    const catchUpTotal = targetGPCarry / effectiveCatchUpRate;
    const actualCatchUpPool = Math.min(catchUpTotal, remaining);
    gpCatchUp = actualCatchUpPool * effectiveCatchUpRate;
    lpDuringCatchUp = actualCatchUpPool * (1 - effectiveCatchUpRate);
    remaining -= actualCatchUpPool;
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

  // Bug 1 fix: if there was no GP carry target (profits didn't exceed LP
  // preferred return), skip Tier 4 entirely — otherwise GP would receive
  // carry on proceeds that haven't cleared the hurdle.
  if (targetGPCarry <= 0) {
    // All remaining proceeds belong to LPs (below-hurdle profits)
    tiers.push({
      name: "Carried Interest Split",
      lpAmount: remaining,
      gpAmount: 0,
      description: "No carry earned — profits did not exceed hurdle",
    });
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
  const capitalPerDeal = numDeals > 0 ? (fundSize * (1 - 0.15)) / numDeals : 0; // ~85% deployed
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

    // Tier 1
    const roc = Math.min(capitalPerDeal, dealRemaining);
    tiers[0].lpAmount += roc * lpShare;
    tiers[0].gpAmount += roc * gpCommitment;
    dealRemaining -= roc;

    if (dealRemaining <= 0) return;

    // Tier 2
    // Guard against undefined/0 avgHoldPeriod to avoid NaN in Math.pow.
    // Fall back to fundLife so the preferred return is still economically
    // meaningful when hold-period data is absent. (Bug 6 fix)
    const holdPeriod =
      inputs.avgHoldPeriod && inputs.avgHoldPeriod > 0
        ? inputs.avgHoldPeriod
        : fundLife;
    const pref = dealLPCapital * (Math.pow(1 + hurdleRate, holdPeriod) - 1);
    const prefPaid = Math.min(pref, dealRemaining);
    tiers[1].lpAmount += prefPaid;
    dealRemaining -= prefPaid;

    if (dealRemaining <= 0) return;

    // Tier 3 & 4
    // NOTE (Bug 4): American waterfall carry base = total deal profit
    // (dealProceeds - capitalPerDeal), which includes both LP and GP capital
    // gains. European waterfall uses LP-only profits as the carry base
    // (totalProceeds * lpShare - lpCapital). The two approaches are
    // intentionally different: American carry is deal-by-deal on gross profit;
    // European carry is fund-level on net LP profit. This is standard market
    // practice for each structure but creates an apples-to-oranges comparison.
    const dealProfit = dealProceeds - capitalPerDeal;
    if (dealProfit > 0) {
      const targetCarry = dealProfit * carryPercentage;
      if (catchUpRate > 0) {
        const catchUpPool = Math.min(targetCarry / catchUpRate, dealRemaining);
        tiers[2].gpAmount += catchUpPool * catchUpRate;
        tiers[2].lpAmount += catchUpPool * (1 - catchUpRate);
        dealRemaining -= catchUpPool;
      }

      if (dealRemaining > 0) {
        tiers[3].gpAmount += dealRemaining * carryPercentage;
        tiers[3].lpAmount += dealRemaining * (1 - carryPercentage);
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

  // Approximate LP IRR using a bullet-return assumption: all LP proceeds are
  // modelled as a single cash inflow at year `fundLife`, with zero interim
  // distributions. This understates the true IRR whenever actual distributions
  // occur before the final year (earlier cash flows have higher time-value).
  // Bug 3: bias direction documented above.
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
