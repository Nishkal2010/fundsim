import type { FundInputs, LifecycleData, YearlyData } from "../types/fund";

export function calculateLifecycle(inputs: FundInputs): LifecycleData {
  const { fundSize, fundLife, investmentPeriod, managementFee } = inputs;

  const harvestYears = fundLife - investmentPeriod;
  const investmentPeriodFees = managementFee * fundSize * investmentPeriod;

  // FIX (Issue 4): The prior code used a circular estimate:
  //   netInvestableCapital = fundSize - investmentPeriodFees  (uses fund size as harvest base)
  //   harvestFees = sum over harvest years using netInvestableCapital as base
  //   finalNetInvestable = fundSize - investmentPeriodFees - harvestFees
  //
  // But the per-year loop then used finalNetInvestable as the harvest fee base,
  // creating an inconsistency: fundSize - totalMgmtFees ≠ finalNetInvestable (~$0.32M
  // gap on a $100M fund). The two bases differ because the estimate and the actual
  // per-year loop used different starting values for the declining balance.
  //
  // Correct approach: let FNI = finalNetInvestable. The harvest fee sum over a
  // declining balance starting at FNI, declining by FNI/H per year, is:
  //   harvestFees = managementFee × FNI × (H+1)/2   (arithmetic series)
  //
  // Substituting into FNI = (fundSize - invFees) - harvestFees and solving:
  //   FNI = (fundSize - invFees) / (1 + managementFee × (H+1) / 2)
  //
  // This is exact and self-consistent: fundSize - totalMgmtFees = FNI exactly.
  //
  const netInvestableCapital =
    harvestYears > 0
      ? (fundSize - investmentPeriodFees) /
        (1 + (managementFee * (harvestYears + 1)) / 2)
      : fundSize - investmentPeriodFees;

  const annualDeployment =
    investmentPeriod > 0 ? netInvestableCapital / investmentPeriod : 0;

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
      // Harvest period: fee on beginning-of-year invested balance.
      // Balance declines linearly from NIC (year IP+1) to NIC/H (year fundLife).
      // k = 1-indexed harvest year (1 = first harvest year)
      const k = year - investmentPeriod;
      const remainingAtYearStart =
        (netInvestableCapital * (harvestYears - k + 1)) / harvestYears;
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

  // totalMgmtFees is authoritative — summed from per-year values.
  // With the self-consistent FNI formula, fundSize - totalMgmtFees = netInvestableCapital exactly.
  const totalMgmtFees = years.reduce((sum, y) => sum + y.mgmtFee, 0);
  const capitalEfficiency = fundSize > 0 ? netInvestableCapital / fundSize : 0;

  return {
    years,
    totalMgmtFees,
    netInvestableCapital,
    capitalEfficiency,
  };
}
