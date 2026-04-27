import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinFox } from "../../hooks/useFinFox";
import { FoxSvg } from "./FinFoxMascot";

interface TourStep {
  target: string;
  title: string;
  body: string;
  clickInstruction: string;
  // Tab hint shown when element isn't found (user needs to navigate)
  tabHint?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "sim-overview",
    title: "Welcome to the VC Simulator",
    body: "You're about to run a real venture capital deal. You'll decide how much to invest, at what valuation, and on what terms — just like a real investor.",
    clickInstruction: "Click anywhere on the simulator panel to start",
  },
  {
    target: "pitch-panel",
    title: "Read the Startup Pitch",
    body: "Every deal starts here. The startup shows you its revenue, growth rate, burn rate, and runway. These numbers tell you how urgently they need money and how much leverage you have.",
    clickInstruction: "Click the pitch section to continue",
  },
  {
    target: "valuation",
    title: "Set the Pre-Money Valuation",
    body: "This is what you're agreeing the company is worth before your money goes in. Too high = small ownership. Too low = founder walks. Try adjusting the slider.",
    clickInstruction: "Click on the Valuation section to explore it",
  },
  {
    target: "check-size",
    title: "Choose Your Check Size",
    body: "How much are you investing? This — combined with valuation — determines your ownership. Ownership % = Investment ÷ (Pre-money + Investment). Try moving the slider.",
    clickInstruction: "Click on the Check Size section",
  },
  {
    target: "cap-table",
    title: "Watch the Cap Table Update",
    body: "This table shows everyone's ownership after your round. Notice how founders get diluted as you increase your check or add an option pool. Every future round dilutes everyone further.",
    clickInstruction: "Click on the Cap Table to continue",
  },
  {
    target: "terms",
    title: "Negotiate Deal Terms",
    body: "Liquidation preference, anti-dilution, pro-rata rights — these protect your downside. A 1x non-participating preference is founder-friendly. Anything above 1x or participating gets aggressive.",
    clickInstruction: "Click on the Deal Terms section",
    tabHint: "Term Sheet",
  },
  {
    target: "negotiation",
    title: "Role-Play the Negotiation",
    body: "Once you've set terms, you can role-play the negotiation live. FinFox plays the founder and responds to your offer in real time. Try making an aggressive offer — see what happens.",
    clickInstruction: "Click on the Negotiation Tips section",
    tabHint: "Term Sheet",
  },
  {
    target: "outcome",
    title: "See the Deal Outcome",
    body: "This score reflects how founder-friendly vs. investor-friendly your term sheet is. Balanced terms close deals. Predatory terms lose them. Good investors know the difference.",
    clickInstruction: "Click the Term Sheet Score to finish the tour",
    tabHint: "Term Sheet",
  },
];

function getTargetEl(target: string): Element | null {
  return document.querySelector(`[data-finfox="${target}"]`);
}

function getTargetRect(target: string): DOMRect | null {
  const el = getTargetEl(target);
  return el ? el.getBoundingClientRect() : null;
}

function getTooltipPosition(
  rect: DOMRect,
  vw: number,
  vh: number,
): React.CSSProperties {
  const W = 300;
  const PAD = 16;
  const TOOLTIP_H = 240;

  let top: number;
  let left: number;

  // Prefer below the element
  if (rect.bottom + TOOLTIP_H + PAD + 16 < vh) {
    top = rect.bottom + 16;
  } else {
    top = Math.max(PAD, rect.top - TOOLTIP_H - 16);
  }

  left = rect.left + rect.width / 2 - W / 2;
  left = Math.max(PAD, Math.min(vw - W - PAD, left));

  return { top, left, width: W };
}

export function GuidedTour() {
  const { tourActive, tourStep, nextTourStep, skipTour } = useFinFox();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = TOUR_STEPS[tourStep];

  // Poll for the target element (handles lazy tabs / navigation)
  useEffect(() => {
    if (!tourActive || !step) return;

    if (pollRef.current) clearInterval(pollRef.current);

    const check = () => {
      const el = getTargetEl(step.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setTargetRect(getTargetRect(step.target)), 300);
      } else {
        setTargetRect(null);
      }
    };

    check();
    pollRef.current = setInterval(check, 600);

    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      setTargetRect(getTargetRect(step.target));
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [tourActive, tourStep]);

  if (!tourActive || !step) return null;

  const elementFound = targetRect !== null;
  const tooltipPos = elementFound
    ? getTooltipPosition(targetRect, vp.w, vp.h)
    : { top: vp.h / 2 - 120, left: vp.w / 2 - 150, width: 300 };

  // When element is clicked → advance tour
  const handleClickZone = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    nextTourStep();
  };

  return (
    <>
      <style>{`
        @keyframes finfox-tour-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5), 0 0 0 4px rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.0), 0 0 0 10px rgba(16,185,129,0.0); }
        }
        @keyframes finfox-arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      {/* 4-strip overlay — creates a transparent "hole" over the target */}
      {elementFound ? (
        <>
          {/* Top strip */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 390,
              top: 0,
              bottom: vp.h - targetRect.top + 4,
              background: "rgba(5,10,20,0.78)",
              pointerEvents: "all",
            }}
          />
          {/* Left strip */}
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: 0,
              right: vp.w - targetRect.left + 4,
              background: "rgba(5,10,20,0.78)",
              pointerEvents: "all",
            }}
          />
          {/* Right strip */}
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: targetRect.right + 4,
              right: 0,
              background: "rgba(5,10,20,0.78)",
              pointerEvents: "all",
            }}
          />
          {/* Bottom strip */}
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.bottom + 4,
              inset: 0,
              background: "rgba(5,10,20,0.78)",
              pointerEvents: "all",
            }}
          />

          {/* Transparent click zone over target */}
          <div
            onClick={handleClickZone}
            style={{
              position: "fixed",
              zIndex: 392,
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              cursor: "pointer",
              borderRadius: 10,
              border: "2px solid #10B981",
              animation: "finfox-tour-pulse 2s ease-in-out infinite",
            }}
          />

          {/* Animated down-arrow above tooltip pointing at element */}
          <div
            style={{
              position: "fixed",
              zIndex: 395,
              left: targetRect.left + targetRect.width / 2 - 12,
              top: targetRect.top - 36,
              fontSize: 20,
              animation: "finfox-arrow-bounce 1s ease-in-out infinite",
              pointerEvents: "none",
              display: targetRect.top > 60 ? "block" : "none",
            }}
          >
            👆
          </div>
        </>
      ) : (
        // Fallback: full overlay when element not on screen
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 390,
            background: "rgba(5,10,20,0.82)",
            pointerEvents: "all",
          }}
        />
      )}

      {/* Fox — bottom right during tour */}
      <div
        style={{
          position: "fixed",
          zIndex: 401,
          bottom: 20,
          right: 20,
          pointerEvents: "none",
        }}
      >
        <FoxSvg
          expression={elementFound ? "approving" : "thinking"}
          size={44}
        />
      </div>

      {/* Tooltip — positioned near element or centered when not found */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            zIndex: 400,
            ...tooltipPos,
            background: "#0D1117",
            border: "1px solid rgba(16,185,129,0.35)",
            borderRadius: 16,
            padding: "18px 20px 14px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)",
          }}
        >
          {/* Progress dots */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 14,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "#10B981",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {tourStep + 1} / {TOUR_STEPS.length}
            </span>
            <div style={{ display: "flex", gap: 3 }}>
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === tourStep ? 14 : 5,
                    height: 5,
                    borderRadius: 3,
                    background:
                      i === tourStep
                        ? "#10B981"
                        : i < tourStep
                          ? "#065F46"
                          : "#1F2937",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>

          <h3
            style={{
              color: "#F9FAFB",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            {step.body}
          </p>

          {/* Click instruction or nav hint */}
          {!elementFound && step.tabHint ? (
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 12,
                fontSize: 12,
                color: "#34D399",
                textAlign: "center",
              }}
            >
              ↑ Click the <strong>{step.tabHint}</strong> tab above to continue
            </div>
          ) : elementFound ? (
            <div
              style={{
                fontSize: 11,
                color: "#10B981",
                textAlign: "center",
                marginBottom: 12,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              ↑ {step.clickInstruction}
            </div>
          ) : null}

          {/* Skip */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={skipTour}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 11,
                color: "#374151",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Skip tour
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
