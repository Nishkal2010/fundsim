import type {
  FinancialAssumptions,
  StartupCostsTable,
  IncomeStatementMonthData,
  ComputedIncomeMonth,
  ComputedCashFlowMonth,
  ComputedBalanceSheet,
  BalanceSheetOverrides,
  ThreeYearPlanData,
  BreakEvenOverrides,
  AmortizationRow,
} from "../types/decaTypes";

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCurrencyShort(n: number): string {
  if (!isFinite(n)) return "$0";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPercent(n: number): string {
  if (!isFinite(n)) return "0.0%";
  return `${(n * 100).toFixed(1)}%`;
}

export function formatPercentRaw(n: number): string {
  if (!isFinite(n)) return "0.0%";
  return `${n.toFixed(1)}%`;
}

// Monthly amortization schedule
export function buildAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
): AmortizationRow[] {
  if (principal <= 0 || termMonths <= 0) return [];
  const monthlyRate = annualRate / 12;
  let balance = principal;
  const rows: AmortizationRow[] = [];

  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * monthlyRate;
    const payment =
      monthlyRate > 0
        ? (principal * monthlyRate) /
          (1 - Math.pow(1 + monthlyRate, -termMonths))
        : principal / termMonths;
    const principalPmt = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - principalPmt);
    rows.push({
      month: m,
      beginningBalance: balance + principalPmt,
      principal: principalPmt,
      interest,
      endingBalance: balance,
    });
  }
  return rows;
}

// Base monthly income data from assumptions (before user overrides)
export function baseMonthIncome(
  month: number,
  assumptions: FinancialAssumptions,
): IncomeStatementMonthData {
  const growthFactor = Math.pow(1 + assumptions.momGrowthRate / 100, month - 1);
  const revenue1 = assumptions.startingMonthlyRevenue * growthFactor;
  return {
    revenue1,
    revenue2: 0,
    revenue3: 0,
    rent: assumptions.monthlyRent,
    utilities: Math.round(assumptions.monthlyRent * 0.1),
    salaries: assumptions.employeeCountYear1 * assumptions.avgMonthlySalary,
    marketing: assumptions.monthlyMarketing,
    insurance: assumptions.monthlyInsurance,
    technology: assumptions.monthlyTechnology,
    professionalServices: assumptions.monthlyProfessionalServices,
    miscOpExPct: 5,
  };
}

// Compute full income statement row from input data + assumptions
export function computeIncomeMonth(
  data: IncomeStatementMonthData,
  assumptions: FinancialAssumptions,
  amortRows: AmortizationRow[],
  month: number,
  startupCosts: StartupCostsTable,
): ComputedIncomeMonth {
  const totalRevenue = data.revenue1 + data.revenue2 + data.revenue3;
  const cogs = totalRevenue * (assumptions.cogsPercent / 100);
  const grossProfit = totalRevenue - cogs;
  const grossMarginPct =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const payrollTaxes = data.salaries * (assumptions.payrollTaxRate / 100);
  const subtotalOpEx =
    data.rent +
    data.utilities +
    data.salaries +
    payrollTaxes +
    data.marketing +
    data.insurance +
    data.technology +
    data.professionalServices;

  // Depreciation: equipment cost / (useful life in years * 12)
  const equipmentCost = startupCosts.items
    .filter((i) => i.category === "Equipment")
    .reduce((sum, i) => sum + i.cost, 0);
  const depreciation =
    equipmentCost / (assumptions.equipmentUsefulLifeYears * 12);

  const miscOpEx = subtotalOpEx * (data.miscOpExPct / 100);
  const totalOpEx = subtotalOpEx + depreciation + miscOpEx;
  const operatingIncome = grossProfit - totalOpEx;

  const amortRow = amortRows[month - 1];
  const interestExpense = amortRow ? amortRow.interest : 0;
  const preTaxIncome = operatingIncome - interestExpense;
  const taxes =
    preTaxIncome > 0 ? preTaxIncome * (assumptions.taxRate / 100) : 0;
  const netIncome = preTaxIncome - taxes;

  return {
    totalRevenue,
    cogs,
    grossProfit,
    grossMarginPct,
    rent: data.rent,
    utilities: data.utilities,
    salaries: data.salaries,
    payrollTaxes,
    marketing: data.marketing,
    insurance: data.insurance,
    technology: data.technology,
    professionalServices: data.professionalServices,
    depreciation,
    miscOpEx,
    totalOpEx,
    operatingIncome,
    interestExpense,
    preTaxIncome,
    taxes,
    netIncome,
  };
}

// Build all 12 months of computed income
export function computeAllIncomeMonths(
  assumptions: FinancialAssumptions,
  overrides: Record<number, Partial<IncomeStatementMonthData>>,
  amortRows: AmortizationRow[],
  startupCosts: StartupCostsTable,
): ComputedIncomeMonth[] {
  const months: ComputedIncomeMonth[] = [];
  for (let m = 1; m <= 12; m++) {
    const base = baseMonthIncome(m, assumptions);
    const merged = { ...base, ...(overrides[m] || {}) };
    months.push(
      computeIncomeMonth(merged, assumptions, amortRows, m, startupCosts),
    );
  }
  return months;
}

export function annualTotals(
  months: ComputedIncomeMonth[],
): ComputedIncomeMonth {
  const sum = (key: keyof ComputedIncomeMonth) =>
    months.reduce((acc, m) => acc + (m[key] as number), 0);

  const totalRevenue = sum("totalRevenue");
  const grossProfit = sum("grossProfit");
  const grossMarginPct =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  return {
    totalRevenue,
    cogs: sum("cogs"),
    grossProfit,
    grossMarginPct,
    rent: sum("rent"),
    utilities: sum("utilities"),
    salaries: sum("salaries"),
    payrollTaxes: sum("payrollTaxes"),
    marketing: sum("marketing"),
    insurance: sum("insurance"),
    technology: sum("technology"),
    professionalServices: sum("professionalServices"),
    depreciation: sum("depreciation"),
    miscOpEx: sum("miscOpEx"),
    totalOpEx: sum("totalOpEx"),
    operatingIncome: sum("operatingIncome"),
    interestExpense: sum("interestExpense"),
    preTaxIncome: sum("preTaxIncome"),
    taxes: sum("taxes"),
    netIncome: sum("netIncome"),
  };
}

// Build all 12 months of cash flow
export function computeAllCashFlowMonths(
  incomeMonths: ComputedIncomeMonth[],
  assumptions: FinancialAssumptions,
  amortRows: AmortizationRow[],
  startupCosts: StartupCostsTable,
): ComputedCashFlowMonth[] {
  const months: ComputedCashFlowMonth[] = [];
  let beginningBalance = 0;
  const totalStartupCost = startupCosts.items.reduce((s, i) => s + i.cost, 0);

  for (let m = 1; m <= 12; m++) {
    const inc = incomeMonths[m - 1];
    const amort = amortRows[m - 1];

    const loanProceeds = m === 1 ? assumptions.debtPortion : 0;
    const equityInvestment = m === 1 ? assumptions.equityPortion : 0;
    const salesCollections = inc.totalRevenue;
    const otherInflows = 0;
    const totalInflows =
      salesCollections + loanProceeds + equityInvestment + otherInflows;

    const cogsPayments = inc.cogs;
    const rent = inc.rent;
    const utilities = inc.utilities;
    const salaries = inc.salaries;
    const payrollTaxes = inc.payrollTaxes;
    const marketing = inc.marketing;
    const insurance = inc.insurance;
    const technology = inc.technology;
    const professionalServices = inc.professionalServices;
    const startupCostsPayment = m === 1 ? totalStartupCost : 0;
    const loanPrincipal = amort ? amort.principal : 0;
    const interestPayment = amort ? amort.interest : 0;
    // Quarterly tax payments
    const taxPayments = [3, 6, 9, 12].includes(m)
      ? inc.taxes > 0
        ? inc.taxes * 3
        : 0
      : 0;
    const otherOutflows = 0;

    const totalOutflows =
      cogsPayments +
      rent +
      utilities +
      salaries +
      payrollTaxes +
      marketing +
      insurance +
      technology +
      professionalServices +
      startupCostsPayment +
      loanPrincipal +
      interestPayment +
      taxPayments +
      otherOutflows;

    const netCashFlow = totalInflows - totalOutflows;
    const endingBalance = beginningBalance + netCashFlow;

    months.push({
      beginningBalance,
      salesCollections,
      loanProceeds,
      equityInvestment,
      otherInflows,
      totalInflows,
      cogsPayments,
      rent,
      utilities,
      salaries,
      payrollTaxes,
      marketing,
      insurance,
      technology,
      professionalServices,
      startupCostsPayment,
      loanPrincipal,
      interestPayment,
      taxPayments,
      otherOutflows,
      totalOutflows,
      netCashFlow,
      endingBalance,
    });

    beginningBalance = endingBalance;
  }
  return months;
}

// Compute balance sheet from all data
export function computeBalanceSheet(
  incomeMonths: ComputedIncomeMonth[],
  cashFlowMonths: ComputedCashFlowMonth[],
  assumptions: FinancialAssumptions,
  startupCosts: StartupCostsTable,
  amortRows: AmortizationRow[],
  overrides: BalanceSheetOverrides,
): ComputedBalanceSheet {
  const cash = cashFlowMonths.length > 0 ? cashFlowMonths[11].endingBalance : 0;
  const accountsReceivable = overrides.accountsReceivable;
  const inventory = overrides.inventory;
  const prepaidExpenses = overrides.prepaidExpenses;
  const totalCurrentAssets =
    cash + accountsReceivable + inventory + prepaidExpenses;

  const equipmentGross = startupCosts.items
    .filter((i) => i.category === "Equipment")
    .reduce((s, i) => s + i.cost, 0);
  const annualDepreciation =
    incomeMonths.length > 0 ? incomeMonths[0].depreciation * 12 : 0;
  const accumulatedDepreciation = annualDepreciation;
  const netEquipment = Math.max(0, equipmentGross - accumulatedDepreciation);
  const otherLongTermAssets = overrides.otherLongTermAssets;
  const totalLongTermAssets = netEquipment + otherLongTermAssets;
  const totalAssets = totalCurrentAssets + totalLongTermAssets;

  // Liabilities
  const accountsPayable = overrides.accountsPayable;
  const shortTermLoanPortion = amortRows
    .slice(0, 12)
    .reduce((s, r) => s + r.principal, 0);
  const accruedExpenses = overrides.accruedExpenses;
  const totalCurrentLiabilities =
    accountsPayable + shortTermLoanPortion + accruedExpenses;

  const remainingLoanBalance =
    amortRows.length > 11 ? amortRows[11].endingBalance : 0;
  const longTermDebt = Math.max(0, remainingLoanBalance - shortTermLoanPortion);
  const totalLongTermLiabilities = longTermDebt;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  // Equity
  const initialInvestment =
    assumptions.equityPortion + assumptions.founderPersonalInvestment;
  const retainedEarnings = annualTotals(incomeMonths).netIncome;
  const totalOwnerEquity = initialInvestment + retainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalOwnerEquity;

  const difference = totalAssets - totalLiabilitiesAndEquity;
  const isBalanced = Math.abs(difference) < 1;

  return {
    cash,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    totalCurrentAssets,
    equipmentGross,
    accumulatedDepreciation,
    netEquipment,
    otherLongTermAssets,
    totalLongTermAssets,
    totalAssets,
    accountsPayable,
    shortTermLoanPortion,
    accruedExpenses,
    totalCurrentLiabilities,
    longTermDebt,
    totalLongTermLiabilities,
    totalLiabilities,
    initialInvestment,
    retainedEarnings,
    totalOwnerEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    difference,
  };
}

// Compute break-even
export function computeBreakEven(
  assumptions: FinancialAssumptions,
  incomeMonths: ComputedIncomeMonth[],
  overrides: BreakEvenOverrides,
) {
  const annual = annualTotals(incomeMonths);
  const fixedCosts =
    (assumptions.monthlyRent +
      assumptions.employeeCountYear1 * assumptions.avgMonthlySalary +
      assumptions.monthlyMarketing +
      assumptions.monthlyInsurance +
      assumptions.monthlyTechnology +
      assumptions.monthlyProfessionalServices) *
    12;

  const grossMarginDecimal =
    annual.totalRevenue > 0 ? annual.grossProfit / annual.totalRevenue : 0;
  const breakEvenRevenue =
    grossMarginDecimal > 0 ? fixedCosts / grossMarginDecimal : 0;
  const breakEvenUnits =
    overrides.revenuePerUnit > overrides.variableCostPerUnit &&
    overrides.revenuePerUnit > 0
      ? fixedCosts / (overrides.revenuePerUnit - overrides.variableCostPerUnit)
      : 0;

  // Find break-even month from income statement
  let cumulative = 0;
  let breakEvenMonth = 0;
  for (let m = 0; m < incomeMonths.length; m++) {
    cumulative += incomeMonths[m].netIncome;
    if (cumulative >= 0 && breakEvenMonth === 0) {
      breakEvenMonth = m + 1;
    }
  }

  return { fixedCosts, breakEvenRevenue, breakEvenUnits, breakEvenMonth };
}

// Three-year projections
export function computeThreeYearPlan(
  year1Annual: ComputedIncomeMonth,
  plan: ThreeYearPlanData,
  assumptions: FinancialAssumptions,
) {
  const y1Rev = year1Annual.totalRevenue;
  const y2Rev = y1Rev * (1 + plan.year2RevenueGrowthRate / 100);
  const y3Rev = y2Rev * (1 + plan.year3RevenueGrowthRate / 100);

  const baseCogsPct = assumptions.cogsPercent / 100;
  const y2CogsPct = Math.max(0, baseCogsPct + plan.year2CogsChange / 100);
  const y3CogsPct = Math.max(0, y2CogsPct + plan.year3CogsChange / 100);

  const extraSalaryY2 =
    plan.year2HeadcountAdditions * assumptions.avgMonthlySalary * 12;
  const extraSalaryY3 =
    plan.year3HeadcountAdditions * assumptions.avgMonthlySalary * 12;

  // Separate salary from non-salary OpEx so non-salary scales with revenue growth
  const y1SalaryBase = year1Annual.salaries + year1Annual.payrollTaxes;
  const y1NonSalaryBase = year1Annual.totalOpEx - y1SalaryBase;
  const y2RevFactor = 1 + plan.year2RevenueGrowthRate / 100;
  const y3RevFactor = y2RevFactor * (1 + plan.year3RevenueGrowthRate / 100);

  const makeYear = (
    revenue: number,
    cogsPct: number,
    extraSalary: number,
    nonSalaryScale: number,
  ) => {
    const cogs = revenue * cogsPct;
    const grossProfit = revenue - cogs;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const totalOpEx =
      y1NonSalaryBase * nonSalaryScale + y1SalaryBase + extraSalary;
    const netIncome = grossProfit - totalOpEx;
    const netMarginPct = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    return {
      revenue,
      grossProfit,
      grossMarginPct,
      totalOpEx,
      netIncome,
      netMarginPct,
    };
  };

  return [
    makeYear(y1Rev, baseCogsPct, 0, 1),
    makeYear(y2Rev, y2CogsPct, extraSalaryY2, y2RevFactor),
    makeYear(y3Rev, y3CogsPct, extraSalaryY2 + extraSalaryY3, y3RevFactor),
  ];
}

export function computeCompletionPct(
  eventCode: string | null,
  state: {
    businessOverview: { businessName: string };
    assumptions: { startingMonthlyRevenue: number };
    startupCosts: { items: unknown[] };
    capitalNeeds: { sources: unknown[] };
  },
): number {
  if (!eventCode) return 5;
  let score = 10; // event selected
  if (state.businessOverview.businessName) score += 15;
  if (state.assumptions.startingMonthlyRevenue > 0) score += 20;
  if (state.startupCosts.items.length > 0) score += 15;
  if (state.capitalNeeds.sources.length > 0) score += 15;
  return Math.min(100, score);
}
