import { useFinFox } from "../../hooks/useFinFox";
import { MessageSquare, Sigma } from "lucide-react";
import { QUANT_ACCENT, QUANT_BORDER, PANEL_BG } from "./QuantLayout";

// The Quant track uses FinFox as a tutor / mock-interviewer, not a negotiation
// persona — so it does not register a server roleplay mode. It opens the
// existing chat with a quant-interview kickoff prompt.
const PROMPTS = [
  "Mock-interview me: ask me one quant brain-teaser at a time and grade my answers.",
  "Walk me through deriving the Black-Scholes PDE from a delta-hedged portfolio.",
  "Quiz me on the Greeks — give me a position and ask what happens to delta/gamma/vega.",
  "Explain Value-at-Risk vs Expected Shortfall like I'm in a final-round interview.",
  "Give me a portfolio-optimization problem and check my efficient-frontier reasoning.",
];

export function QuantRoleplayTab() {
  const { openChat } = useFinFox();

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: PANEL_BG, border: `1px solid ${QUANT_BORDER}` }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{
            background: "rgba(91,157,255,0.1)",
            border: `1px solid ${QUANT_BORDER}`,
          }}
        >
          <Sigma size={26} color={QUANT_ACCENT} />
        </div>
        <h2 className="font-serif text-2xl mb-2" style={{ color: "#ece9e2" }}>
          Quant Interview Prep with FinFox
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: "#a6a8b0", lineHeight: 1.6 }}
        >
          Sit a mock quant interview. FinFox plays the interviewer — probability
          brain-teasers, derivations, pricing under pressure, and risk questions
          — and grades your reasoning. Pick a starting prompt or open a blank
          session and drive it yourself.
        </p>
        <div className="flex flex-col gap-2.5">
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => openChat(p)}
              className="text-left px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(91,157,255,0.06)",
                border: `1px solid ${QUANT_BORDER}`,
                color: "#cfd1d6",
                cursor: "pointer",
              }}
            >
              <MessageSquare
                size={14}
                color={QUANT_ACCENT}
                style={{
                  display: "inline",
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
