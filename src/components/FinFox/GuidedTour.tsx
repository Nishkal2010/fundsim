import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinFox } from "../../hooks/useFinFox";
import { FoxSvg } from "./FinFoxMascot";

interface TourStep {
  target: string;
  title: string;
  body: string;
  tabHint?: string;
  // Which tab to navigate to for this step
  navigateTo?: { sim: string; tab: string };
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "sim-overview",
    title: "Welcome to the VC Simulator",
    body: "You're about to run a real venture capital deal. You decide the valuation, check size, and terms — just like a real investor.",
    navigateTo: { sim: "vc", tab: "captable" },
  },
  {
    target: "pitch-panel",
    title: "Read the Startup Pitch",
    body: "Every deal starts here. Revenue, burn, runway — these tell you how urgently the founder needs money and how much leverage you have.",
    navigateTo: { sim: "vc", tab: "captable" },
  },
  {
    target: "valuation",
    title: "Set the Pre-Money Valuation",
    body: "This is what you're agreeing the company is worth before your check. Too high = small ownership. Too low = the founder walks.",
    navigateTo: { sim: "vc", tab: "captable" },
  },
  {
    target: "check-size",
    title: "Choose Your Check Size",
    body: "Investment ÷ (Pre-money + Investment) = your ownership. A $2M check at $8M pre-money gives you 20% of the company.",
    navigateTo: { sim: "vc", tab: "captable" },
  },
  {
    target: "cap-table",
    title: "Watch the Cap Table Update",
    body: "Every row is a shareholder. Founders dilute every round. Adding an option pool before your investment dilutes founders even more — that's the 'option pool shuffle.'",
    navigateTo: { sim: "vc", tab: "captable" },
  },
  {
    target: "terms",
    title: "Negotiate Deal Terms",
    body: "1x non-participating liquidation preference is founder-friendly. Anything above 1x or participating is aggressive. Good investors don't need predatory terms.",
    navigateTo: { sim: "vc", tab: "termsheet" },
    tabHint: "Term Sheet",
  },
  {
    target: "negotiation",
    title: "Role-Play the Negotiation",
    body: "FinFox plays the founder and responds to your term sheet in real time. Try making an aggressive offer — see what the founder says.",
    navigateTo: { sim: "vc", tab: "termsheet" },
    tabHint: "Term Sheet",
  },
  {
    target: "outcome",
    title: "See the Deal Score",
    body: "This score shows how balanced your term sheet is. Balanced terms close deals. Predatory terms lose them. Real investors learn the difference.",
    navigateTo: { sim: "vc", tab: "termsheet" },
    tabHint: "Term Sheet",
  },
];

const TOOLTIP_WIDTH = 310;
const TOOLTIP_PAD = 16;

function getTargetEl(target: string): Element | null {
  return document.querySelector(`[data-finfox="${target}"]`);
}

function computeTooltipPos(
  rect: DOMRect,
  vw: number,
  vh: number,
): React.CSSProperties {
  const estimatedHeight = 260;

  // Prefer below
  let top: number;
  if (rect.bottom + estimatedHeight + 20 < vh) {
    top = rect.bottom + 14;
  } else if (rect.top - estimatedHeight - 14 > 0) {
    top = rect.top - estimatedHeight - 14;
  } else {
    // Centre vertically if neither fits
    top = Math.max(TOOLTIP_PAD, vh / 2 - estimatedHeight / 2);
  }

  let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  left = Math.max(
    TOOLTIP_PAD,
    Math.min(vw - TOOLTIP_WIDTH - TOOLTIP_PAD, left),
  );

  return { top, left, width: TOOLTIP_WIDTH };
}

export function GuidedTour() {
  const { tourActive, tourStep, nextTourStep, prevTourStep, skipTour } =
    useFinFox();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  const scrolledRef = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const step = TOUR_STEPS[tourStep];

  // Navigate to correct tab when step changes
  useEffect(() => {
    if (!tourActive || !step?.navigateTo) return;
    window.dispatchEvent(
      new CustomEvent("finfox:navigate", { detail: step.navigateTo }),
    );
  }, [tourActive, tourStep]);

  // Poll for target element — but only scroll ONCE per step
  useEffect(() => {
    if (!tourActive || !step) return;
    if (pollRef.current) clearInterval(pollRef.current);

    // Reset scroll tracking for new step
    scrolledRef.current.delete(step.target);

    const measureAndUpdate = () => {
      const el = getTargetEl(step.target);
      if (el) {
        if (!scrolledRef.current.has(step.target)) {
          scrolledRef.current.add(step.target);
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Measure after potential scroll settles
        animFrameRef.current = requestAnimationFrame(() => {
          const rect =
            getTargetEl(step.target)?.getBoundingClientRect() ?? null;
          setTargetRect(rect);
        });
      } else {
        setTargetRect(null);
      }
    };

    measureAndUpdate();
    pollRef.current = setInterval(measureAndUpdate, 800);

    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      const rect = getTargetEl(step.target)?.getBoundingClientRect() ?? null;
      setTargetRect(rect);
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [tourActive, tourStep]);

  const handleAdvance = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    nextTourStep();
  }, [nextTourStep]);

  if (!tourActive || !step) return null;

  const found = targetRect !== null;
  const tooltipPos = found
    ? computeTooltipPos(targetRect, vp.w, vp.h)
    : {
        top: vp.h / 2 - 130,
        left: vp.w / 2 - TOOLTIP_WIDTH / 2,
        width: TOOLTIP_WIDTH,
      };

  const isLast = tourStep === TOUR_STEPS.length - 1;

  return (
    <>
      <style>{`
        @keyframes finfox-spotlight-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0), 0 0 0 3px rgba(16,185,129,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.0), 0 0 0 3px rgba(16,185,129,0.6); }
        }
      `}</style>

      {/* Overlay — 4 strips creating a spotlight hole */}
      {found ? (
        <>
          {/* Top */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              bottom: vp.h - targetRect.top + 4,
              zIndex: 390,
              background: "rgba(3,7,18,0.82)",
              pointerEvents: "all",
            }}
          />
          {/* Left */}
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: 0,
              right: vp.w - targetRect.left + 4,
              background: "rgba(3,7,18,0.82)",
              pointerEvents: "all",
            }}
          />
          {/* Right */}
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: targetRect.right + 4,
              right: 0,
              background: "rgba(3,7,18,0.82)",
              pointerEvents: "all",
            }}
          />
          {/* Bottom */}
          <div
            style={{
              position: "fixed",
              top: targetRect.bottom + 4,
              inset: 0,
              zIndex: 390,
              background: "rgba(3,7,18,0.82)",
              pointerEvents: "all",
            }}
          />

          {/* Spotlight border — clickable to advance */}
          <div
            onClick={handleAdvance}
            style={{
              position: "fixed",
              zIndex: 392,
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              cursor: "pointer",
              borderRadius: 10,
              animation: "finfox-spotlight-pulse 2.2s ease-in-out infinite",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 390,
            background: "rgba(3,7,18,0.88)",
            pointerEvents: "all",
          }}
        />
      )}

      {/* Fox — always bottom right during tour */}
      <div
        style={{
          position: "fixed",
          zIndex: 401,
          bottom: 20,
          right: 20,
          pointerEvents: "none",
        }}
      >
        <FoxSvg expression={found ? "approving" : "thinking"} size={44} />
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            zIndex: 400,
            ...tooltipPos,
            background: "#0D1117",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 16,
            padding: "18px 18px 14px",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(16,185,129,0.07)",
          }}
        >
          {/* Progress */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
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
                    width: i === tourStep ? 16 : 5,
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
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            {step.body}
          </p>

          {/* Tab hint when element not yet visible */}
          {!found && step.tabHint && (
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 8,
                padding: "9px 12px",
                marginBottom: 12,
                fontSize: 12,
                color: "#34D399",
                textAlign: "center",
              }}
            >
              Click the <strong>{step.tabHint}</strong> tab above to reveal this
              section
            </div>
          )}

          {/* Element found hint */}
          {found && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(16,185,129,0.7)",
                textAlign: "center",
                marginBottom: 12,
                letterSpacing: "0.02em",
              }}
            >
              Click the highlighted area to continue →
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? skipTour : handleAdvance}
              style={{
                flex: 1,
                background: "#10B981",
                border: "none",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {isLast ? "Finish tour" : "Next →"}
            </button>
            <button
              onClick={skipTour}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
                cursor: "pointer",
                padding: "8px",
                whiteSpace: "nowrap",
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
