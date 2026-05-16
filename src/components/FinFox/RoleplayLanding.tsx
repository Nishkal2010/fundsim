// Shared landing UI for IB / PE / VC roleplay tabs. Each tab passes a
// scenario from src/lib/roleplayScenarios and this renders the identical
// fox-icon + scenario card + tips + start button layout, plus mounts the
// NegotiationPanel when the user clicks start.
//
// Before this existed, each XYZRoleplayTab.tsx had its own ~120-line copy
// of this layout (including a copy-pasted inline fox SVG). Adding a new
// roleplay was therefore a copy-paste exercise and changes had to be made
// in 3 places.

import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import { NegotiationPanel } from "./NegotiationPanel";
import { FoxSvg } from "./FinFoxMascot";
import type { RoleplayScenario } from "../../lib/roleplayScenarios";

interface Props {
  scenario: RoleplayScenario;
}

export function RoleplayLanding({ scenario }: Props) {
  const { negotiationOpen, openNegotiation, negotiationSim } = useFinFox();
  const accent = scenario.accent;
  // RGB-ish helper for soft tinted backgrounds. We pass alpha in CSS.
  const accentSoft = (alpha: number) => hexWithAlpha(accent, alpha);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" style={{ minHeight: "60vh" }}>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#111827",
          border: `1px solid ${accentSoft(0.2)}`,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <FoxSvg expression="neutral" size={56} />
        </div>

        <h2
          style={{
            color: "#F9FAFB",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {scenario.title}
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
          {scenario.userRole} FinFox plays {scenario.character.name},{" "}
          {scenario.character.title}.
        </p>
        <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
          {scenario.exerciseHint}
        </p>

        <div
          className="rounded-xl p-5 mb-8 text-left mx-auto"
          style={{
            background: accentSoft(0.05),
            border: `1px solid ${accentSoft(0.15)}`,
            maxWidth: 460,
          }}
        >
          <div
            style={{
              color: accent,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Scenario — {scenario.scenario.Company ?? scenario.character.name}
          </div>
          {Object.entries(scenario.scenario).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 4,
                borderBottom: `1px solid ${accentSoft(0.08)}`,
                marginBottom: 4,
                gap: 12,
              }}
            >
              <span style={{ color: "#6B7280", fontSize: 12 }}>{k}</span>
              <span
                style={{
                  color: accent,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            color: "#6B7280",
            fontSize: 12,
            marginBottom: 20,
            maxWidth: 560,
            margin: "0 auto 20px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#9CA3AF" }}>Tip:</strong> {scenario.tips}
        </div>

        <button
          onClick={() => openNegotiation(scenario.sim)}
          style={{
            background: `linear-gradient(135deg, ${accent}, ${darken(accent, 12)})`,
            color: shouldUseDarkText(accent) ? "#111827" : "#F9FAFB",
            border: "none",
            borderRadius: 12,
            padding: "14px 36px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {scenario.ctaLabel}
        </button>
      </div>

      {negotiationOpen && negotiationSim === scenario.sim && (
        <NegotiationPanel
          config={{
            sim: scenario.sim,
            character: scenario.character,
            scenario: scenario.scenario,
            mode: scenario.mode,
            systemPrompt: scenario.systemPrompt,
          }}
        />
      )}
    </div>
  );
}

// ─── tiny color helpers ─────────────────────────────────────────────────────
// All scenario accents are 6-digit hex; we only need alpha overlay + a small
// darken for the gradient. Don't pull in a color lib for this.

function hexWithAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const f = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x * (1 - amount / 100))));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// Bright accent (yellow, green) → use dark text on the button so it's readable.
// Picked threshold by perceived luminance.
function shouldUseDarkText(hex: string): boolean {
  const { r, g, b } = parseHex(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6;
}
