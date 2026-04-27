import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useFinFox } from "../../hooks/useFinFox";
import { callFinFox } from "../../utils/finfoxApi";
import type { FinFoxSim } from "./FinFoxProvider";
import { FoxSvg } from "./FinFoxMascot";

interface NegotiationConfig {
  sim: FinFoxSim;
  character: { name: string; title: string };
  scenario: Record<string, string | number>;
  mode: "founder" | "pe_seller" | "ib_client";
  systemPrompt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_EXCHANGES = 8;

interface Props {
  config: NegotiationConfig;
}

function renderBoldText(text: string): React.ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ color: "#F9FAFB" }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function NegotiationPanel({ config }: Props) {
  const { closeNegotiation, setExpression } = useFinFox();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi, I'm ${config.character.name}, ${config.character.title}. I'm ready to discuss terms. What's your offer?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dealDone, setDealDone] = useState(false);
  const [breakdown, setBreakdown] = useState<string | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const exchangeCount = messages.filter((m) => m.role === "user").length;
  const isOver = dealDone || exchangeCount >= MAX_EXCHANGES;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || isOver) return;

    setInput("");
    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setExpression("thinking");

    try {
      const answer = await callFinFox({
        mode: config.mode,
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt: config.systemPrompt,
      });

      const lower = answer.toLowerCase();
      const isDone =
        lower.includes("we have a deal") ||
        lower.includes("i'll walk away") ||
        lower.includes("walking away") ||
        lower.includes("deal is off") ||
        lower.includes("consider this closed") ||
        lower.includes("we're done here") ||
        exchangeCount + 1 >= MAX_EXCHANGES;

      const finalMessages = [
        ...newMessages,
        { role: "assistant" as const, content: answer },
      ];
      setMessages(finalMessages);

      if (isDone) {
        setDealDone(true);
        setExpression("neutral");
        fetchBreakdown(finalMessages);
      } else {
        setExpression("neutral");
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant" as const, content: "Sorry, something went wrong." },
      ]);
      setExpression("neutral");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBreakdown(transcript: Message[]) {
    setLoadingBreakdown(true);
    const transcriptText = transcript
      .map(
        (m) =>
          `${m.role === "user" ? "User" : config.character.name}: ${m.content}`,
      )
      .join("\n");
    const roleLabel =
      config.mode === "founder"
        ? "VC investor"
        : config.mode === "pe_seller"
          ? "PE partner"
          : "investment banker";
    const breakdownPrompt = `You just completed a negotiation role-play. Transcript:\n\n${transcriptText}\n\nStep out of character. Provide a 4-part breakdown:\n1. What the user did well\n2. What the user missed\n3. What a real ${roleLabel} would have done differently\n4. What to try next\n\nBe specific — reference exact moments. No emojis. Use **bold** for key points.`;

    try {
      const result = await callFinFox({
        mode: "breakdown",
        messages: [{ role: "user", content: breakdownPrompt }],
        systemPrompt:
          "You are FinFox stepping out of character to provide an educational negotiation debrief. Be direct, specific, and constructive. No emojis.",
      });
      setBreakdown(result);
    } catch {
      setBreakdown("Could not generate breakdown. Try refreshing.");
    } finally {
      setLoadingBreakdown(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="negotiation-panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 450,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(10,15,28,0.85)",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#111827",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #1F2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#0D1220",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FoxSvg expression={loading ? "thinking" : "neutral"} size={36} />
              <div>
                <div
                  style={{ color: "#F9FAFB", fontWeight: 700, fontSize: 13 }}
                >
                  {config.character.name}
                </div>
                <div style={{ color: "#6B7280", fontSize: 11 }}>
                  {config.character.title}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#4B5563", fontSize: 11 }}>
                {exchangeCount}/{MAX_EXCHANGES} exchanges
              </span>
              <button
                onClick={closeNegotiation}
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
          </div>

          {/* Scenario context bar */}
          <div
            style={{
              padding: "8px 20px",
              background: "rgba(245,158,11,0.05)",
              borderBottom: "1px solid rgba(245,158,11,0.15)",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 14px",
            }}
          >
            {Object.entries(config.scenario).map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, color: "#9CA3AF" }}>
                <span style={{ color: "#6B7280" }}>{k}: </span>
                <span style={{ color: "#F59E0B", fontWeight: 600 }}>{v}</span>
              </span>
            ))}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    <FoxSvg expression="neutral" size={28} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 2px 14px"
                        : "14px 14px 14px 2px",
                    background:
                      msg.role === "user" ? "rgba(245,158,11,0.12)" : "#1F2937",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(245,158,11,0.3)"
                        : "1px solid #374151",
                    color: "#D1D5DB",
                    fontSize: 13,
                    lineHeight: 1.65,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <div style={{ flexShrink: 0, marginTop: 4 }}>
                  <FoxSvg expression="thinking" size={28} />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 2px",
                    background: "#1F2937",
                    border: "1px solid #374151",
                    display: "flex",
                    gap: 4,
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
                </div>
              </div>
            )}

            {loadingBreakdown && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#818CF8",
                  fontSize: 13,
                }}
              >
                FinFox is stepping out of character to review your
                performance...
              </div>
            )}

            {breakdown && (
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <div
                  style={{
                    color: "#818CF8",
                    fontWeight: 700,
                    fontSize: 12,
                    marginBottom: 10,
                    letterSpacing: "0.06em",
                  }}
                >
                  FINFOX — OUT OF CHARACTER
                </div>
                <div
                  style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 1.7 }}
                >
                  {renderBoldText(breakdown)}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!isOver && (
            <div
              style={{
                padding: "12px 16px",
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
                placeholder="Make your offer..."
                disabled={loading}
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
                disabled={!input.trim() || loading}
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
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export type { NegotiationConfig };
