import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import { NegotiationPanel } from "../FinFox/NegotiationPanel";

const PE_SYSTEM_PROMPT = `You are Sarah Chen, CFO of Meridian Industrial, a manufacturing company with $50M EBITDA growing 12% YoY.
A PE firm is bidding to acquire the company. The board expects at least 11x EV/EBITDA ($550M EV).
The user is a PE partner making an LBO offer. You have had interest from 2 other sponsors.
Accept: Offer within 0.5x of ask (10.5x or higher), management rollover 15%+, no punitive earnout.
Push back: Offer below 10x, rollover below 10%, leverage above 6.5x EBITDA.
Walk away: Offer below 9x, leverage above 7.5x EBITDA, no rollover offered.
Stay professional. Reference specific numbers. Max 2 sentences per turn. No emojis.`;

const PE_SCENARIO = {
  Company: "Meridian Industrial",
  EBITDA: "$50M",
  Growth: "12% YoY",
  Sector: "Manufacturing",
  "Board Floor": "11x EV/EBITDA",
  "Floor EV": "$550M",
};

export function PERoleplayTab() {
  const { negotiationOpen, openNegotiation, negotiationSim } = useFinFox();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" style={{ minHeight: "60vh" }}>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#111827",
          border: "1px solid rgba(129,140,248,0.2)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto" }}
          >
            <ellipse
              cx="48"
              cy="48"
              rx="10"
              ry="7"
              fill="#F59E0B"
              transform="rotate(-30 48 48)"
            />
            <ellipse cx="32" cy="40" rx="16" ry="13" fill="#F59E0B" />
            <polygon points="12,20 8,6 20,16" fill="#F59E0B" />
            <polygon points="13,19 9,9 19,16" fill="#F87171" />
            <polygon points="52,20 56,6 44,16" fill="#F59E0B" />
            <polygon points="51,19 55,9 45,16" fill="#F87171" />
            <circle cx="32" cy="28" r="16" fill="#F59E0B" />
            <ellipse cx="32" cy="34" rx="8" ry="5" fill="#F9FAFB" />
            <ellipse cx="32" cy="32" rx="2.5" ry="1.8" fill="#1F2937" />
            <circle cx="26" cy="25" r="3" fill="#1F2937" />
            <circle cx="38" cy="25" r="3" fill="#1F2937" />
            <circle cx="27" cy="24" r="1" fill="#F9FAFB" />
            <circle cx="39" cy="24" r="1" fill="#F9FAFB" />
          </svg>
        </div>

        <h2
          style={{
            color: "#F9FAFB",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          PE Acquisition Negotiation
        </h2>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "0 auto 8px",
          }}
        >
          You are a PE partner making an LBO offer on Meridian Industrial.
          FinFox plays Sarah Chen, the CFO defending the company's valuation.
        </p>
        <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
          Negotiate the entry multiple, rollover, leverage structure, and
          earnout. Up to 8 exchanges, then get a full deal debrief.
        </p>

        <div
          className="rounded-xl p-5 mb-8 text-left mx-auto"
          style={{
            background: "rgba(129,140,248,0.05)",
            border: "1px solid rgba(129,140,248,0.15)",
            maxWidth: 420,
          }}
        >
          <div
            style={{
              color: "#818CF8",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            COMPANY PROFILE — MERIDIAN INDUSTRIAL
          </div>
          {Object.entries(PE_SCENARIO).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 4,
                borderBottom: "1px solid rgba(129,140,248,0.08)",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#6B7280", fontSize: 12 }}>{k}</span>
              <span style={{ color: "#818CF8", fontSize: 12, fontWeight: 600 }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ color: "#6B7280", fontSize: 12, marginBottom: 20 }}>
          <strong style={{ color: "#9CA3AF" }}>Tips:</strong> State your offer
          clearly — "We're offering 10.5x EV/EBITDA, 60% debt, 20% management
          rollover, no earnout." The CFO will respond to your specific numbers.
        </div>

        <button
          onClick={() => openNegotiation("pe")}
          style={{
            background: "linear-gradient(135deg, #818CF8, #6366F1)",
            color: "#F9FAFB",
            border: "none",
            borderRadius: 12,
            padding: "14px 36px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Start Negotiation
        </button>
      </div>

      {negotiationOpen && negotiationSim === "pe" && (
        <NegotiationPanel
          config={{
            sim: "pe",
            character: {
              name: "Sarah Chen",
              title: "CFO, Meridian Industrial",
            },
            scenario: PE_SCENARIO,
            mode: "pe_seller",
            systemPrompt: PE_SYSTEM_PROMPT,
          }}
        />
      )}
    </div>
  );
}
