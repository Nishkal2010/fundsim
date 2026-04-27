import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinFox } from "../../hooks/useFinFox";
import { FoxSvg } from "./FinFoxMascot";

const TOUR_STEPS = [
  {
    target: "sim-overview",
    title: "Welcome to the VC Simulator",
    body: "This simulator teaches you how venture capital deals actually work. You're acting as the investor — deciding how much to invest, at what valuation, and on what terms.",
  },
  {
    target: "pitch-panel",
    title: "The Startup's Pitch",
    body: "Every deal starts with a company pitch. You'll see the startup's revenue, growth rate, burn, and runway. These numbers tell you how urgently they need capital and how much leverage you have.",
  },
  {
    target: "valuation",
    title: "Pre-Money Valuation",
    body: "This is what you're agreeing the company is worth before your money goes in. Negotiate too high and your ownership is small. Too low and the founder may reject your offer.",
  },
  {
    target: "check-size",
    title: "Check Size",
    body: "This is how much you're investing. Combined with the valuation, it determines your ownership percentage. Ownership % = Investment / (Pre-money + Investment).",
  },
  {
    target: "cap-table",
    title: "Cap Table",
    body: "The cap table shows everyone's ownership after the round. Watch how founders get diluted as you increase your check size or add an option pool. Future rounds will dilute everyone further.",
  },
  {
    target: "terms",
    title: "Deal Terms",
    body: "Liquidation preference, anti-dilution, pro rata rights — these terms protect your downside. A 1x non-participating preference is founder-friendly. Anything above 1x or participating starts to feel predatory.",
  },
  {
    target: "negotiation",
    title: "Negotiation Mode",
    body: "Once you've set your terms, you can role-play the negotiation. FinFox will act as the founder and respond to your offer in real time. Try being too aggressive — see what happens.",
  },
  {
    target: "outcome",
    title: "Deal Outcome",
    body: "After the negotiation, FinFox simulates the outcome based on your terms. You'll see your projected MOIC and IRR across exit scenarios. This is where good terms and valuation discipline pay off.",
  },
];

function getTargetRect(target: string): DOMRect | null {
  const el = document.querySelector(`[data-finfox="${target}"]`);
  return el ? el.getBoundingClientRect() : null;
}

export function GuidedTour() {
  const {
    tourActive,
    tourStep,
    nextTourStep,
    prevTourStep,
    skipTour,
    foxCorner,
  } = useFinFox();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[tourStep];

  useEffect(() => {
    if (!tourActive || !step) return;

    const update = () => setTargetRect(getTargetRect(step.target));
    update();

    // Re-check after a tick for lazy-rendered elements
    const t = setTimeout(update, 200);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
    };
  }, [tourActive, tourStep, step?.target]);

  if (!tourActive || !step) return null;

  // Position tooltip box based on fox corner
  const isRight = foxCorner.includes("right");
  const isTop = foxCorner.includes("top");

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 400,
    width: 320,
    ...(isRight ? { right: 104 } : { left: 104 }),
    ...(isTop ? { top: 80 } : { bottom: 104 }),
  };

  // Fox position
  const foxStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 401,
    ...(isRight ? { right: 24 } : { left: 24 }),
    ...(isTop ? { top: 80 } : { bottom: 24 }),
  };

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 390,
          background: "rgba(10,15,28,0.72)",
          pointerEvents: "none",
        }}
      />

      {/* Highlight ring around target element */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            zIndex: 391,
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: 10,
            border: "2px solid #6366F1",
            boxShadow:
              "0 0 0 4px rgba(99,102,241,0.15), 0 0 24px rgba(99,102,241,0.3)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Fox */}
      <div style={foxStyle}>
        <FoxSvg expression="approving" size={64} />
      </div>

      {/* Tooltip box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            ...tooltipStyle,
            background: "#111827",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          {/* Step counter */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#6366F1",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              STEP {tourStep + 1} OF {TOUR_STEPS.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === tourStep ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background:
                      i === tourStep
                        ? "#6366F1"
                        : i < tourStep
                          ? "#4F46E5"
                          : "#374151",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>

          <h3
            style={{
              color: "#F9FAFB",
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: 13,
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            {step.body}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                style={{
                  background: "transparent",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={nextTourStep}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: "#F9FAFB",
                cursor: "pointer",
              }}
            >
              {tourStep === TOUR_STEPS.length - 1 ? "Finish tour" : "Continue"}
            </button>
            <button
              onClick={skipTour}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 12,
                color: "#4B5563",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              Skip
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
