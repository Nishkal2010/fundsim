import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, RotateCcw } from "lucide-react";
import { useFinFox } from "../../hooks/useFinFox";
import { finfoxGlossary } from "../../data/finfoxGlossary";
import { trackEvent } from "../../lib/analytics";
import {
  callFinFox,
  getCachedAnswer,
  getRemainingQueries,
  incrementQueryCount,
  setCachedAnswer,
  seedCache,
  coerceScreen,
} from "../../utils/finfoxApi";

seedCache();

const STORAGE_KEY = "finfox_messages";
const MAX_STORED_MESSAGES = 20;
const MAX_CACHE_HIT_EVENTS = 5;
let cacheHitEventCount = 0;

const QUICK_CHIPS: Record<string, string[]> = {
  // sim-screen compound keys (highest priority)
  "vc-captable": [
    "What's pre-money?",
    "How does dilution work?",
    "Explain the cap table",
  ],
  "vc-termsheet": [
    "What's a liq pref?",
    "Should I give board seats?",
    "Explain anti-dilution",
  ],
  "vc-safe": [
    "SAFE vs convertible note?",
    "What's a valuation cap?",
    "Explain discount rate",
  ],
  "pe-lifecycle": [
    "What's a hurdle rate?",
    "Explain carry",
    "What's a J-curve?",
  ],
  "pe-lbo": ["What's a good debt ratio?", "Explain LBO", "What's EBITDA?"],
  "pe-gplp": ["What is 2 and 20?", "Explain carry", "What's DPI vs TVPI?"],
  "ib-main": ["M&A vs IPO?", "What are comps?", "Explain accretion/dilution"],
  // screen-only keys (fallback when no sim prefix matches)
  lbo: [
    "Walk me through an LBO model",
    "How does debt paydown create equity value?",
    "What's a typical LBO leverage ratio?",
  ],
  waterfall: [
    "How does a PE waterfall work?",
    "What is the catch-up provision?",
    "European vs American waterfall — what's the difference?",
  ],
  jcurve: [
    "What is the J-curve in PE?",
    "Why do PE funds show negative early returns?",
    "What does DPI vs TVPI mean?",
  ],
  performance: [
    "What is PME?",
    "How do GPs calculate net IRR?",
    "What's a good MOIC for a PE fund?",
  ],
  portfolio: [
    "How do PE firms build a portfolio?",
    "What is loss ratio in PE?",
    "What's a typical PE fund's number of investments?",
  ],
  captable: [
    "How does a cap table work?",
    "What is pro-rata rights?",
    "How does a SAFE convert in a priced round?",
  ],
  termsheet: [
    "What are the key VC term sheet terms?",
    "What is a liquidation preference?",
    "What does 1x non-participating mean?",
  ],
  safe: [
    "What is a SAFE note?",
    "How does a SAFE valuation cap work?",
    "SAFE vs convertible note — which is better?",
  ],
  lifecycle: [
    "What is a fund's investment period?",
    "How do management fees work?",
    "What is GP commitment?",
  ],
  valuation: [
    "How do you value a startup?",
    "What is a DCF?",
    "How do VCs set pre-money valuation?",
  ],
  main: [
    "What does an investment banker do?",
    "How does M&A accretion work?",
    "What is a fairness opinion?",
  ],
  debt: [
    "What is leveraged finance?",
    "How is DSCR calculated?",
    "What's a typical LBO debt structure?",
  ],
  // generic fallback
  "": [
    "What is an LBO?",
    "How does carried interest work?",
    "What's the difference between IRR and MOIC?",
  ],
};

const GREETINGS: Record<string, string> = {
  vc: "You're in the VC simulator. Ask me anything — dilution, term sheets, cap tables, valuations.",
  pe: "You're in the PE simulator. Ask about LBOs, carry, fund economics, or deal mechanics.",
  ib: "You're in the IB simulator. Ask about M&A, DCF, accretion/dilution, or deal structuring.",
  general:
    "Ask me anything about finance. Pre-money, IRR, carry, accretion — I'll explain it plainly.",
};

function getChips(sim: string | null, screen: string): string[] {
  if (sim && screen) {
    const compoundKey = `${sim}-${screen}`;
    if (QUICK_CHIPS[compoundKey]) return QUICK_CHIPS[compoundKey];
  }
  if (screen && QUICK_CHIPS[screen]) return QUICK_CHIPS[screen];
  if (sim === "vc") return QUICK_CHIPS["vc-captable"];
  if (sim === "pe") return QUICK_CHIPS["pe-lifecycle"];
  if (sim === "ib") return QUICK_CHIPS["ib-main"];
  return QUICK_CHIPS[""];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function loadStoredMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .map((m) => ({ role: m.role, content: m.content }));
  } catch {
    return [];
  }
}

// Simulates streaming by revealing text character by character
function useStreamingText(
  targetText: string,
  active: boolean,
  onDone: () => void,
): string {
  const [displayed, setDisplayed] = useState("");
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- onDone read via ref to avoid restarting the typewriter on every parent render
  useEffect(() => {
    if (!active || !targetText) {
      setDisplayed(targetText);
      return;
    }

    indexRef.current = 0;
    setDisplayed("");

    const step = () => {
      indexRef.current++;
      const chunk = targetText.slice(0, indexRef.current);
      setDisplayed(chunk);
      if (indexRef.current < targetText.length) {
        // Variable speed: faster for spaces, slower for end of sentences
        const char = targetText[indexRef.current - 1];
        const delay = char === "." || char === "?" ? 30 : char === " " ? 6 : 12;
        frameRef.current = setTimeout(step, delay);
      } else {
        onDoneRef.current();
      }
    };

    frameRef.current = setTimeout(step, 16);
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, [targetText, active]);

  return displayed;
}

function StreamingMessage({
  content,
  onDone,
}: {
  content: string;
  onDone: () => void;
}) {
  const text = useStreamingText(content, true, onDone);
  return (
    <span>
      {text}
      {text.length < content.length && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "#10B981",
            marginLeft: 1,
            verticalAlign: "middle",
            animation: "finfox-cursor-blink 0.7s steps(1) infinite",
          }}
        />
      )}
    </span>
  );
}

export function ChatPanel() {
  const {
    chatOpen,
    closeChat,
    preloadedQuestion,
    activeSim,
    activeScreen,
    setExpression,
  } = useFinFox();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() =>
    loadStoredMessages(),
  );
  const [loading, setLoading] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null);
  const [remainingQueries, setRemainingQueries] = useState(
    getRemainingQueries(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef<Set<string>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Persist messages to sessionStorage, throttled to once per second
  useEffect(() => {
    const persist = () => {
      try {
        const trimmed = messages
          .slice(-MAX_STORED_MESSAGES)
          .map(({ role, content }) => ({ role, content }));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        lastSaveRef.current = Date.now();
      } catch {
        // ignore quota or serialization errors
      }
    };

    const elapsed = Date.now() - lastSaveRef.current;
    if (elapsed >= 1000) {
      persist();
    } else {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(persist, 1000 - elapsed);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (!chatOpen) return;
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [chatOpen]);

  // Memoized so the preloadedQuestion effect captures the latest state instead
  // of a stale first-render closure over messages/loading/sim/screen.
  const sendMessage = useCallback(
    async (text: string, skipInputClear = false) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      if (remainingQueries <= 0) return;

      if (!skipInputClear) setInput("");

      const userMsg: Message = { role: "user", content: trimmed };
      const newMessages: Message[] = [...messages, userMsg];
      setMessages(newMessages);
      setLoading(true);
      setExpression("thinking");
      scrollToBottom();

      const cached = getCachedAnswer(trimmed);
      if (cached) {
        if (cacheHitEventCount < MAX_CACHE_HIT_EVENTS) {
          trackEvent("finfox_cache_hit", { sim: activeSim ?? "general" });
          cacheHitEventCount++;
        }
        const assistantIdx = newMessages.length;
        setMessages([
          ...newMessages,
          { role: "assistant", content: cached, streaming: true },
        ]);
        setStreamingIdx(assistantIdx);
        setLoading(false);
        setExpression("approving");
        setTimeout(() => setExpression("neutral"), 3000);
        return;
      }

      try {
        const answer = await callFinFox({
          mode: "tutor",
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sim: activeSim,
          screen: coerceScreen(activeScreen),
        });

        incrementQueryCount();
        const newCount = getRemainingQueries();
        setRemainingQueries(newCount);
        setCachedAnswer(trimmed, answer);
        trackEvent("finfox_question_asked", {
          sim: activeSim ?? "general",
          screen: activeScreen ?? "",
          length: trimmed.length,
        });
        const assistantIdx = newMessages.length;
        setMessages([
          ...newMessages,
          { role: "assistant", content: answer, streaming: true },
        ]);
        setStreamingIdx(assistantIdx);
        setExpression("approving");
        setTimeout(() => setExpression("neutral"), 3000);
      } catch {
        trackEvent("finfox_error", { sim: activeSim ?? "general" });
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Network error — try again in a moment.",
          },
        ]);
        setExpression("neutral");
      } finally {
        setLoading(false);
      }
    },
    [
      messages,
      loading,
      remainingQueries,
      activeSim,
      activeScreen,
      setExpression,
      scrollToBottom,
    ],
  );

  // Handle preloaded questions — auto-send them
  useEffect(() => {
    if (!chatOpen || !preloadedQuestion) return;
    // Deduplicate — don't auto-send the same question twice in a session
    if (sentRef.current.has(preloadedQuestion)) return;
    sentRef.current.add(preloadedQuestion);

    // Glossary hit: inject directly without API call
    const glossEntry = finfoxGlossary[preloadedQuestion];
    if (glossEntry) {
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "user" as const, content: `Explain: ${preloadedQuestion}` },
          {
            role: "assistant" as const,
            content: glossEntry.long,
            streaming: true,
          },
        ];
        setStreamingIdx(next.length - 1);
        return next;
      });
      scrollToBottom();
      return;
    }

    // Auto-send to API
    sendMessage(preloadedQuestion, true);
  }, [chatOpen, preloadedQuestion, sendMessage, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sentRef.current.clear();
    setStreamingIdx(null);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const greeting = GREETINGS[activeSim ?? "general"];
  const chips = getChips(activeSim, activeScreen);
  const showChips = messages.length === 0;
  const rateLimited = remainingQueries <= 0;

  return (
    <>
      <style>{`
        @keyframes finfox-dot-fade {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes finfox-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: 76,
              right: 20,
              width: 360,
              maxHeight: 520,
              background: "#0D1117",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              zIndex: 300,
              overflow: "hidden",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.06)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(16,185,129,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 6px #10B981",
                  }}
                />
                <span
                  style={{ color: "#F9FAFB", fontWeight: 600, fontSize: 13 }}
                >
                  FinFox
                </span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
                  {remainingQueries} left today
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    title="Clear conversation"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.25)",
                      padding: 4,
                      display: "flex",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.6)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.25)")
                    }
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                <button
                  onClick={closeChat}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    padding: 4,
                    display: "flex",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.7)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.3)")
                  }
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 14px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                scrollbarWidth: "none",
              }}
            >
              {/* Greeting when empty */}
              {messages.length === 0 && (
                <>
                  <div
                    style={{
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.12)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.6,
                    }}
                  >
                    {greeting}
                  </div>
                </>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      padding: "9px 13px",
                      borderRadius:
                        msg.role === "user"
                          ? "14px 14px 3px 14px"
                          : "14px 14px 14px 3px",
                      background:
                        msg.role === "user"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        msg.role === "user"
                          ? "1px solid rgba(16,185,129,0.25)"
                          : "1px solid rgba(255,255,255,0.07)",
                      color:
                        msg.role === "user"
                          ? "#D1FAE5"
                          : "rgba(255,255,255,0.8)",
                      fontSize: 13,
                      lineHeight: 1.65,
                    }}
                  >
                    {msg.role === "assistant" &&
                    msg.streaming &&
                    streamingIdx === i ? (
                      <StreamingMessage
                        content={msg.content}
                        onDone={() => setStreamingIdx(null)}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "11px 16px",
                      borderRadius: "14px 14px 14px 3px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#10B981",
                          animation: `finfox-dot-fade 1.2s ease-in-out ${i * 0.18}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {rateLimited && !loading && (
                <div
                  style={{
                    padding: "10px 13px",
                    borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.06)",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  30-question daily limit reached. Resets at midnight.
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick chips — only when no messages */}
            {showChips && (
              <div
                style={{
                  padding: "0 14px 8px",
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#D1FAE5";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(16,185,129,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.45)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                  if (e.key === "Escape") closeChat();
                }}
                placeholder={
                  rateLimited ? "Daily limit reached" : "Ask FinFox..."
                }
                disabled={loading || rateLimited}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  color: "#F9FAFB",
                  fontSize: 13,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    "rgba(16,185,129,0.4)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading || rateLimited}
                style={{
                  width: 34,
                  height: 34,
                  background:
                    input.trim() && !loading && !rateLimited
                      ? "#10B981"
                      : "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: 10,
                  cursor:
                    input.trim() && !loading && !rateLimited
                      ? "pointer"
                      : "default",
                  color:
                    input.trim() && !loading && !rateLimited
                      ? "#fff"
                      : "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={14} />
              </button>
            </div>

            {/* Keyboard hint */}
            <div style={{ textAlign: "center", padding: "0 14px 10px" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
                Press{" "}
                <kbd
                  style={{
                    fontFamily: "monospace",
                    padding: "1px 4px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 3,
                  }}
                >
                  ?
                </kbd>{" "}
                anywhere to open ·{" "}
                <kbd
                  style={{
                    fontFamily: "monospace",
                    padding: "1px 4px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 3,
                  }}
                >
                  Esc
                </kbd>{" "}
                to close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
