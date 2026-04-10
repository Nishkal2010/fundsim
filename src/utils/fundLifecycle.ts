import type { FundInputs, LifecycleData, YearlyData } from "../types/fund";

export function calculateLifecycle(inputs: FundInputs): LifecycleData {
  const { fundSize, fundLife, investmentPeriod, managementFee } = inputs;

  // During investment period: fee on committed capital
  const investmentPeriodFees = managementFee * fundSize * investmentPeriod;

  // Estimate net investable capital
  const netInvestableCapital = fundSize - investmentPeriodFees;

  // Harvest period: fees on declining invested capital
  let remainingInvested = netInvestableCapital;
  const harvestYears = fundLife - investmentPeriod;
  const exitPerYear =
    harvestYears > 0
      ? netInvestableCapital / harvestYears
      : netInvestableCapital;
  let harvestFees = 0;
  for (let y = investmentPeriod + 1; y <= fundLife; y++) {
    harvestFees += managementFee * remainingInvested;
    remainingInvested = Math.max(0, remainingInvested - exitPerYear);
  }

  const totalFees = investmentPeriodFees + harvestFees;
  const finalNetInvestable = fundSize - totalFees;
  const annualDeployment = finalNetInvestable / investmentPeriod;

  const years: YearlyData[] = [];
  let cumulativeDeployed = 0;
  let cumulativeCalledForDeployment = 0;

  for (let year = 1; year <= fundLife; year++) {
    let mgmtFee: number;
    let capitalDeployed: number;

    if (year <= investmentPeriod) {
      mgmtFee = managementFee * fundSize;
      capitalDeployed = annualDeployment;
    } else {
      // Step-down: fee on remaining invested capital
      const remainingAtYearStart =
        finalNetInvestable -
        (year - investmentPeriod - 1) *
          (finalNetInvestable / (fundLife - investmentPeriod));
      mgmtFee = managementFee * Math.max(0, remainingAtYearStart);
      capitalDeployed = 0;
    }

    cumulativeDeployed += capitalDeployed;
    const capitalCalled = mgmtFee + capitalDeployed;
    cumulativeCalledForDeployment += capitalCalled;
    const remainingCommitment = Math.max(
      0,
      fundSize - cumulativeCalledForDeployment,
    );

    years.push({
      year,
      capitalCalled,
      mgmtFee,
      capitalDeployed,
      cumulativeDeployed,
      remainingCommitment,
    });
  }

  const capitalEfficiency = finalNetInvestable / fundSize;

  return {
    years,
    totalMgmtFees: totalFees,
    netInvestableCapital: finalNetInvestable,
    capitalEfficiency,
  };
}
