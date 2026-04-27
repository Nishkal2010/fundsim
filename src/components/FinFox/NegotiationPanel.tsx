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
      <strong key={i} style={{ color: "#F9FAFB", fontWeight: 600 }}>
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
          background: "rgba(10,15,28,0.88)",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#111827",
            border: "1px solid #1F2937",
            borderRadius: 14,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #1F2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FoxSvg expression={loading ? "thinking" : "neutral"} size={34} />
              <div>
                <div
                  style={{ color: "#F9FAFB", fontWeight: 500, fontSize: 13 }}
                >
                  {config.character.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  {config.character.title}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                {exchangeCount}/{MAX_EXCHANGES} exchanges
              </span>
              <button
                onClick={closeNegotiation}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scenario context bar */}
          <div
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid #1F2937",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 16px",
            }}
          >
            {Object.entries(config.scenario).map(([k, v]) => (
              <span
                key={k}
                style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}
              >
                <span>{k}: </span>
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
                >
                  {v}
                </span>
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
                    <FoxSvg expression="neutral" size={26} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    background: msg.role === "user" ? "#1a2332" : "#111827",
                    color:
                      msg.role === "user"
                        ? "#F9FAFB"
                        : "rgba(255,255,255,0.75)",
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
                  <FoxSvg expression="thinking" size={26} />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px 12px 12px 2px",
                    background: "#111827",
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
                        background: "rgba(255,255,255,0.35)",
                        animation: `finfox-dot-fade 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                  <style>{`
                    @keyframes finfox-dot-fade {
                      0%, 80%, 100% { opacity: 0.25; }
                      40% { opacity: 0.8; }
                    }
                  `}</style>
                </div>
              </div>
            )}

            {loadingBreakdown && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid #374151",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                }}
              >
                FinFox is reviewing your performance...
              </div>
            )}

            {breakdown && (
              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 10,
                  border: "1px solid #374151",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 500,
                    fontSize: 11,
                    marginBottom: 12,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Debrief
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
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
                  background: input.trim() && !loading ? "#10B981" : "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  color:
                    input.trim() && !loading ? "#fff" : "rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
