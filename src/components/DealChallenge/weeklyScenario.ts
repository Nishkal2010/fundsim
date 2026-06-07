export interface ChallengeQuestion {
  id: string;
  question: string;
  /** Plain-English explanation of what this question is testing */
  explanation: string;
  answer: number;
  tolerance: number;
  hint: string;
  unit: "%" | "x" | "$M";
}

export interface WeeklyScenario {
  weekId: string;
  title: string;
  description: string;
  /** What the scenario is teaching — shown in the onboarding walkthrough */
  teachingPoint: string;
  inputs: Record<string, number>;
  questions: ChallengeQuestion[];
}

// All available scenarios. The active one is selected by weekId stored in
// localStorage key 'fundsim_challenge_weekId'. Falls back to WEEKLY_SCENARIO
// (the default/current week).
export const ALL_SCENARIOS: WeeklyScenario[] = [
  {
    weekId: "2026-W21",
    title: "Retail Roll-Up LBO",
    description:
      "A PE firm is acquiring a regional retail chain for 8x EBITDA. EBITDA is $45M, entry debt is 5.5x, exit after 5 years at 7.5x EBITDA with 8% annual EBITDA growth.",
    teachingPoint:
      "Walk through a basic LBO: entry price → equity check → exit value → MOIC. Every PE interview question traces this chain.",
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
        explanation:
          "Enterprise Value (EV) is what the buyer pays for the whole business — equity + debt. In an LBO you pay a multiple of EBITDA: EV = EBITDA × entry multiple.",
        answer: 360,
        tolerance: 0.001,
        hint: "EBITDA × entry multiple  →  45 × 8 = ?",
        unit: "$M",
      },
      {
        id: "q2",
        question: "What is the sponsor equity check ($M)?",
        explanation:
          "The sponsor (PE firm) funds the part of the purchase price that isn't borrowed. Equity check = EV − total debt borrowed. Total debt = EBITDA × debt multiple.",
        answer: 112.5,
        tolerance: 0.02,
        hint: "Entry EV − (EBITDA × debt multiple)  →  360 − (45 × 5.5) = ?",
        unit: "$M",
      },
      {
        id: "q3",
        question:
          "What is the exit EBITDA after 5 years of 8% annual growth ($M)?",
        explanation:
          "Each year EBITDA grows 8%, compounding. Compound growth formula: Exit EBITDA = Starting EBITDA × (1 + growth rate)^years.",
        answer: 66.1,
        tolerance: 0.02,
        hint: "45 × (1.08)^5  →  45 × 1.469 ≈ ?",
        unit: "$M",
      },
      {
        id: "q4",
        question: "What is the exit Enterprise Value ($M)?",
        explanation:
          "At exit the buyer pays an EBITDA multiple again. Exit EV = exit EBITDA × exit multiple.",
        answer: 495.7,
        tolerance: 0.02,
        hint: "Exit EBITDA × exit multiple  →  66.1 × 7.5 = ?",
        unit: "$M",
      },
      {
        id: "q5",
        question:
          "Approximately what MOIC does the sponsor earn? (assume minimal debt paydown)",
        explanation:
          "MOIC (Multiple on Invested Capital) = how many times the sponsor gets back their equity. MOIC = (Exit EV − entry debt) ÷ entry equity check.",
        answer: 2.2,
        tolerance: 0.08,
        hint: "(Exit EV − entry debt) ÷ entry equity  →  (495.7 − 247.5) ÷ 112.5 ≈ ?",
        unit: "x",
      },
    ],
  },
];

/** Scenario that is currently active for the challenge. */
export const WEEKLY_SCENARIO: WeeklyScenario = ALL_SCENARIOS[0];

/**
 * Returns the scenario the admin has pinned via localStorage, falling back to
 * the default. Only the weekId is stored — the full object lives in code so
 * members always see the canonical server-side copy.
 */
export function getActiveScenario(): WeeklyScenario {
  try {
    const pinned = localStorage.getItem("fundsim_challenge_weekId");
    if (pinned) {
      const found = ALL_SCENARIOS.find((s) => s.weekId === pinned);
      if (found) return found;
    }
  } catch {
    // localStorage unavailable — fall through
  }
  return WEEKLY_SCENARIO;
}

/**
 * Admin: pin a scenario by weekId. Call from browser console or an admin UI.
 * E.g.: pinChallengeScenario("2026-W22")
 */
export function pinChallengeScenario(weekId: string): boolean {
  const found = ALL_SCENARIOS.find((s) => s.weekId === weekId);
  if (!found) return false;
  try {
    localStorage.setItem("fundsim_challenge_weekId", weekId);
  } catch {
    return false;
  }
  return true;
}
