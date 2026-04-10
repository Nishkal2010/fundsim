import type { FundInputs, LifecycleData, YearlyData } from "../types/fund";

export function calculateLifecycle(inputs: FundInputs): LifecycleData {
  // NOTE: inputs.clawback is defined in FundInputs but is not implemented in this
  // function. Clawback logic (GP returning excess carry to LPs) is not yet modelled
  // here; it would need to be applied in the waterfall calculation instead.
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
  const annualDeployment =
    investmentPeriod > 0 ? finalNetInvestable / investmentPeriod : 0;

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
          (fundLife > investmentPeriod
            ? finalNetInvestable / (fundLife - investmentPeriod)
            : 0);
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

  // Recompute totalMgmtFees as the exact sum of per-year mgmtFee values so that
  // totalMgmtFees is always consistent with what the years[] array reports.
  // The pre-loop harvestFees estimate used netInvestableCapital as the base, while
  // per-year harvest mgmtFee uses finalNetInvestable — summing here reconciles the two.
  const totalMgmtFees = years.reduce((sum, y) => sum + y.mgmtFee, 0);

  const capitalEfficiency = fundSize > 0 ? finalNetInvestable / fundSize : 0;

  return {
    years,
    totalMgmtFees,
    netInvestableCapital: finalNetInvestable,
    capitalEfficiency,
  };
}
