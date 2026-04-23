export interface MarketSizingInputs {
  // Top-down
  globalAddressableMarket: number; // $B
  targetGeographyPct: number; // 0-1
  targetSegmentPct: number; // 0-1
  realisticSharePct: number; // 0-1

  // Bottom-up
  totalTargetCustomers: number;
  avgRevenuePerCustomer: number; // $/year
  conversionRate: number; // 0-1

  // Market dynamics
  marketGrowthRate: number; // annual %
  yearsToModel: number; // 1-10

  approach: "top-down" | "bottom-up" | "both";
}

export interface MarketSizingResult {
  tam: number; // Total Addressable Market ($M)
  sam: number; // Serviceable Addressable Market ($M)
  som: number; // Serviceable Obtainable Market ($M)

  tamBottomUp: number;
  samBottomUp: number;
  somBottomUp: number;

  projections: Array<{
    year: number;
    tam: number;
    sam: number;
    som: number;
    revenue: number; // at current market share
  }>;

  vcViability: "Excellent" | "Good" | "Marginal" | "Too Small";
  vcViabilityReason: string;
  marketTimingScore: number; // 0-100
  marketTimingLabel: string;
}

function getVcViability(tamM: number): {
  viability: MarketSizingResult["vcViability"];
  reason: string;
} {
  if (tamM > 10_000) {
    return {
      viability: "Excellent",
      reason: `A $${(tamM / 1000).toFixed(0)}B TAM gives top-tier VCs room to fund multiple entrants and still generate fund-returning outcomes. Even at a 1% market share this can be a $100M+ revenue business.`,
    };
  }
  if (tamM >= 1_000) {
    return {
      viability: "Good",
      reason: `A $${(tamM / 1000).toFixed(1)}B TAM is attractive to most VCs. A category leader capturing 10-20% of the market can generate the $100M+ ARR needed for a large outcome.`,
    };
  }
  if (tamM >= 100) {
    return {
      viability: "Marginal",
      reason: `A $${tamM.toFixed(0)}M TAM is tight for institutional VC. At typical market shares the revenue ceiling makes it hard to return a fund. Niche or bootstrapped strategies may be more appropriate.`,
    };
  }
  return {
    viability: "Too Small",
    reason: `A TAM under $100M rarely justifies VC investment. Even full market capture can't return a $100M+ fund. Consider adjacent markets or a broader product thesis to expand the opportunity.`,
  };
}

function getMarketTiming(growthRate: number): { score: number; label: string } {
  if (growthRate > 50) return { score: 95, label: "Hypergrowth" };
  if (growthRate >= 20) return { score: 80, label: "Fast Growing" };
  if (growthRate >= 10) return { score: 60, label: "Steady Growth" };
  if (growthRate >= 5) return { score: 40, label: "Slow Growth" };
  return { score: 20, label: "Stagnant" };
}

export function calculateMarketSizing(
  inputs: MarketSizingInputs,
): MarketSizingResult {
  const {
    globalAddressableMarket,
    targetGeographyPct,
    targetSegmentPct,
    realisticSharePct,
    totalTargetCustomers,
    avgRevenuePerCustomer,
    conversionRate,
    marketGrowthRate,
    yearsToModel,
  } = inputs;

  // Top-down (convert $B -> $M)
  const tamTopDown = globalAddressableMarket * 1000; // $M
  const samTopDown = tamTopDown * targetGeographyPct * targetSegmentPct;
  const somTopDown = samTopDown * realisticSharePct;

  // Bottom-up ($M)
  const tamBottomUp =
    (totalTargetCustomers * avgRevenuePerCustomer) / 1_000_000;
  const samBottomUp = tamBottomUp * targetGeographyPct;
  const somBottomUp = tamBottomUp * conversionRate;

  // Select primary TAM/SAM/SOM based on approach
  const tam = inputs.approach === "bottom-up" ? tamBottomUp : tamTopDown;
  const sam = inputs.approach === "bottom-up" ? samBottomUp : samTopDown;
  const som = inputs.approach === "bottom-up" ? somBottomUp : somTopDown;

  // Projections
  const growthMultiplier = 1 + marketGrowthRate / 100;
  const projections = Array.from({ length: yearsToModel }, (_, i) => {
    const year = i + 1;
    const factor = Math.pow(growthMultiplier, year);
    const projTam = tam * factor;
    const projSam = sam * factor;
    const projSom = som * factor;
    // Revenue modeled as current SOM share maintained over growing market
    const revenue = projSom;
    return { year, tam: projTam, sam: projSam, som: projSom, revenue };
  });

  const { viability, reason } = getVcViability(tam);
  const { score, label } = getMarketTiming(marketGrowthRate);

  return {
    tam,
    sam,
    som,
    tamBottomUp,
    samBottomUp,
    somBottomUp,
    projections,
    vcViability: viability,
    vcViabilityReason: reason,
    marketTimingScore: score,
    marketTimingLabel: label,
  };
}

export const DEFAULT_MARKET_SIZING_INPUTS: MarketSizingInputs = {
  globalAddressableMarket: 50, // $50B
  targetGeographyPct: 0.1, // 10%
  targetSegmentPct: 0.05, // 5%
  realisticSharePct: 0.02, // 2%
  totalTargetCustomers: 50_000,
  avgRevenuePerCustomer: 10_000, // $10K ARR
  conversionRate: 0.03, // 3%
  marketGrowthRate: 25, // 25% annual
  yearsToModel: 5,
  approach: "both",
};
