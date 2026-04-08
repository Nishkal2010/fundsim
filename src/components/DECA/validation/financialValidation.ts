import type {
  ValidationResult,
  ComputedBalanceSheet,
  ComputedCashFlowMonth,
  ComputedIncomeMonth,
  FinancialAssumptions,
} from "../types/decaTypes";

export function validateBalanceSheet(
  bs: ComputedBalanceSheet,
): ValidationResult {
  return {
    id: "balance_sheet",
    passed: bs.isBalanced,
    message: bs.isBalanced
      ? `Balance Sheet balanced. Assets = Liabilities + Equity = ${bs.totalAssets.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}`
      : `Balance Sheet does NOT balance. Difference: ${Math.abs(bs.difference).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}`,
    severity: bs.isBalanced ? "info" : "error",
    affectedSteps: [6],
  };
}

export function validateNegativeCashBalance(
  cashMonths: ComputedCashFlowMonth[],
): ValidationResult[] {
  return cashMonths.map((m, i) => ({
    id: `cash_negative_month_${i + 1}`,
    passed: m.endingBalance >= 0,
    message:
      m.endingBalance >= 0
        ? `Month ${i + 1}: Cash balance OK (${m.endingBalance.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })})`
        : `Month ${i + 1}: Negative cash balance of ${m.endingBalance.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}. Judges will flag this.`,
    severity: (m.endingBalance >= 0 ? "info" : "error") as "info" | "error",
    affectedSteps: [5],
  }));
}

export function validateRetainedEarnings(
  annualNetIncome: number,
  bsRetainedEarnings: number,
): ValidationResult {
  const diff = Math.abs(annualNetIncome - bsRetainedEarnings);
  return {
    id: "retained_earnings",
    passed: diff < 1,
    message:
      diff < 1
        ? "Net income correctly flows into retained earnings"
        : `Retained earnings mismatch: Income Statement shows ${annualNetIncome.toFixed(2)} but Balance Sheet shows ${bsRetainedEarnings.toFixed(2)}`,
    severity: diff < 1 ? "info" : "error",
    affectedSteps: [4, 6],
  };
}

export function validateStartupCostCoverage(
  totalStartupCosts: number,
  totalCapitalRaised: number,
): ValidationResult {
  const covered = totalCapitalRaised >= totalStartupCosts;
  return {
    id: "startup_coverage",
    passed: covered,
    message: covered
      ? "Capital raised covers startup costs"
      : `Funding gap: Startup costs (${totalStartupCosts.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}) exceed capital raised (${totalCapitalRaised.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })})`,
    severity: covered ? "info" : "error",
    affectedSteps: [3, 8],
  };
}

export function validateReasonableAssumptions(
  assumptions: FinancialAssumptions,
): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (assumptions.momGrowthRate > 30) {
    results.push({
      id: "growth_rate_high",
      passed: false,
      message: `Month-over-month growth of ${assumptions.momGrowthRate}% is extremely aggressive. Judges expect justified, sourced assumptions.`,
      severity: "warning",
      affectedSteps: [2],
    });
  }

  if (assumptions.cogsPercent < 5 || assumptions.cogsPercent > 90) {
    results.push({
      id: "cogs_pct_range",
      passed: false,
      message: `COGS of ${assumptions.cogsPercent}% is outside typical range (5–90%). Verify against industry benchmarks.`,
      severity: "warning",
      affectedSteps: [2],
    });
  }

  if (assumptions.startingMonthlyRevenue === 0) {
    results.push({
      id: "zero_revenue",
      passed: false,
      message:
        "Starting monthly revenue is $0. Enter a revenue assumption to populate financial statements.",
      severity: "error",
      affectedSteps: [2],
    });
  }

  return results;
}

export function validateMonth1Profit(
  incomeMonths: ComputedIncomeMonth[],
): ValidationResult {
  const month1Profit = incomeMonths.length > 0 && incomeMonths[0].netIncome > 0;
  return {
    id: "month1_profit",
    passed: !month1Profit,
    message: month1Profit
      ? "Month 1 shows a profit. Real startups rarely profit in Month 1 — verify your assumptions are realistic."
      : "Month 1 shows a loss — realistic for a startup.",
    severity: month1Profit ? "warning" : "info",
    affectedSteps: [4],
  };
}

export function runAllValidations(params: {
  balanceSheet: ComputedBalanceSheet;
  cashFlowMonths: ComputedCashFlowMonth[];
  incomeMonths: ComputedIncomeMonth[];
  annualNetIncome: number;
  totalStartupCosts: number;
  totalCapitalRaised: number;
  assumptions: FinancialAssumptions;
}): ValidationResult[] {
  const results: ValidationResult[] = [];

  results.push(validateBalanceSheet(params.balanceSheet));
  results.push(...validateNegativeCashBalance(params.cashFlowMonths));
  results.push(
    validateRetainedEarnings(
      params.annualNetIncome,
      params.balanceSheet.retainedEarnings,
    ),
  );
  results.push(
    validateStartupCostCoverage(
      params.totalStartupCosts,
      params.totalCapitalRaised,
    ),
  );
  results.push(...validateReasonableAssumptions(params.assumptions));
  results.push(validateMonth1Profit(params.incomeMonths));

  return results;
}
