export interface ChallengeQuestion {
  id: string;
  question: string;
  answer: number;
  tolerance: number;
  hint: string;
  unit: "%" | "x" | "$M";
}

export interface WeeklyScenario {
  weekId: string;
  title: string;
  description: string;
  inputs: Record<string, number>;
  questions: ChallengeQuestion[];
}

export const WEEKLY_SCENARIO: WeeklyScenario = {
  weekId: "2026-W21",
  title: "Retail Roll-Up LBO",
  description:
    "A PE firm is acquiring a regional retail chain for 8x EBITDA. EBITDA is $45M, entry debt is 5.5x, exit after 5 years at 7.5x EBITDA with 8% annual EBITDA growth.",
  inputs: {
    ebitdaM: 45,
    entryMultiple: 8,
    debtMultiple: 5.5,
    exitMultiple: 7.5,
    holdYears: 5,
    ebitdaGrowthPct: 8,
    interestRatePct: 7,
    taxRatePct: 25,
    capexPctEbitda: 15,
  },
  questions: [
    {
      id: "q1",
      question: "What is the entry Enterprise Value ($M)?",
      answer: 360,
      tolerance: 0.001,
      hint: "EBITDA × entry multiple",
      unit: "$M",
    },
    {
      id: "q2",
      question: "What is the sponsor equity check ($M)?",
      answer: 112.5,
      tolerance: 0.02,
      hint: "Entry EV minus total debt (EBITDA × debt multiple)",
      unit: "$M",
    },
    {
      id: "q3",
      question: "What is the exit EBITDA after 5 years of 8% growth ($M)?",
      answer: 66.1,
      tolerance: 0.02,
      hint: "45 × 1.08^5",
      unit: "$M",
    },
    {
      id: "q4",
      question: "What is the exit Enterprise Value ($M)?",
      answer: 495.7,
      tolerance: 0.02,
      hint: "Exit EBITDA × exit multiple",
      unit: "$M",
    },
    {
      id: "q5",
      question:
        "Approximately what MOIC does the sponsor earn? (assume minimal debt paydown for simplicity)",
      answer: 3.4,
      tolerance: 0.08,
      hint: "(Exit EV - entry debt) / entry equity",
      unit: "x",
    },
  ],
};
