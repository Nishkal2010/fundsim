import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useFinFox } from "../../hooks/useFinFox";
import { finfoxGlossary } from "../../data/finfoxGlossary";
import {
  callFinFox,
  getCachedAnswer,
  getRemainingQueries,
  incrementQueryCount,
  setCachedAnswer,
  seedCache,
} from "../../utils/finfoxApi";

// Seed cache on first load
seedCache();

const QUICK_CHIPS: Record<string, string[]> = {
  "vc-captable": [
    "What's pre-money?",
    "How much equity should I give up?",
    "Explain dilution",
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
};

function getChips(sim: string | null, screen: string): string[] {
  if (sim && screen) {
    const key = `${sim}-${screen}`;
    if (QUICK_CHIPS[key]) return QUICK_CHIPS[key];
  }
  if (sim === "vc") return QUICK_CHIPS["vc-captable"];
  if (sim === "pe") return QUICK_CHIPS["pe-lifecycle"];
  if (sim === "ib") return QUICK_CHIPS["ib-main"];
  return ["What's pre-money?", "Explain carry", "What is an LBO?"];
}

function buildSystemPrompt(sim: string | null, screen: string): string {
  return `You are FinFox, a finance tutor for users learning on FundSim.
Current context: Sim: ${sim ?? "general"}, Screen: ${screen}.
Rules: Max 3 sentences. Plain English. Zero finance background assumed.
Define terms and give one concrete example using numbers when possible.
If off-topic: redirect to 3 contextual finance topics.
Never say "as an AI". You are FinFox. No emojis. Ever.`;
}

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load preloaded question when panel opens
  useEffect(() => {
    if (!chatOpen) return;
    setTimeout(() => inputRef.current?.focus(), 100);

    if (preloadedQuestion) {
      // Check if it's a glossary long-form request
      const glossEntry = finfoxGlossary[preloadedQuestion];
      if (glossEntry) {
        setMessages([
          { role: "user", content: `Explain: ${preloadedQuestion}` },
          { role: "assistant", content: glossEntry.long },
        ]);
        setInput("");
        return;
      }
      setInput(preloadedQuestion);
    }
  }, [chatOpen, preloadedQuestion]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (getRemainingQueries() <= 0) {
      setRateLimited(true);
      return;
    }

    setInput("");
    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setExpression("thinking");

    // Check cache first
    const cached = getCachedAnswer(trimmed);
    if (cached) {
      setMessages([...newMessages, { role: "assistant", content: cached }]);
      setLoading(false);
      setExpression("approving");
      setTimeout(() => setExpression("neutral"), 3000);
      return;
    }

    try {
      incrementQueryCount();
      const answer = await callFinFox({
        mode: "tutor",
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt: buildSystemPrompt(activeSim, activeScreen),
      });

      setCachedAnswer(trimmed, answer);
      setMessages([...newMessages, { role: "assistant", content: answer }]);
      setExpression("approving");
      setTimeout(() => setExpression("neutral"), 3000);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Try again in a moment.",
        },
      ]);
      setExpression("neutral");
    } finally {
      setLoading(false);
    }
  }

  const chips = getChips(activeSim, activeScreen);

  return (
    <AnimatePresence>
      {chatOpen && (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            bottom: 104,
            right: 24,
            width: 360,
            height: 480,
            background: "#111827",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 16,
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            zIndex: 300,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #1F2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#0D1220",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  boxShadow: "0 0 6px #F59E0B",
                }}
              />
              <span style={{ color: "#F9FAFB", fontWeight: 700, fontSize: 13 }}>
                FinFox
              </span>
              <span style={{ color: "#4B5563", fontSize: 11 }}>
                {getRemainingQueries()} questions left today
              </span>
            </div>
            <button
              onClick={closeChat}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6B7280",
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  textAlign: "center",
                  marginTop: 24,
                }}
              >
                Ask anything about finance. No background needed.
              </div>
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
                    maxWidth: "82%",
                    padding: "8px 12px",
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    background:
                      msg.role === "user" ? "rgba(245,158,11,0.15)" : "#1F2937",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(245,158,11,0.3)"
                        : "1px solid #374151",
                    color: "#D1D5DB",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px 12px 12px 2px",
                    background: "#1F2937",
                    border: "1px solid #374151",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#F59E0B",
                        animation: `finfox-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                  <style>{`
                    @keyframes finfox-dot-bounce {
                      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                      40% { transform: scale(1.2); opacity: 1; }
                    }
                  `}</style>
                </div>
              </div>
            )}

            {rateLimited && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                  fontSize: 12,
                }}
              >
                Daily limit of 30 questions reached. Resets at midnight.
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          {messages.length === 0 && (
            <div
              style={{
                padding: "0 12px 8px",
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
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 11,
                    color: "#F59E0B",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
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
              padding: "10px 12px",
              borderTop: "1px solid #1F2937",
              display: "flex",
              gap: 8,
              background: "#0D1220",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask FinFox anything..."
              disabled={loading || rateLimited}
              style={{
                flex: 1,
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#F9FAFB",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || rateLimited}
              style={{
                background: input.trim() && !loading ? "#F59E0B" : "#374151",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: input.trim() && !loading ? "pointer" : "default",
                color: input.trim() && !loading ? "#111827" : "#6B7280",
                transition: "all 0.18s ease",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
