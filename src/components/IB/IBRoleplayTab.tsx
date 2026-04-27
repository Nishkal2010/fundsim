import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import { NegotiationPanel } from "../FinFox/NegotiationPanel";

const IB_SYSTEM_PROMPT = `You are Marcus Webb, CFO of Apex Consumer Brands. You are evaluating hiring a bank to advise on a sell-side M&A process.
Your company has $120M revenue, $28M EBITDA, and you expect a deal around $500-600M.
You have already spoken to Goldman Sachs and Morgan Stanley. Your board wants a decision in 2 weeks.
You want: a fair retainer, competitive success fee, an experienced team with consumer sector expertise, and a clear process timeline.
The user is an investment banker pitching for the mandate.
Accept: Retainer $500K+, success fee 1-2.5%, exclusivity 6-12 months.
Push back: Success fee below 0.75%, retainer below $250K, exclusivity below 3 months.
Walk away: No retainer offered, success fee below 0.5%, no clear process timeline provided.
Professional but direct. Max 2 sentences per turn. No emojis. Stay in character.`;

const IB_SCENARIO = {
  Company: "Apex Consumer Brands",
  Revenue: "$120M",
  EBITDA: "$28M",
  "Deal Type": "Sell-Side M&A",
  "Est. Deal Size": "~$550M",
  "Other Banks": "Goldman, Morgan Stanley",
};

export function IBRoleplayTab() {
  const { negotiationOpen, openNegotiation, negotiationSim } = useFinFox();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" style={{ minHeight: "60vh" }}>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#111827",
          border: "1px solid rgba(245,158,11,0.2)",
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
          IB Mandate Pitch
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
          You are an investment banker pitching for a sell-side M&A advisory
          mandate. FinFox plays Marcus Webb, CFO of Apex Consumer Brands.
        </p>
        <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
          Pitch your credentials, propose your fee structure, and win the
          mandate. Up to 8 exchanges, then get a full debrief on your pitch.
        </p>

        <div
          className="rounded-xl p-5 mb-8 text-left mx-auto"
          style={{
            background: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.15)",
            maxWidth: 420,
          }}
        >
          <div
            style={{
              color: "#F59E0B",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            CLIENT PROFILE — APEX CONSUMER BRANDS
          </div>
          {Object.entries(IB_SCENARIO).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 4,
                borderBottom: "1px solid rgba(245,158,11,0.08)",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#6B7280", fontSize: 12 }}>{k}</span>
              <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 600 }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ color: "#6B7280", fontSize: 12, marginBottom: 20 }}>
          <strong style={{ color: "#9CA3AF" }}>Tips:</strong> Lead with your
          sector expertise and a concrete fee proposal — "$500K retainer, 1.5%
          success fee on $550M deal size, 9-month exclusivity." The CFO will
          probe your credentials and push back on fees.
        </div>

        <button
          onClick={() => openNegotiation("ib")}
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#111827",
            border: "none",
            borderRadius: 12,
            padding: "14px 36px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Start Pitch
        </button>
      </div>

      {negotiationOpen && negotiationSim === "ib" && (
        <NegotiationPanel
          config={{
            sim: "ib",
            character: {
              name: "Marcus Webb",
              title: "CFO, Apex Consumer Brands",
            },
            scenario: IB_SCENARIO,
            mode: "ib_client",
            systemPrompt: IB_SYSTEM_PROMPT,
          }}
        />
      )}
    </div>
  );
}
