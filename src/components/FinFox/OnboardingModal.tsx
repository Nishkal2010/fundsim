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
    // Full-screen blur overlay — no box, options float on screen
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: "rgba(5,10,20,0.65)",
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
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 440,
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Fox — no card behind it */}
            <div style={{ marginBottom: 24 }}>
              <FoxSvg expression="approving" size={88} />
            </div>

            {/* Mission statement */}
            <h1
              style={{
                color: "#F9FAFB",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 16,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Learn finance by doing, not memorizing.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 15,
                lineHeight: 1.75,
                marginBottom: 10,
              }}
            >
              FundSim puts you in the seat of a VC, PE fund manager, or
              investment banker — and lets you run real deals with real math.
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 15,
                lineHeight: 1.75,
                marginBottom: 36,
              }}
            >
              I'm <strong style={{ color: "#34D399" }}>FinFox</strong> — your AI
              tutor. I'll explain every term, walk you through deals step by
              step, and role-play negotiations with you. Zero finance background
              needed.
            </p>

            <button
              onClick={() => setStep("choice")}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
                border: "none",
                borderRadius: 50,
                padding: "14px 40px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Let's go →
            </button>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={dismissOnboarding}
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.3)",
                  border: "none",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "6px",
                }}
              >
                Skip intro
              </button>
            </div>
          </motion.div>
        )}

        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <FoxSvg expression="neutral" size={64} />
            </div>
            <h2
              style={{
                color: "#F9FAFB",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              Want a guided tour?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
                marginBottom: 36,
                lineHeight: 1.6,
              }}
            >
              I'll walk you through your first simulation step by step — you'll
              need to click each part of the interface to proceed.
            </p>

            <button
              onClick={() => setStep("simPicker")}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
                border: "none",
                borderRadius: 50,
                padding: "14px 36px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "block",
                width: "100%",
                marginBottom: 12,
              }}
            >
              Yes, show me around
            </button>

            <button
              onClick={dismissOnboarding}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 50,
                padding: "13px 36px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
            >
              I'll figure it out
            </button>
          </motion.div>
        )}

        {step === "simPicker" && (
          <motion.div
            key="simPicker"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <FoxSvg expression="approving" size={64} />
            </div>
            <h2
              style={{
                color: "#F9FAFB",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              Pick your simulator
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                marginBottom: 28,
              }}
            >
              I'll guide you through it — you'll click each section yourself.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  sim: "vc" as const,
                  label: "Venture Capital",
                  desc: "Cap tables, term sheets, dilution, founder negotiations",
                  color: "#34D399",
                  badge: "Best for beginners",
                },
                {
                  sim: "pe" as const,
                  label: "Private Equity",
                  desc: "LBO models, fund economics, PE deal simulations",
                  color: "#818CF8",
                  badge: null,
                },
                {
                  sim: "ib" as const,
                  label: "Investment Banking",
                  desc: "M&A advisory, deal structuring, client negotiations",
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
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${color}30`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      `${color}12`;
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      `${color}70`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      `${color}30`;
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
                          border: "1px solid rgba(52,211,153,0.25)",
                          borderRadius: 20,
                          padding: "2px 8px",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  >
                    {desc}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("choice")}
              style={{
                marginTop: 16,
                background: "transparent",
                color: "rgba(255,255,255,0.25)",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
                padding: "8px",
              }}
            >
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
