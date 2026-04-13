import type {
  FundInputs,
  PortfolioCompany,
  PortfolioData,
} from "../types/fund";

const SECTORS_BY_STRATEGY: Record<string, string[]> = {
  buyout: [
    "Industrials",
    "Healthcare",
    "Consumer",
    "Technology",
    "Business Services",
    "Financial Services",
    "Energy",
  ],
  growth: [
    "SaaS",
    "Healthcare IT",
    "Fintech",
    "Consumer Tech",
    "E-Commerce",
    "EdTech",
    "Cybersecurity",
  ],
  venture: [
    "SaaS",
    "Fintech",
    "AI/ML",
    "Biotech",
    "Consumer",
    "Web3",
    "Deep Tech",
    "Climate Tech",
  ],
};

const CO_NAMES = [
  "Apex",
  "Vertex",
  "Nexus",
  "Prism",
  "Orbit",
  "Helios",
  "Vega",
  "Zenith",
  "Crest",
  "Pinnacle",
  "Stratos",
  "Lumina",
  "Axiom",
  "Cobalt",
  "Delphi",
  "Epoch",
  "Fulcrum",
  "Gradiant",
  "Harbor",
  "Inflect",
  "Jasper",
  "Kestrel",
  "Lattice",
  "Mosaic",
  "Nova",
  "Onyx",
  "Paragon",
  "Quorum",
  "Radiant",
];

// Deterministic pseudo-random seeded on fund params
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function calculatePortfolio(inputs: FundInputs): PortfolioData {
  const {
    fundSize,
    fundLife,
    investmentPeriod,
    lossRatio,
    avgExitMultiple,
    avgHoldPeriod,
    numDeals,
    followOnReservePercent,
    fundStrategy,
    gpCommitment,
    vintageYear,
  } = inputs;

  const rand = seededRand(
    Math.round(
      fundSize * 100 + numDeals * 7 + lossRatio * 1000 + avgExitMultiple * 13,
    ),
  );

  const deployableFund = fundSize * (1 - gpCommitment);
  const reserveCapital = deployableFund * followOnReservePercent;
  const initialCheckPool = deployableFund - reserveCapital;
  const avgInitialCheck = numDeals > 0 ? initialCheckPool / numDeals : 0;
  const sectors =
    SECTORS_BY_STRATEGY[fundStrategy] ?? SECTORS_BY_STRATEGY.buyout;

  const numLosses = Math.round(numDeals * lossRatio);
  // Winners get higher multiples; assign a distribution
  const winnerCount = numDeals - numLosses;
  // "Zombie" companies break even or return <1x (10% of winners)
  const zombieCount = Math.max(0, Math.round(winnerCount * 0.15));
  const trueWinners = winnerCount - zombieCount;

  // Build companies
  const companies: PortfolioCompany[] = [];
  for (let i = 0; i < numDeals; i++) {
    const isLoss = i < numLosses;
    const isZombie = !isLoss && i < numLosses + zombieCount;

    // Spread invest years across investment period
    const investYear = Math.max(
      1,
      Math.ceil(((i + 1) / numDeals) * investmentPeriod),
    );
    // Hold period: vary around avgHoldPeriod
    const holdVariance = (rand() - 0.5) * 2; // ±1 year
    const holdPeriod = Math.round(Math.max(2, avgHoldPeriod + holdVariance));
    const exitYear = Math.min(fundLife, investYear + holdPeriod);

    // Check size: vary ±30% around average
    const checkSizeMultiplier = 0.7 + rand() * 0.6;
    const initialCheck = avgInitialCheck * checkSizeMultiplier;
    // Follow-on: 0-50% of initial check, zero for losses
    const followOnCapital = isLoss ? 0 : initialCheck * rand() * 0.5;
    const totalInvested = initialCheck + followOnCapital;

    // MOIC
    let currentMOIC: number;
    if (isLoss) {
      currentMOIC = rand() * 0.2; // 0–0.2x write-off
    } else if (isZombie) {
      currentMOIC = 0.8 + rand() * 0.4; // 0.8–1.2x
    } else {
      // Winners: distribution around avgExitMultiple with variance
      const winnerIdx = i - numLosses - zombieCount;
      // Power law: top 20% of winners return 3x the average
      const isOutlier = winnerIdx >= trueWinners * 0.8;
      if (isOutlier) {
        currentMOIC = avgExitMultiple * (1.5 + rand() * 1.5);
      } else {
        currentMOIC = avgExitMultiple * (0.5 + rand() * 1.0);
      }
    }

    // Status: if exitYear <= current (vintageYear + investYear) → realized/written-off
    const currentFundYear = Math.min(
      fundLife,
      new Date().getFullYear() - vintageYear,
    );
    const hasExited = exitYear <= currentFundYear;

    let status: PortfolioCompany["status"];
    if (hasExited) {
      status = isLoss
        ? "written-off"
        : currentMOIC < 1.1
          ? "partial-exit"
          : "realized";
    } else {
      status = "unrealized";
    }

    const currentValue = hasExited ? 0 : totalInvested * currentMOIC;
    const realizedValue = hasExited ? totalInvested * currentMOIC : 0;

    const sector = sectors[Math.floor(rand() * sectors.length)];
    const stage: PortfolioCompany["stage"] =
      fundStrategy === "venture"
        ? i < numDeals * 0.3
          ? "seed"
          : i < numDeals * 0.6
            ? "early"
            : "growth"
        : fundStrategy === "growth"
          ? "growth"
          : "buyout";

    companies.push({
      id: i + 1,
      name: CO_NAMES[i % CO_NAMES.length],
      sector,
      stage,
      initialCheck: parseFloat(initialCheck.toFixed(2)),
      followOnCapital: parseFloat(followOnCapital.toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      realizedValue: parseFloat(realizedValue.toFixed(2)),
      currentMOIC: parseFloat(currentMOIC.toFixed(2)),
      status,
      investYear,
      exitYear: hasExited ? exitYear : null,
    });
  }

  // Aggregate metrics
  const totalInvested = companies.reduce((s, c) => s + c.totalInvested, 0);
  const totalCurrentValue = companies.reduce((s, c) => s + c.currentValue, 0);
  const totalRealizedValue = companies.reduce((s, c) => s + c.realizedValue, 0);
  const totalValue = totalCurrentValue + totalRealizedValue;
  const grossMOIC = totalInvested > 0 ? totalValue / totalInvested : 0;

  const dpi = totalInvested > 0 ? totalRealizedValue / totalInvested : 0;
  const rvpi = totalInvested > 0 ? totalCurrentValue / totalInvested : 0;
  const tvpi = dpi + rvpi;

  // Concentration: top 3 positions by current value
  const sorted = [...companies].sort(
    (a, b) =>
      b.currentValue + b.realizedValue - (a.currentValue + a.realizedValue),
  );
  const top3Value = sorted
    .slice(0, 3)
    .reduce((s, c) => s + c.currentValue + c.realizedValue, 0);
  const concentrationTop3Pct = totalValue > 0 ? top3Value / totalValue : 0;

  // Sector breakdown
  const sectorMap = new Map<
    string,
    { invested: number; currentValue: number }
  >();
  companies.forEach((c) => {
    const existing = sectorMap.get(c.sector) ?? {
      invested: 0,
      currentValue: 0,
    };
    sectorMap.set(c.sector, {
      invested: existing.invested + c.totalInvested,
      currentValue: existing.currentValue + c.currentValue + c.realizedValue,
    });
  });
  const sectorBreakdown = Array.from(sectorMap.entries())
    .map(([sector, data]) => ({ sector, ...data }))
    .sort((a, b) => b.invested - a.invested);

  // MOIC distribution buckets
  const bucketDefs = [
    { label: "0–0.5x", min: 0, max: 0.5 },
    { label: "0.5–1x", min: 0.5, max: 1 },
    { label: "1–2x", min: 1, max: 2 },
    { label: "2–3x", min: 2, max: 3 },
    { label: "3–5x", min: 3, max: 5 },
    { label: "5x+", min: 5, max: Infinity },
  ];
  const moicBuckets = bucketDefs.map((b) => ({
    label: b.label,
    count: companies.filter(
      (c) => c.currentMOIC >= b.min && c.currentMOIC < b.max,
    ).length,
  }));

  const actualWinners = companies.filter((c) => c.currentMOIC >= 2).length;
  const actualLosers = companies.filter((c) => c.currentMOIC < 0.5).length;
  const actualZombies = companies.filter(
    (c) => c.currentMOIC >= 0.5 && c.currentMOIC < 1.5,
  ).length;

  return {
    companies,
    totalInvested,
    reserveCapital,
    totalCurrentValue,
    totalRealizedValue,
    grossMOIC,
    dpi,
    rvpi,
    tvpi,
    concentrationTop3Pct,
    winnerCount: actualWinners,
    loserCount: actualLosers,
    zombieCount: actualZombies,
    sectorBreakdown,
    moicBuckets,
  };
}
