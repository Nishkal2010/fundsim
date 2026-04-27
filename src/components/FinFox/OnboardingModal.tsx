import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinFox } from "../../hooks/useFinFox";
import { FoxSvg } from "./FinFoxMascot";

type Step = "mission" | "choice" | "simPicker";

export function OnboardingModal() {
  const {
    showOnboarding,
    dismissOnboarding,
    completeOnboardingWalkthrough,
    setActiveSim,
  } = useFinFox();
  const [step, setStep] = useState<Step>("mission");

  if (!showOnboarding) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(10,15,28,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <AnimatePresence mode="wait">
        {step === "mission" && (
          <motion.div
            key="mission"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "#111827",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: 20,
              padding: 40,
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <FoxSvg expression="approving" size={80} />
            </div>
            <h2
              style={{
                color: "#F9FAFB",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Meet FinFox
            </h2>
            <p
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              Finance is full of jargon — IRR, LBO, waterfall, carry — and most
              people learn it the hard way.
            </p>
            <p
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              FinFox is your AI finance tutor. Ask anything, hover over terms
              for quick definitions, and role-play real deal negotiations.
            </p>
            <p
              style={{
                color: "#D1D5DB",
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Zero finance background needed. No judgment. Just click the fox
              whenever you need help.
            </p>
            <button
              onClick={() => setStep("choice")}
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#111827",
                border: "none",
                borderRadius: 10,
                padding: "12px 32px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "#111827",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: 20,
              padding: 40,
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <FoxSvg expression="neutral" size={64} />
            </div>
            <h2
              style={{
                color: "#F9FAFB",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              How do you want to start?
            </h2>
            <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
              FinFox can walk you through your first simulation step by step, or
              you can dive in on your own.
            </p>

            <button
              onClick={() => setStep("simPicker")}
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#111827",
                border: "none",
                borderRadius: 10,
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                marginBottom: 12,
              }}
            >
              Walk me through it
            </button>

            <button
              onClick={dismissOnboarding}
              style={{
                background: "transparent",
                color: "#6B7280",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                width: "100%",
              }}
            >
              I'll explore on my own
            </button>
          </motion.div>
        )}

        {step === "simPicker" && (
          <motion.div
            key="simPicker"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "#111827",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: 20,
              padding: 40,
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <FoxSvg expression="approving" size={64} />
            </div>
            <h2
              style={{
                color: "#F9FAFB",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Which simulator first?
            </h2>
            <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
              FinFox will guide you through it step by step.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  sim: "vc" as const,
                  label: "Venture Capital",
                  desc: "Cap tables, term sheets, dilution, and founder negotiations",
                  color: "#34D399",
                  badge: "Recommended for beginners",
                },
                {
                  sim: "pe" as const,
                  label: "Private Equity",
                  desc: "LBO models, fund economics, and PE deal simulations",
                  color: "#818CF8",
                  badge: null,
                },
                {
                  sim: "ib" as const,
                  label: "Investment Banking",
                  desc: "M&A advisory, deal structuring, and client negotiations",
                  color: "#F59E0B",
                  badge: null,
                },
              ].map(({ sim, label, desc, color, badge }) => (
                <button
                  key={sim}
                  onClick={() => {
                    setActiveSim(sim);
                    completeOnboardingWalkthrough(sim);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${color}40`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      `${color}10`;
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      `${color}80`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      `${color}40`;
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color, fontWeight: 700, fontSize: 14 }}>
                      {sim.toUpperCase()} — {label}
                    </span>
                    {badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#34D399",
                          background: "rgba(52,211,153,0.1)",
                          border: "1px solid rgba(52,211,153,0.3)",
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: 12 }}>{desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("choice")}
              style={{
                marginTop: 16,
                background: "transparent",
                color: "#4B5563",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
                padding: "8px",
              }}
            >
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
