import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type FinFoxSim = "vc" | "pe" | "ib";
export type FinFoxExpression = "neutral" | "thinking" | "approving";
export type FinFoxCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface FinFoxContextType {
  seen: boolean;
  disabled: boolean;
  showOnboarding: boolean;
  chatOpen: boolean;
  preloadedQuestion: string | null;
  activeSim: FinFoxSim | null;
  activeScreen: string;
  tourActive: boolean;
  tourSim: FinFoxSim | null;
  tourStep: number;
  tourCompleted: boolean;
  foxCorner: FinFoxCorner;
  negotiationOpen: boolean;
  negotiationSim: FinFoxSim | null;
  expression: FinFoxExpression;
  openChat: (question?: string) => void;
  closeChat: () => void;
  setActiveSim: (sim: FinFoxSim | null) => void;
  setActiveScreen: (screen: string) => void;
  setExpression: (expr: FinFoxExpression) => void;
  startTour: (sim?: FinFoxSim) => void;
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

// Number of steps in each simulator's tour. Kept in sync with TOUR_STEPS in GuidedTour.tsx.
const TOUR_STEPS_COUNT: Record<FinFoxSim, number> = { vc: 8, pe: 5, ib: 5 };

function tourKey(sim: FinFoxSim): string {
  return `${sim}_tour_completed`;
}

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
  const [tourSim, setTourSim] = useState<FinFoxSim | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(
    () => localStorage.getItem("vc_tour_completed") === "true",
  );

  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [negotiationSim, setNegotiationSim] = useState<FinFoxSim | null>(null);

  const [expression, setExpression] = useState<FinFoxExpression>("neutral");

  const tourActiveRef = useRef(false);
  const tourStepRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const foxCorner: FinFoxCorner = "bottom-right";

  const openChat = useCallback((question?: string) => {
    setPreloadedQuestion(question ?? null);
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setPreloadedQuestion(null);
  }, []);

  // Use ref to always have fresh openChat in event listener
  const openChatRef = useRef(openChat);
  openChatRef.current = openChat;

  useEffect(() => {
    const handler = (e: Event) => {
      const term = (e as CustomEvent<string>).detail;
      openChatRef.current(term);
    };
    window.addEventListener("finfox:open-term", handler);
    return () => window.removeEventListener("finfox:open-term", handler);
  }, []);

  // Keyboard shortcut: ? opens FinFox chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        openChatRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const startTour = useCallback((sim: FinFoxSim = "vc") => {
    setTourStep(0);
    tourStepRef.current = 0;
    setTourSim(sim);
    setTourActive(true);
    tourActiveRef.current = true;
    setChatOpen(false);
    // Default first-step tab per simulator
    const firstTab =
      sim === "vc" ? "captable" : sim === "pe" ? "lifecycle" : "main";
    window.dispatchEvent(
      new CustomEvent("finfox:navigate", { detail: { sim, tab: firstTab } }),
    );
  }, []);

  const nextTourStep = useCallback(() => {
    const sim = tourSim;
    setTourStep((prev) => {
      const total = sim ? TOUR_STEPS_COUNT[sim] : 0;
      const next = prev + 1;
      if (!sim || next >= total) {
        setTourActive(false);
        tourActiveRef.current = false;
        setTourCompleted(true);
        if (sim) localStorage.setItem(tourKey(sim), "true");
        return prev;
      }
      tourStepRef.current = next;
      return next;
    });
  }, [tourSim]);

  const prevTourStep = useCallback(() => {
    setTourStep((prev) => {
      const next = Math.max(0, prev - 1);
      tourStepRef.current = next;
      return next;
    });
  }, []);

  const skipTour = useCallback(() => {
    setTourActive(false);
    tourActiveRef.current = false;
    setTourCompleted(true);
    if (tourSim) localStorage.setItem(tourKey(tourSim), "true");
  }, [tourSim]);

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
      // Start a guided tour for whichever simulator the user picked. Skip if
      // they've already completed that sim's tour before.
      if (localStorage.getItem(tourKey(sim)) !== "true") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => startTour(sim), 600);
      }
    },
    [startTour],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
    localStorage.removeItem("pe_tour_completed");
    localStorage.removeItem("ib_tour_completed");
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
    tourSim,
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
