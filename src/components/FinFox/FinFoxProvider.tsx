import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type FinFoxSim = "vc" | "pe" | "ib";
export type FinFoxExpression = "neutral" | "thinking" | "approving";

export interface FinFoxContextType {
  disabled: boolean;
  chatOpen: boolean;
  preloadedQuestion: string | null;
  activeSim: FinFoxSim | null;
  activeScreen: string;
  negotiationOpen: boolean;
  negotiationSim: FinFoxSim | null;
  expression: FinFoxExpression;
  openChat: (question?: string) => void;
  closeChat: () => void;
  setActiveSim: (sim: FinFoxSim | null) => void;
  setActiveScreen: (screen: string) => void;
  setExpression: (expr: FinFoxExpression) => void;
  openNegotiation: (sim: FinFoxSim) => void;
  closeNegotiation: () => void;
  toggleDisabled: () => void;
}

export const FinFoxContext = createContext<FinFoxContextType | null>(null);

export function FinFoxProvider({ children }: { children: React.ReactNode }) {
  const [disabled, setDisabled] = useState(
    () => localStorage.getItem("finfox_disabled") === "true",
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [preloadedQuestion, setPreloadedQuestion] = useState<string | null>(
    null,
  );

  const [activeSim, setActiveSim] = useState<FinFoxSim | null>(null);
  const [activeScreen, setActiveScreen] = useState("home");

  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [negotiationSim, setNegotiationSim] = useState<FinFoxSim | null>(null);

  const [expression, setExpression] = useState<FinFoxExpression>("neutral");

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

  const openNegotiation = useCallback((sim: FinFoxSim) => {
    setNegotiationSim(sim);
    setNegotiationOpen(true);
  }, []);

  const closeNegotiation = useCallback(() => {
    setNegotiationOpen(false);
    setNegotiationSim(null);
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

  const value: FinFoxContextType = {
    disabled,
    chatOpen,
    preloadedQuestion,
    activeSim,
    activeScreen,
    negotiationOpen,
    negotiationSim,
    expression,
    openChat,
    closeChat,
    setActiveSim,
    setActiveScreen,
    setExpression,
    openNegotiation,
    closeNegotiation,
    toggleDisabled,
  };

  return (
    <FinFoxContext.Provider value={value}>{children}</FinFoxContext.Provider>
  );
}
