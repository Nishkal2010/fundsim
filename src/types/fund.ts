export interface FundInputs {
  fundSize: number;          // in millions
  fundLife: number;          // years
  investmentPeriod: number;  // years
  managementFee: number;     // decimal (0.02 = 2%)
  carryPercentage: number;   // decimal (0.20 = 20%)
  hurdleRate: number;        // decimal (0.08 = 8%)
  gpCommitment: number;      // decimal (0.02 = 2%)
  avgHoldPeriod: number;
  lossRatio: number;         // decimal
  avgExitMultiple: number;
  exitDistribution: 'bell' | 'backloaded' | 'even';
  totalProceeds: number;     // millions
  waterfallType: 'european' | 'american';
  catchUpRate: number;       // decimal
  clawback: boolean;
  dealMultiples: number[];   // 5 deal multiples for American waterfall
  spReturn: number;          // S&P benchmark annual return decimal
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
  netCashFlow: number;       // cumulative net cash to LPs as % of committed
  nav: number;               // NAV as % of committed
  distributions: number;     // cumulative distributions
  capitalCalled: number;     // cumulative capital called
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
  dpiOverTime: Array<{ year: number; dpi: number; rvpi: number; tvpi: number }>;
  quartile: 'top' | 'upper-mid' | 'lower-mid' | 'bottom';
  sensitivityMatrix: Array<Array<{ exitMultiple: number; lossRatio: number; irr: number | null }>>;
}

export interface FundModel {
  inputs: FundInputs;
  setInput: <K extends keyof FundInputs>(key: K, value: FundInputs[K]) => void;
  lifecycle: LifecycleData;
  jCurve: JCurveData;
  waterfall: WaterfallData;
  performance: PerformanceData;
}
