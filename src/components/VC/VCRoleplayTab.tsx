import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import { NegotiationPanel } from "../FinFox/NegotiationPanel";

const VC_SYSTEM_PROMPT = `You are Alex Rivera, founder/CEO of NovaTech, raising a $2M seed round.
Company: $180K ARR, 22% MoM growth, $45K/mo burn, 14 months runway.
You've spoken to 12 investors. You have leverage but need to close.
The user is a VC investor making you an offer.
Accept: 1x non-participating liq pref, single board seat at Series A+, standard pro rata. Valuation $8M pre or higher.
Push back: >1x liq pref, participating preferred, multiple board seats, pre-money below $6M.
Walk away: >50% dilution at seed, >2x liq pref, removal of founder vesting acceleration.
Max 2 sentences per turn. No emojis. Stay in character.`;

const VC_SCENARIO = {
  Company: "NovaTech",
  ARR: "$180K",
  Growth: "22% MoM",
  Burn: "$45K/mo",
  Runway: "14 months",
  Raising: "$2M seed",
};

export function VCRoleplayTab() {
  const { negotiationOpen, openNegotiation, closeNegotiation, negotiationSim } =
    useFinFox();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" style={{ minHeight: "60vh" }}>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#111827",
          border: "1px solid rgba(52,211,153,0.2)",
        }}
      >
        <div className="text-5xl mb-4" style={{ fontSize: 48 }}>
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
          VC Deal Negotiation
        </h2>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 6,
            maxWidth: 480,
            margin: "0 auto 8px",
          }}
        >
          You are a seed-stage VC investor. FinFox plays Alex Rivera, the
          founder of NovaTech — a fast-growing SaaS startup raising a $2M seed
          round.
        </p>
        <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
          Make your offer. The founder will push back, accept, or walk depending
          on your terms. Up to 8 exchanges, then FinFox breaks character and
          gives you a full debrief.
        </p>

        {/* Scenario card */}
        <div
          className="rounded-xl p-5 mb-8 text-left mx-auto"
          style={{
            background: "rgba(52,211,153,0.05)",
            border: "1px solid rgba(52,211,153,0.15)",
            maxWidth: 400,
          }}
        >
          <div
            style={{
              color: "#34D399",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            COMPANY PROFILE — NOVATECH
          </div>
          {Object.entries(VC_SCENARIO).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 4,
                borderBottom: "1px solid rgba(52,211,153,0.08)",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#6B7280", fontSize: 12 }}>{k}</span>
              <span style={{ color: "#34D399", fontSize: 12, fontWeight: 600 }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ color: "#6B7280", fontSize: 12, marginBottom: 20 }}>
          <strong style={{ color: "#9CA3AF" }}>Tips:</strong> Start by stating
          your pre-money valuation, check size, and key terms. Be specific —
          "I'm offering $8M pre-money, $2M check, 1x non-participating liq
          pref."
        </div>

        <button
          onClick={() => openNegotiation("vc")}
          style={{
            background: "linear-gradient(135deg, #34D399, #10B981)",
            color: "#111827",
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

      {negotiationOpen && negotiationSim === "vc" && (
        <NegotiationPanel
          config={{
            sim: "vc",
            character: { name: "Alex Rivera", title: "CEO, NovaTech" },
            scenario: VC_SCENARIO,
            mode: "founder",
            systemPrompt: VC_SYSTEM_PROMPT,
          }}
        />
      )}
    </div>
  );
}
