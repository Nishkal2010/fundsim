import React, { createContext, useCallback, useEffect, useState } from "react";

export type FinFoxSim = "vc" | "pe" | "ib";
export type FinFoxExpression = "neutral" | "thinking" | "approving";
export type FinFoxCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface FinFoxContextType {
  // Visibility state
  seen: boolean;
  disabled: boolean;
  showOnboarding: boolean;

  // Chat state
  chatOpen: boolean;
  preloadedQuestion: string | null;

  // Active context
  activeSim: FinFoxSim | null;
  activeScreen: string;

  // Tour state
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  foxCorner: FinFoxCorner;

  // Negotiation state
  negotiationOpen: boolean;
  negotiationSim: FinFoxSim | null;

  // Fox expression
  expression: FinFoxExpression;

  // Actions
  openChat: (question?: string) => void;
  closeChat: () => void;
  setActiveSim: (sim: FinFoxSim | null) => void;
  setActiveScreen: (screen: string) => void;
  setExpression: (expr: FinFoxExpression) => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  openNegotiation: (sim: FinFoxSim) => void;
  closeNegotiation: () => void;
  dismissOnboarding: () => void;
  completeOnboardingWalkthrough: (sim: FinFoxSim) => void;
  resetOnboarding: () => void;
  toggleDisabled: () => void;
  resetTour: () => void;
}

export const FinFoxContext = createContext<FinFoxContextType | null>(null);

// Tour step → fox corner mapping (spec: steps 1,3,7 = top-right; 2,4 = bottom-right; 5 = top-left; 6 = bottom-left; 8 = bottom-right)
const TOUR_CORNERS: FinFoxCorner[] = [
  "top-right", // step 1
  "bottom-right", // step 2
  "top-right", // step 3
  "bottom-right", // step 4
  "top-left", // step 5
  "bottom-left", // step 6
  "top-right", // step 7
  "bottom-right", // step 8
];

export function FinFoxProvider({ children }: { children: React.ReactNode }) {
  const [seen, setSeen] = useState(
    () => localStorage.getItem("finfox_seen") === "true",
  );
  const [disabled, setDisabled] = useState(
    () => localStorage.getItem("finfox_disabled") === "true",
  );
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem("finfox_seen") !== "true",
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [preloadedQuestion, setPreloadedQuestion] = useState<string | null>(
    null,
  );

  const [activeSim, setActiveSim] = useState<FinFoxSim | null>(null);
  const [activeScreen, setActiveScreen] = useState("home");

  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(
    () => localStorage.getItem("vc_tour_completed") === "true",
  );

  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [negotiationSim, setNegotiationSim] = useState<FinFoxSim | null>(null);

  const [expression, setExpression] = useState<FinFoxExpression>("neutral");

  const foxCorner: FinFoxCorner = tourActive
    ? (TOUR_CORNERS[tourStep] ?? "bottom-right")
    : "bottom-right";

  // Listen for finfox:open-term custom events from Tooltip clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const term = (e as CustomEvent<string>).detail;
      openChat(term);
    };
    window.addEventListener("finfox:open-term", handler);
    return () => window.removeEventListener("finfox:open-term", handler);
  }, []);

  const openChat = useCallback((question?: string) => {
    setPreloadedQuestion(question ?? null);
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setPreloadedQuestion(null);
  }, []);

  const startTour = useCallback(() => {
    setTourStep(0);
    setTourActive(true);
    setChatOpen(false);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep((prev) => {
      const next = prev + 1;
      if (next >= 8) {
        // Tour complete
        setTourActive(false);
        setTourCompleted(true);
        localStorage.setItem("vc_tour_completed", "true");
        return 7;
      }
      return next;
    });
  }, []);

  const prevTourStep = useCallback(() => {
    setTourStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setTourActive(false);
    setTourCompleted(true);
    localStorage.setItem("vc_tour_completed", "true");
  }, []);

  const openNegotiation = useCallback((sim: FinFoxSim) => {
    setNegotiationSim(sim);
    setNegotiationOpen(true);
  }, []);

  const closeNegotiation = useCallback(() => {
    setNegotiationOpen(false);
    setNegotiationSim(null);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setSeen(true);
    setShowOnboarding(false);
    localStorage.setItem("finfox_seen", "true");
  }, []);

  const completeOnboardingWalkthrough = useCallback(
    (sim: FinFoxSim) => {
      setSeen(true);
      setShowOnboarding(false);
      localStorage.setItem("finfox_seen", "true");
      if (sim === "vc" && !tourCompleted) {
        // Start tour after a short delay so the modal can fade
        setTimeout(() => startTour(), 600);
      }
    },
    [tourCompleted, startTour],
  );

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem("finfox_seen");
    setSeen(false);
    setShowOnboarding(true);
  }, []);

  const toggleDisabled = useCallback(() => {
    setDisabled((prev) => {
      const next = !prev;
      if (next) {
        localStorage.setItem("finfox_disabled", "true");
      } else {
        localStorage.removeItem("finfox_disabled");
      }
      return next;
    });
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem("vc_tour_completed");
    setTourCompleted(false);
  }, []);

  const value: FinFoxContextType = {
    seen,
    disabled,
    showOnboarding,
    chatOpen,
    preloadedQuestion,
    activeSim,
    activeScreen,
    tourActive,
    tourStep,
    tourCompleted,
    foxCorner,
    negotiationOpen,
    negotiationSim,
    expression,
    openChat,
    closeChat,
    setActiveSim,
    setActiveScreen,
    setExpression,
    startTour,
    nextTourStep,
    prevTourStep,
    skipTour,
    openNegotiation,
    closeNegotiation,
    dismissOnboarding,
    completeOnboardingWalkthrough,
    resetOnboarding,
    toggleDisabled,
    resetTour,
  };

  return (
    <FinFoxContext.Provider value={value}>{children}</FinFoxContext.Provider>
  );
}
