export interface FundInputs {
  fundSize: number; // in millions
  fundLife: number; // years
  investmentPeriod: number; // years
  managementFee: number; // decimal (0.02 = 2%)
  carryPercentage: number; // decimal (0.20 = 20%)
  hurdleRate: number; // decimal (0.08 = 8%)
  gpCommitment: number; // decimal (0.02 = 2%)
  avgHoldPeriod: number;
  lossRatio: number; // decimal
  avgExitMultiple: number;
  exitDistribution: "bell" | "backloaded" | "even";
  totalProceeds: number; // millions
  waterfallType: "european" | "american";
  catchUpRate: number; // decimal
  clawback: boolean;
  dealMultiples: number[]; // 5 deal multiples for American waterfall
  spReturn: number; // S&P benchmark annual return decimal
  // Portfolio construction
  numDeals: number;
  followOnReservePercent: number; // decimal (0.20 = 20%)
  fundStrategy: "buyout" | "growth" | "venture";
  vintageYear: number;
}

export interface YearlyData {
  year: number;
  capitalCalled: number;
  mgmtFee: number;
  capitalDeployed: number;
  cumulativeDeployed: number;
  remainingCommitment: number;
}

export interface LifecycleData {
  years: YearlyData[];
  totalMgmtFees: number;
  netInvestableCapital: number;
  capitalEfficiency: number;
}

export interface JCurvePoint {
  year: number;
  netCashFlow: number; // cumulative net cash to LPs as % of committed
  nav: number; // NAV as % of committed
  distributions: number; // cumulative distributions
  capitalCalled: number; // cumulative capital called
}

export interface JCurveData {
  points: JCurvePoint[];
  breakevenYear: number | null;
  troughYear: number;
  troughValue: number;
  finalNetMultiple: number;
  netIRR: number | null;
}

export interface WaterfallTier {
  name: string;
  lpAmount: number;
  gpAmount: number;
  description: string;
}

export interface WaterfallData {
  tiers: WaterfallTier[];
  totalLP: number;
  totalGP: number;
  gpCarry: number;
  lpNetMultiple: number;
  gpNetMultiple: number;
  lpIRR: number | null;
  effectiveCarryPct: number;
  totalCapitalCalled: number;
}

export interface PerformanceData {
  dpi: number;
  rvpi: number;
  tvpi: number;
  netIRR: number | null;
  grossMOIC: number;
  netMOIC: number;
  pme: number;
  ksPME: number;
  dpiOverTime: Array<{ year: number; dpi: number; rvpi: number; tvpi: number }>;
  quartile: "top" | "upper-mid" | "lower-mid" | "bottom";
  sensitivityMatrix: Array<
    Array<{ exitMultiple: number; lossRatio: number; irr: number | null }>
  >;
}

// ── Portfolio ──────────────────────────────────────────────────────────────

export interface PortfolioCompany {
  id: number;
  name: string;
  sector: string;
  stage: "seed" | "early" | "growth" | "buyout";
  initialCheck: number;
  followOnCapital: number;
  totalInvested: number;
  currentValue: number;
  realizedValue: number;
  currentMOIC: number;
  status: "unrealized" | "realized" | "written-off" | "partial-exit";
  investYear: number;
  exitYear: number | null;
}

export interface PortfolioData {
  companies: PortfolioCompany[];
  totalInvested: number;
  reserveCapital: number;
  totalCurrentValue: number;
  totalRealizedValue: number;
  grossMOIC: number;
  dpi: number;
  rvpi: number;
  tvpi: number;
  concentrationTop3Pct: number;
  winnerCount: number;
  loserCount: number;
  zombieCount: number;
  sectorBreakdown: Array<{
    sector: string;
    invested: number;
    currentValue: number;
  }>;
  moicBuckets: Array<{ label: string; count: number }>;
}

// ── LBO ────────────────────────────────────────────────────────────────────

export interface LBOInputs {
  entryEBITDA: number;
  entryMultiple: number;
  debtPercent: number;
  interestRate: number;
  ebitdaGrowthRate: number;
  exitMultiple: number;
  holdYears: number;
  fcfConversion: number;
  mandatoryAmortization: number;
}

export interface LBODebtYear {
  year: number;
  beginningDebt: number;
  interest: number;
  amortization: number;
  endingDebt: number;
  ebitda: number;
  ev: number;
  equity: number;
  moic: number;
  debtToEBITDA: number;
}

export interface LBOData {
  entryEV: number;
  entryEquity: number;
  entryDebt: number;
  debtSchedule: LBODebtYear[];
  exitEV: number;
  exitDebt: number;
  exitEquity: number;
  grossMOIC: number;
  grossIRR: number | null;
  valueCreation: {
    multipleExpansion: number;
    ebitdaGrowth: number;
    debtPaydown: number;
    total: number;
  };
  sensitivityGrid: Array<{
    exitMult: number;
    growthRate: number;
    moic: number;
    irr: number | null;
  }>;
}

// ── VC Cap Table ────────────────────────────────────────────────────────────

export interface VCRoundInput {
  name: string;
  preMoney: number;
  raise: number;
  optionPoolTopUp: number;
  liquidationPref: number;
  participating: boolean;
  enabled: boolean;
}

export interface VCRoundSnapshot {
  roundName: string;
  preMoneyValuation: number;
  newInvestment: number;
  postMoneyValuation: number;
  pricePerShare: number;
  newSharesIssued: number;
  optionSharesIssued: number;
  totalSharesAfter: number;
  founderOwnershipPct: number;
  esopPct: number;
  newInvestorPct: number;
  prevInvestorsPct: number;
  cumulativeRaised: number;
  investorCost: number;
}

export interface VCExitScenario {
  exitValuation: number;
  label: string;
  founderProceeds: number;
  esopProceeds: number;
  investorsByRound: Array<{
    round: string;
    cost: number;
    proceeds: number;
    moic: number;
  }>;
  totalInvestorProceeds: number;
  totalInvestorMOIC: number;
}

export interface VCData {
  rounds: VCRoundSnapshot[];
  founderShares: number;
  esopShares: number;
  currentFounderOwnershipPct: number;
  currentESOPPct: number;
  currentTotalRaised: number;
  fullyDilutedShares: number;
  exitScenarios: VCExitScenario[];
}

export interface FundModel {
  inputs: FundInputs;
  setInput: <K extends keyof FundInputs>(key: K, value: FundInputs[K]) => void;
  lifecycle: LifecycleData;
  jCurve: JCurveData;
  waterfall: WaterfallData;
  performance: PerformanceData;
  portfolio: PortfolioData;
}
