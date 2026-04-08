import React, { useMemo, useCallback } from "react";
import { useReducer } from "react";
import type { DECAProjectState, EventCode } from "./types/decaTypes";
import {
  buildAmortizationSchedule,
  computeAllIncomeMonths,
  computeAllCashFlowMonths,
  computeBalanceSheet,
  annualTotals,
  computeBreakEven,
  computeThreeYearPlan,
} from "./utils/decaUtils";
import { runAllValidations } from "./validation/financialValidation";
import { DECALanding } from "./DECALanding";
import { DECAWizard } from "./DECAWizard";

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: DECAProjectState = {
  eventCode: null,
  currentStep: 0,
  businessOverview: {
    businessName: "",
    industry: "",
    businessType: "",
    businessStage: "",
    primaryRevenueStream: "",
    targetMarket: "",
    coFounderCount: 1,
    cityState: "",
  },
  assumptions: {
    startingMonthlyRevenue: 5000,
    momGrowthRate: 10,
    momGrowthSource: "Conservative estimate",
    avgTransactionValue: 50,
    customersMonth1: 100,
    customerGrowthRate: 10,
    pricingStrategy: "Fixed price",
    cogsPercent: 30,
    cogsSource: "Industry average",
    primarySupplier: "",
    monthlyRent: 1500,
    employeeCountYear1: 2,
    avgMonthlySalary: 3000,
    payrollTaxRate: 15.3,
    monthlyMarketing: 500,
    monthlyTechnology: 200,
    monthlyInsurance: 150,
    monthlyProfessionalServices: 200,
    totalStartupCapital: 50000,
    debtPortion: 30000,
    equityPortion: 20000,
    loanInterestRate: 0.07,
    loanTermMonths: 60,
    founderPersonalInvestment: 10000,
    taxRate: 21,
    equipmentUsefulLifeYears: 5,
  },
  startupCosts: {
    items: [
      {
        id: "1",
        category: "Legal & Licensing",
        item: "Business registration",
        cost: 150,
        notes: "Varies by state",
      },
      {
        id: "2",
        category: "Legal & Licensing",
        item: "Trademark filing",
        cost: 250,
        notes: "USPTO filing fee",
      },
      {
        id: "3",
        category: "Legal & Licensing",
        item: "Attorney fees",
        cost: 500,
        notes: "",
      },
      {
        id: "4",
        category: "Technology",
        item: "Website development",
        cost: 800,
        notes: "",
      },
      {
        id: "5",
        category: "Technology",
        item: "Domain + hosting (1yr)",
        cost: 150,
        notes: "",
      },
      {
        id: "6",
        category: "Technology",
        item: "Software subscriptions",
        cost: 200,
        notes: "",
      },
      {
        id: "7",
        category: "Marketing",
        item: "Brand design/logo",
        cost: 200,
        notes: "",
      },
      {
        id: "8",
        category: "Marketing",
        item: "Launch marketing",
        cost: 500,
        notes: "",
      },
    ],
  },
  incomeOverrides: {},
  balanceSheetOverrides: {
    accountsReceivable: 0,
    inventory: 0,
    prepaidExpenses: 0,
    otherLongTermAssets: 0,
    accountsPayable: 0,
    accruedExpenses: 0,
  },
  threeYearPlan: {
    year2RevenueGrowthRate: 50,
    year3RevenueGrowthRate: 40,
    year2CogsChange: -2,
    year3CogsChange: -2,
    year2HeadcountAdditions: 1,
    year3HeadcountAdditions: 2,
    growthNarrative: "",
  },
  capitalNeeds: {
    sources: [
      { id: "1", source: "Personal Investment", type: "equity", amount: 10000 },
      { id: "2", source: "Bank Loan", type: "debt", amount: 30000 },
    ],
    useOfFunds: {
      equipment: 5000,
      inventory: 2000,
      marketing: 5000,
      workingCapital: 15000,
      technology: 3000,
      contingency: 5000,
      other: 0,
    },
    repaymentNarrative: "",
  },
  breakEvenOverrides: {
    revenuePerUnit: 50,
    variableCostPerUnit: 15,
  },
  sensitivity: {
    worstCaseResponse: "",
  },
  implementationBudget: {
    rows: [
      {
        id: "1",
        activity: "Digital marketing campaign",
        category: "Marketing",
        oneTimeCost: 2000,
        monthlyCost: 500,
        notes: "",
      },
      {
        id: "2",
        activity: "Staff training program",
        category: "Training",
        oneTimeCost: 1500,
        monthlyCost: 0,
        notes: "",
      },
    ],
    expectedBenefit: 25000,
    roiNarrative: "",
  },
  internationalFinance: {
    targetCountry: "",
    exchangeRate: 1,
    exchangeRateRisk: "neutral",
    importExportDuties: 0,
    shippingLogistics: 500,
    customsBrokerage: 200,
    translationLocalization: 1000,
    legalInternational: 1500,
    bankingFees: 300,
    countryLicensing: 500,
  },
  currentFinancials: {
    currentMonthlyRevenue: 0,
    currentMonthlyExpenses: 0,
    monthsOperating: 0,
    totalRevenueToDate: 0,
    currentCashOnHand: 0,
    hasExistingDebt: false,
    existingDebtAmount: 0,
    fixedOverheadRent: 0,
    fixedOverheadUtilities: 0,
    fixedOverheadInsurance: 0,
    fixedOverheadSubscriptions: 0,
    fixedOverheadOther: 0,
    expansionDescription: "",
    capitalNeededForExpansion: 0,
    timelineToExpansionProfitability: 12,
    expansionRequiresHiring: false,
    expansionHiringCount: 0,
    expansionSalaries: 0,
    expectedRevenueIncrease: 0,
    expectedCostIncrease: 0,
  },
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_EVENT"; payload: EventCode }
  | { type: "SET_STEP"; payload: number }
  | {
      type: "SET_BUSINESS_OVERVIEW";
      payload: Partial<DECAProjectState["businessOverview"]>;
    }
  | {
      type: "SET_ASSUMPTIONS";
      payload: Partial<DECAProjectState["assumptions"]>;
    }
  | { type: "SET_STARTUP_COSTS"; payload: DECAProjectState["startupCosts"] }
  | {
      type: "SET_INCOME_OVERRIDE";
      payload: {
        month: number;
        data: Partial<DECAProjectState["incomeOverrides"][number]>;
      };
    }
  | {
      type: "SET_BS_OVERRIDES";
      payload: Partial<DECAProjectState["balanceSheetOverrides"]>;
    }
  | {
      type: "SET_THREE_YEAR_PLAN";
      payload: Partial<DECAProjectState["threeYearPlan"]>;
    }
  | {
      type: "SET_CAPITAL_NEEDS";
      payload: Partial<DECAProjectState["capitalNeeds"]>;
    }
  | {
      type: "SET_BREAK_EVEN_OVERRIDES";
      payload: Partial<DECAProjectState["breakEvenOverrides"]>;
    }
  | {
      type: "SET_SENSITIVITY";
      payload: Partial<DECAProjectState["sensitivity"]>;
    }
  | {
      type: "SET_IMPL_BUDGET";
      payload: Partial<DECAProjectState["implementationBudget"]>;
    }
  | {
      type: "SET_INTL_FINANCE";
      payload: Partial<DECAProjectState["internationalFinance"]>;
    }
  | {
      type: "SET_CURRENT_FINANCIALS";
      payload: Partial<DECAProjectState["currentFinancials"]>;
    }
  | { type: "RESET" };

function reducer(state: DECAProjectState, action: Action): DECAProjectState {
  switch (action.type) {
    case "SET_EVENT":
      return { ...state, eventCode: action.payload, currentStep: 1 };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_BUSINESS_OVERVIEW":
      return {
        ...state,
        businessOverview: { ...state.businessOverview, ...action.payload },
      };
    case "SET_ASSUMPTIONS":
      return {
        ...state,
        assumptions: { ...state.assumptions, ...action.payload },
      };
    case "SET_STARTUP_COSTS":
      return { ...state, startupCosts: action.payload };
    case "SET_INCOME_OVERRIDE":
      return {
        ...state,
        incomeOverrides: {
          ...state.incomeOverrides,
          [action.payload.month]: {
            ...(state.incomeOverrides[action.payload.month] || {}),
            ...action.payload.data,
          },
        },
      };
    case "SET_BS_OVERRIDES":
      return {
        ...state,
        balanceSheetOverrides: {
          ...state.balanceSheetOverrides,
          ...action.payload,
        },
      };
    case "SET_THREE_YEAR_PLAN":
      return {
        ...state,
        threeYearPlan: { ...state.threeYearPlan, ...action.payload },
      };
    case "SET_CAPITAL_NEEDS":
      return {
        ...state,
        capitalNeeds: { ...state.capitalNeeds, ...action.payload },
      };
    case "SET_BREAK_EVEN_OVERRIDES":
      return {
        ...state,
        breakEvenOverrides: { ...state.breakEvenOverrides, ...action.payload },
      };
    case "SET_SENSITIVITY":
      return {
        ...state,
        sensitivity: { ...state.sensitivity, ...action.payload },
      };
    case "SET_IMPL_BUDGET":
      return {
        ...state,
        implementationBudget: {
          ...state.implementationBudget,
          ...action.payload,
        },
      };
    case "SET_INTL_FINANCE":
      return {
        ...state,
        internationalFinance: {
          ...state.internationalFinance,
          ...action.payload,
        },
      };
    case "SET_CURRENT_FINANCIALS":
      return {
        ...state,
        currentFinancials: { ...state.currentFinancials, ...action.payload },
      };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface DECAContextValue {
  state: DECAProjectState;
  dispatch: React.Dispatch<Action>;
  computed: {
    amortRows: ReturnType<typeof buildAmortizationSchedule>;
    incomeMonths: ReturnType<typeof computeAllIncomeMonths>;
    cashFlowMonths: ReturnType<typeof computeAllCashFlowMonths>;
    balanceSheet: ReturnType<typeof computeBalanceSheet>;
    annual: ReturnType<typeof annualTotals>;
    breakEven: ReturnType<typeof computeBreakEven>;
    threeYearProjections: ReturnType<typeof computeThreeYearPlan>;
    validations: ReturnType<typeof runAllValidations>;
    totalStartupCost: number;
    totalCapitalRaised: number;
  };
}

export const DECAContext = React.createContext<DECAContextValue | null>(null);

export function useDECA(): DECAContextValue {
  const ctx = React.useContext(DECAContext);
  if (!ctx) throw new Error("useDECA must be used within DECAFinanceSuite");
  return ctx;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DECAFinanceSuite() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showWizard, setShowWizard] = React.useState(false);

  const amortRows = useMemo(
    () =>
      buildAmortizationSchedule(
        state.assumptions.debtPortion,
        state.assumptions.loanInterestRate,
        state.assumptions.loanTermMonths,
      ),
    [
      state.assumptions.debtPortion,
      state.assumptions.loanInterestRate,
      state.assumptions.loanTermMonths,
    ],
  );

  const incomeMonths = useMemo(
    () =>
      computeAllIncomeMonths(
        state.assumptions,
        state.incomeOverrides,
        amortRows,
        state.startupCosts,
      ),
    [state.assumptions, state.incomeOverrides, amortRows, state.startupCosts],
  );

  const cashFlowMonths = useMemo(
    () =>
      computeAllCashFlowMonths(
        incomeMonths,
        state.assumptions,
        amortRows,
        state.startupCosts,
      ),
    [incomeMonths, state.assumptions, amortRows, state.startupCosts],
  );

  const annual = useMemo(() => annualTotals(incomeMonths), [incomeMonths]);

  const balanceSheet = useMemo(
    () =>
      computeBalanceSheet(
        incomeMonths,
        cashFlowMonths,
        state.assumptions,
        state.startupCosts,
        amortRows,
        state.balanceSheetOverrides,
      ),
    [
      incomeMonths,
      cashFlowMonths,
      state.assumptions,
      state.startupCosts,
      amortRows,
      state.balanceSheetOverrides,
    ],
  );

  const breakEven = useMemo(
    () =>
      computeBreakEven(
        state.assumptions,
        incomeMonths,
        state.breakEvenOverrides,
      ),
    [state.assumptions, incomeMonths, state.breakEvenOverrides],
  );

  const threeYearProjections = useMemo(
    () => computeThreeYearPlan(annual, state.threeYearPlan, state.assumptions),
    [annual, state.threeYearPlan, state.assumptions],
  );

  const totalStartupCost = useMemo(
    () => state.startupCosts.items.reduce((s, i) => s + i.cost, 0),
    [state.startupCosts],
  );

  const totalCapitalRaised = useMemo(
    () => state.capitalNeeds.sources.reduce((s, i) => s + i.amount, 0),
    [state.capitalNeeds.sources],
  );

  const validations = useMemo(
    () =>
      runAllValidations({
        balanceSheet,
        cashFlowMonths,
        incomeMonths,
        annualNetIncome: annual.netIncome,
        totalStartupCosts: totalStartupCost,
        totalCapitalRaised,
        assumptions: state.assumptions,
      }),
    [
      balanceSheet,
      cashFlowMonths,
      incomeMonths,
      annual,
      totalStartupCost,
      totalCapitalRaised,
      state.assumptions,
    ],
  );

  const contextValue: DECAContextValue = {
    state,
    dispatch,
    computed: {
      amortRows,
      incomeMonths,
      cashFlowMonths,
      balanceSheet,
      annual,
      breakEven,
      threeYearProjections,
      validations,
      totalStartupCost,
      totalCapitalRaised,
    },
  };

  const handleStart = useCallback(() => setShowWizard(true), []);
  const handleBack = useCallback(() => {
    setShowWizard(false);
    dispatch({ type: "RESET" });
  }, []);

  return (
    <DECAContext.Provider value={contextValue}>
      <div
        className="min-h-screen"
        style={{
          background: "#0a0f1e",
          fontFamily: "'IBM Plex Sans', 'DM Sans', sans-serif",
        }}
      >
        {!showWizard ? (
          <DECALanding onStart={handleStart} />
        ) : (
          <DECAWizard onBackToLanding={handleBack} />
        )}
      </div>
    </DECAContext.Provider>
  );
}
