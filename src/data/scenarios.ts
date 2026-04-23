import type { FundInputs } from "../types/fund";

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  inputs: Partial<FundInputs>;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "conservative",
    name: "Conservative Fund",
    description: "Lower risk, moderate returns. Typical mid-market buyout.",
    emoji: "🛡️",
    inputs: {
      fundSize: 50,
      fundLife: 10,
      investmentPeriod: 5,
      managementFee: 0.015,
      carryPercentage: 0.15,
      hurdleRate: 0.08,
      gpCommitment: 0.02,
      avgExitMultiple: 2.0,
      lossRatio: 0.2,
      avgHoldPeriod: 5,
      totalProceeds: 90,
      waterfallType: "european",
      catchUpRate: 1.0,
      spReturn: 0.08,
    },
  },
  {
    id: "aggressive",
    name: "Aggressive Growth",
    description:
      "High conviction, concentrated portfolio. Targets top-quartile returns.",
    emoji: "🚀",
    inputs: {
      fundSize: 200,
      fundLife: 10,
      investmentPeriod: 4,
      managementFee: 0.02,
      carryPercentage: 0.25,
      hurdleRate: 0.06,
      gpCommitment: 0.03,
      avgExitMultiple: 4.0,
      lossRatio: 0.35,
      avgHoldPeriod: 4,
      totalProceeds: 600,
      waterfallType: "american",
      catchUpRate: 1.0,
      spReturn: 0.1,
    },
  },
  {
    id: "venture",
    name: "Venture Fund",
    description:
      "Power law returns. High loss ratio offset by unicorn outcomes.",
    emoji: "⚡",
    inputs: {
      fundSize: 100,
      fundLife: 12,
      investmentPeriod: 5,
      managementFee: 0.025,
      carryPercentage: 0.2,
      hurdleRate: 0.0,
      gpCommitment: 0.01,
      avgExitMultiple: 5.0,
      lossRatio: 0.5,
      avgHoldPeriod: 7,
      totalProceeds: 350,
      waterfallType: "european",
      catchUpRate: 0,
      spReturn: 0.1,
    },
  },
  {
    id: "mega-buyout",
    name: "Mega Buyout",
    description: "Large-cap buyout. Leverage-driven returns, lower loss rates.",
    emoji: "🏦",
    inputs: {
      fundSize: 500,
      fundLife: 10,
      investmentPeriod: 5,
      managementFee: 0.0175,
      carryPercentage: 0.2,
      hurdleRate: 0.08,
      gpCommitment: 0.02,
      avgExitMultiple: 2.5,
      lossRatio: 0.15,
      avgHoldPeriod: 5,
      totalProceeds: 1100,
      waterfallType: "european",
      catchUpRate: 1.0,
      spReturn: 0.09,
    },
  },
  {
    id: "first-time-fund",
    name: "First-Time Fund",
    description:
      "Emerging manager. Smaller size, higher hurdle to build track record.",
    emoji: "🌱",
    inputs: {
      fundSize: 30,
      fundLife: 10,
      investmentPeriod: 4,
      managementFee: 0.02,
      carryPercentage: 0.2,
      hurdleRate: 0.1,
      gpCommitment: 0.05,
      avgExitMultiple: 2.5,
      lossRatio: 0.3,
      avgHoldPeriod: 5,
      totalProceeds: 65,
      waterfallType: "european",
      catchUpRate: 1.0,
      spReturn: 0.09,
    },
  },
];
