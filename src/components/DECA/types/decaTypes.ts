export type EventCode =
  | "EIB"
  | "IBP"
  | "EFB"
  | "EBG"
  | "ESB"
  | "EIP"
  | "BOR"
  | "FOR"
  | "SMG";
export type StepVisibility = "required" | "recommended" | "hidden";
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface EventConfig {
  code: EventCode;
  name: string;
  format: "written" | "pitchdeck";
  pageLimit: number;
  financialPointsWritten: number;
  financialPointsPresentation: number;
  totalPoints: number;
  steps: {
    businessOverview: StepVisibility;
    assumptions: StepVisibility;
    startupCosts: StepVisibility;
    incomeStatement: StepVisibility;
    cashFlow: StepVisibility;
    balanceSheet: StepVisibility;
    threeYearPlan: StepVisibility;
    capitalNeeds: StepVisibility;
    breakEven: StepVisibility;
    sensitivity: StepVisibility;
    implementationBudget: StepVisibility;
    internationalFinance: StepVisibility;
    currentFinancials: StepVisibility;
  };
  rubricNotes: string;
  description: string;
}

export interface BusinessOverview {
  businessName: string;
  industry: string;
  businessType: string;
  businessStage: string;
  primaryRevenueStream: string;
  targetMarket: string;
  coFounderCount: number;
  cityState: string;
}

export interface AssumptionSource {
  label: string;
  value: string;
}

export interface FinancialAssumptions {
  startingMonthlyRevenue: number;
  momGrowthRate: number;
  momGrowthSource: string;
  avgTransactionValue: number;
  customersMonth1: number;
  customerGrowthRate: number;
  pricingStrategy: string;
  cogsPercent: number;
  cogsSource: string;
  primarySupplier: string;
  monthlyRent: number;
  employeeCountYear1: number;
  avgMonthlySalary: number;
  payrollTaxRate: number;
  monthlyMarketing: number;
  monthlyTechnology: number;
  monthlyInsurance: number;
  monthlyProfessionalServices: number;
  totalStartupCapital: number;
  debtPortion: number;
  equityPortion: number;
  loanInterestRate: number;
  loanTermMonths: number;
  founderPersonalInvestment: number;
  taxRate: number;
  equipmentUsefulLifeYears: number;
}

export interface StartupCostItem {
  id: string;
  category: string;
  item: string;
  cost: number;
  notes: string;
}

export interface StartupCostsTable {
  items: StartupCostItem[];
}

export interface IncomeStatementMonthData {
  revenue1: number;
  revenue2: number;
  revenue3: number;
  rent: number;
  utilities: number;
  salaries: number;
  marketing: number;
  insurance: number;
  technology: number;
  professionalServices: number;
  miscOpExPct: number;
}

export interface CapitalSource {
  id: string;
  source: string;
  type: "equity" | "debt" | "nondilutive";
  amount: number;
}

export interface CapitalNeedsPlan {
  sources: CapitalSource[];
  useOfFunds: {
    equipment: number;
    inventory: number;
    marketing: number;
    workingCapital: number;
    technology: number;
    contingency: number;
    other: number;
  };
  repaymentNarrative: string;
}

export interface BreakEvenOverrides {
  revenuePerUnit: number;
  variableCostPerUnit: number;
}

export interface SensitivityAnalysis {
  worstCaseResponse: string;
}

export interface ImplementationBudgetRow {
  id: string;
  activity: string;
  category: string;
  oneTimeCost: number;
  monthlyCost: number;
  notes: string;
}

export interface ImplementationBudget {
  rows: ImplementationBudgetRow[];
  expectedBenefit: number;
  roiNarrative: string;
}

export interface InternationalFinance {
  targetCountry: string;
  exchangeRate: number;
  exchangeRateRisk: "favorable" | "neutral" | "unfavorable";
  importExportDuties: number;
  shippingLogistics: number;
  customsBrokerage: number;
  translationLocalization: number;
  legalInternational: number;
  bankingFees: number;
  countryLicensing: number;
}

export interface CurrentFinancials {
  currentMonthlyRevenue: number;
  currentMonthlyExpenses: number;
  monthsOperating: number;
  totalRevenueToDate: number;
  currentCashOnHand: number;
  hasExistingDebt: boolean;
  existingDebtAmount: number;
  fixedOverheadRent: number;
  fixedOverheadUtilities: number;
  fixedOverheadInsurance: number;
  fixedOverheadSubscriptions: number;
  fixedOverheadOther: number;
  expansionDescription: string;
  capitalNeededForExpansion: number;
  timelineToExpansionProfitability: number;
  expansionRequiresHiring: boolean;
  expansionHiringCount: number;
  expansionSalaries: number;
  expectedRevenueIncrease: number;
  expectedCostIncrease: number;
}

export interface ThreeYearPlanData {
  year2RevenueGrowthRate: number;
  year3RevenueGrowthRate: number;
  year2CogsChange: number;
  year3CogsChange: number;
  year2HeadcountAdditions: number;
  year3HeadcountAdditions: number;
  growthNarrative: string;
}

export interface ValidationResult {
  id: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
  affectedSteps: number[];
}

// Computed financial row for income statement
export interface ComputedIncomeMonth {
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  rent: number;
  utilities: number;
  salaries: number;
  payrollTaxes: number;
  marketing: number;
  insurance: number;
  technology: number;
  professionalServices: number;
  depreciation: number;
  miscOpEx: number;
  totalOpEx: number;
  operatingIncome: number;
  interestExpense: number;
  preTaxIncome: number;
  taxes: number;
  netIncome: number;
}

export interface ComputedCashFlowMonth {
  beginningBalance: number;
  salesCollections: number;
  loanProceeds: number;
  equityInvestment: number;
  otherInflows: number;
  totalInflows: number;
  cogsPayments: number;
  rent: number;
  utilities: number;
  salaries: number;
  payrollTaxes: number;
  marketing: number;
  insurance: number;
  technology: number;
  professionalServices: number;
  miscOpEx: number;
  startupCostsPayment: number;
  loanPrincipal: number;
  interestPayment: number;
  taxPayments: number;
  otherOutflows: number;
  totalOutflows: number;
  netCashFlow: number;
  endingBalance: number;
}

export interface ComputedBalanceSheet {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  totalCurrentAssets: number;
  equipmentGross: number;
  accumulatedDepreciation: number;
  netEquipment: number;
  otherLongTermAssets: number;
  totalLongTermAssets: number;
  totalAssets: number;
  accountsPayable: number;
  shortTermLoanPortion: number;
  accruedExpenses: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalLongTermLiabilities: number;
  totalLiabilities: number;
  initialInvestment: number;
  retainedEarnings: number;
  totalOwnerEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  difference: number;
}

export interface BalanceSheetOverrides {
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  otherLongTermAssets: number;
  accountsPayable: number;
  accruedExpenses: number;
}

export interface DECAProjectState {
  eventCode: EventCode | null;
  currentStep: number;
  businessOverview: BusinessOverview;
  assumptions: FinancialAssumptions;
  startupCosts: StartupCostsTable;
  incomeOverrides: Record<number, Partial<IncomeStatementMonthData>>;
  balanceSheetOverrides: BalanceSheetOverrides;
  threeYearPlan: ThreeYearPlanData;
  capitalNeeds: CapitalNeedsPlan;
  breakEvenOverrides: BreakEvenOverrides;
  sensitivity: SensitivityAnalysis;
  implementationBudget: ImplementationBudget;
  internationalFinance: InternationalFinance;
  currentFinancials: CurrentFinancials;
}

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  principal: number;
  interest: number;
  endingBalance: number;
}
