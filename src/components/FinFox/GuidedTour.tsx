import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinFox } from "../../hooks/useFinFox";
import { FoxWalkingSide, type FoxFacing } from "./FinFoxMascot";

// Pick the dominant facing for a walk from `from` to `to`. If the
// horizontal delta is larger we say the fox is walking right/left;
// otherwise up/down. This is the simplest read that "looks right".
function facingForMove(
  from: [number, number],
  to: [number, number],
): FoxFacing {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "down" : "up";
}

// Typewriter effect — reveals `text` over `durationMs`, mounting from
// empty whenever the source text changes (i.e. on every tour step).
function useTypewriter(text: string, durationMs: number): string {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    const total = text.length;
    const perChar = Math.max(10, durationMs / Math.max(1, total));
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= total) clearInterval(id);
    }, perChar);
    return () => clearInterval(id);
  }, [text, durationMs]);
  return shown;
}

// Edge positions the fox can walk to between steps. The fox transitions
// smoothly between positions so the tour feels like a guide walking around
// the screen and pointing at things.
type FoxCorner = "tl" | "tr" | "br" | "bl" | "tc" | "bc";

interface TourStep {
  target?: string;
  title: string;
  body: string;
  tabHint?: string;
  navigateTo?: { sim: string; tab: string };
  foxCorner?: FoxCorner;
}

function foxCornerStyle(c: FoxCorner): React.CSSProperties {
  const PAD = 24;
  switch (c) {
    case "tl":
      return { top: PAD, left: PAD };
    case "tr":
      return { top: PAD, right: PAD };
    case "br":
      return { bottom: PAD, right: PAD };
    case "bl":
      return { bottom: PAD, left: PAD };
    case "tc":
      return { top: PAD, left: "50%", marginLeft: -28 };
    case "bc":
      return { bottom: PAD, left: "50%", marginLeft: -28 };
  }
}

function tooltipPosForCorner(
  c: FoxCorner,
  vw: number,
  vh: number,
): React.CSSProperties {
  const PAD = 24;
  const FOX = 84;
  const W = Math.min(360, vw - PAD * 2);
  const HALF = W / 2;
  const ESTIMATED_H = 220;
  switch (c) {
    case "tl":
      return { top: PAD + FOX + 14, left: PAD, width: W };
    case "tr":
      return { top: PAD + FOX + 14, right: PAD, width: W };
    case "br":
      return { bottom: PAD + FOX + 14, right: PAD, width: W };
    case "bl":
      return { bottom: PAD + FOX + 14, left: PAD, width: W };
    case "tc":
      return { top: PAD + FOX + 14, left: vw / 2 - HALF, width: W };
    case "bc":
      return {
        top: Math.max(PAD, vh - PAD - FOX - ESTIMATED_H - 14),
        left: vw / 2 - HALF,
        width: W,
      };
  }
}

// Convert a corner identifier to absolute viewport pixel coordinates
// for the top-left of the fox sprite.
function cornerToXY(c: FoxCorner, vw: number, vh: number): [number, number] {
  const PAD = 24;
  const S = 84; // fox sprite size (approx)
  switch (c) {
    case "tl":
      return [PAD, PAD];
    case "tc":
      return [vw / 2 - S / 2, PAD];
    case "tr":
      return [vw - S - PAD, PAD];
    case "br":
      return [vw - S - PAD, vh - S - PAD];
    case "bc":
      return [vw / 2 - S / 2, vh - S - PAD];
    case "bl":
      return [PAD, vh - S - PAD];
  }
}

// Clockwise ordering of corners around the perimeter. The fox uses this
// to choose a perimeter-following path instead of cutting diagonally.
const CORNER_RING: FoxCorner[] = ["tl", "tc", "tr", "br", "bc", "bl"];

function perimeterPath(from: FoxCorner, to: FoxCorner): FoxCorner[] {
  const n = CORNER_RING.length;
  const fi = CORNER_RING.indexOf(from);
  const ti = CORNER_RING.indexOf(to);
  if (fi === -1 || ti === -1 || fi === ti) return [from, to];
  const cwDist = (ti - fi + n) % n;
  const ccwDist = (fi - ti + n) % n;
  const cw = cwDist <= ccwDist;
  const out: FoxCorner[] = [from];
  let i = fi;
  while (i !== ti) {
    i = cw ? (i + 1) % n : (i - 1 + n) % n;
    out.push(CORNER_RING[i]);
  }
  return out;
}

const TOUR_STEPS: Record<"vc" | "pe" | "ib", TourStep[]> = {
  vc: [
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
      body: "Every row is a shareholder. Founders dilute every round. Adding an option pool before your investment dilutes founders even more — the 'option pool shuffle.'",
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
  ],
  pe: [
    {
      title: "Welcome to the PE Simulator",
      body: "You're running a private equity fund. Raise capital from LPs, buy companies with leverage, grow them, and exit for a multiple of your money. Take a look around — I'll wait, then we'll walk through the four pieces that matter most.",
      navigateTo: { sim: "pe", tab: "lifecycle" },
      foxCorner: "bc",
    },
    {
      title: "Fund Lifecycle",
      body: "PE funds live for 10 years: 5 to invest, 5 to harvest. Management fees (2%) eat capital every year — that's the 'fee drag' you have to overcome. Try dragging the FUND SIZE slider above and watch the lifecycle change.",
      navigateTo: { sim: "pe", tab: "lifecycle" },
      foxCorner: "tl",
    },
    {
      title: "J-Curve",
      body: "Returns are negative for years 1–4 (fees + immature investments), then climb sharply as deals exit. Real LPs accept this curve as the price of buyout-grade returns. Hover the chart — each point is a real cashflow.",
      navigateTo: { sim: "pe", tab: "jcurve" },
      foxCorner: "tr",
    },
    {
      title: "Waterfall & Carry",
      body: "GPs earn 20% of profits above an 8% hurdle. European pays carry only after LPs are fully repaid; American pays per-deal. Toggle waterfall types — watch the GP/LP split swing.",
      navigateTo: { sim: "pe", tab: "waterfall" },
      foxCorner: "br",
    },
    {
      title: "Performance Metrics",
      body: "DPI tells you what's been returned in cash. TVPI is total value (realized + paper). Net IRR is the time-weighted return. Together they tell the full story.",
      navigateTo: { sim: "pe", tab: "performance" },
      foxCorner: "bl",
    },
  ],
  ib: [
    {
      title: "Welcome to the IB Simulator",
      body: "You're an investment banker running an M&A deal — value the target, structure the offer, model accretion/dilution, and score the deal like an analyst. Have a look. I'll guide you through the four moves that matter.",
      navigateTo: { sim: "ib", tab: "main" },
      foxCorner: "bc",
    },
    {
      title: "Pick a Deal Preset",
      body: "Eight real scenarios — Microsoft–LinkedIn, Disney–Fox, Salesforce–Slack. Each has real revenue, EBITDA, and strategic context. Pick one to load the inputs.",
      navigateTo: { sim: "ib", tab: "main" },
      foxCorner: "tr",
    },
    {
      title: "Four Valuation Methods",
      body: "DCF (intrinsic), Comps (peer multiples), Precedents (past deals), and LBO (sponsor floor). The football field chart shows your valuation range at a glance.",
      navigateTo: { sim: "ib", tab: "main" },
      foxCorner: "br",
    },
    {
      title: "Offer Structure",
      body: "Cash, stock, or mixed — each has tax, EPS, and risk consequences. Adjust the mix and watch accretion/dilution shift in real time as synergies kick in.",
      navigateTo: { sim: "ib", tab: "main" },
      foxCorner: "bl",
    },
    {
      title: "100-Point Deal Score",
      body: "Bankers grade deals on valuation discipline, financing, synergies, and risk. Hit 80+ and you've structured a deal that survives committee.",
      navigateTo: { sim: "ib", tab: "main" },
      foxCorner: "tl",
    },
  ],
};

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
  const {
    tourActive,
    tourSim,
    tourStep,
    nextTourStep,
    prevTourStep,
    skipTour,
  } = useFinFox();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  const scrolledRef = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  // Remembers where the fox was last frame so we can walk along the
  // perimeter to the next corner instead of cutting diagonally.
  const prevFoxCornerRef = useRef<FoxCorner | null>(null);

  const steps = tourSim ? TOUR_STEPS[tourSim] : [];
  const step = steps[tourStep];

  // Navigate to correct tab when step changes, then reset scroll so the
  // next "scrollIntoView" starts from a known top-of-page position. Without
  // this the page can land mid-scroll and the spotlight feels disoriented.
  useEffect(() => {
    if (!tourActive || !step?.navigateTo) return;
    window.dispatchEvent(
      new CustomEvent("finfox:navigate", { detail: step.navigateTo }),
    );
    // Hide the previous spotlight while the new tab mounts to avoid a flash
    // of the old highlight in the wrong place.
    setTargetRect(null);
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: "auto" }),
    );
  }, [tourActive, tourStep]);

  // Poll for target element — but only scroll ONCE per step. Wait a brief
  // moment after navigation so React has actually mounted the new tab.
  // Steps without a `target` skip polling entirely and render centered.
  useEffect(() => {
    if (!tourActive || !step) return;
    if (pollRef.current) clearInterval(pollRef.current);

    if (!step.target) {
      // No spotlight needed — center tooltip on screen
      setTargetRect(null);
      return;
    }

    const targetId = step.target;
    scrolledRef.current.delete(targetId);

    const measureAndUpdate = () => {
      const el = getTargetEl(targetId);
      if (el) {
        if (!scrolledRef.current.has(targetId)) {
          scrolledRef.current.add(targetId);
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        animFrameRef.current = requestAnimationFrame(() => {
          const rect = getTargetEl(targetId)?.getBoundingClientRect() ?? null;
          setTargetRect(rect);
        });
      } else {
        setTargetRect(null);
      }
    };

    const initialDelay = setTimeout(measureAndUpdate, 250);
    pollRef.current = setInterval(measureAndUpdate, 600);

    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      const rect = getTargetEl(targetId)?.getBoundingClientRect() ?? null;
      setTargetRect(rect);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(initialDelay);
      if (pollRef.current) clearInterval(pollRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [tourActive, tourStep, step]);

  const handleAdvance = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    nextTourStep();
  }, [nextTourStep]);

  // ── Derived values needed by hooks below — must be computed BEFORE any
  // early returns so the hook order stays stable across renders.
  const safeFound = targetRect !== null;
  const safeFoxCorner: FoxCorner = step?.foxCorner ?? (safeFound ? "br" : "bc");
  const walkPath = perimeterPath(
    prevFoxCornerRef.current ?? safeFoxCorner,
    safeFoxCorner,
  );
  const walkSegmentSec = 1.4;
  const walkDurationMs = Math.max(
    700,
    (walkPath.length - 1) * walkSegmentSec * 1000,
  );
  const typedBody = useTypewriter(step?.body ?? "", walkDurationMs);

  if (!tourActive || !step) return null;

  const found = safeFound;
  const foxCorner = safeFoxCorner;
  const tooltipPos = found
    ? computeTooltipPos(targetRect, vp.w, vp.h)
    : tooltipPosForCorner(foxCorner, vp.w, vp.h);

  const isLast = tourStep === steps.length - 1;

  return (
    <>
      <style>{`
        @keyframes finfox-spotlight-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0), 0 0 0 3px rgba(16,185,129,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.0), 0 0 0 3px rgba(16,185,129,0.6); }
        }
        @keyframes finfox-tour-bob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes finfox-cursor-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        .finfox-tour-fox-inner {
          animation: finfox-tour-bob 0.45s ease-in-out infinite;
          filter: drop-shadow(0 8px 22px rgba(16,185,129,0.4));
        }
      `}</style>

      {/* Overlay */}
      {found ? (
        <>
          {/* Spotlight strips for targeted steps */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              bottom: vp.h - targetRect.top + 4,
              zIndex: 390,
              background: "rgba(3,7,18,0.78)",
              pointerEvents: "all",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: 0,
              right: vp.w - targetRect.left + 4,
              background: "rgba(3,7,18,0.78)",
              pointerEvents: "all",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 390,
              top: targetRect.top - 4,
              bottom: vp.h - targetRect.bottom - 4,
              left: targetRect.right + 4,
              right: 0,
              background: "rgba(3,7,18,0.78)",
              pointerEvents: "all",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: targetRect.bottom + 4,
              inset: 0,
              zIndex: 390,
              background: "rgba(3,7,18,0.78)",
              pointerEvents: "all",
            }}
          />
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
        // Light dim for no-target steps so the user can SEE the simulator
        // they're being toured through. pointer-events: none lets them
        // continue clicking around while the fox narrates.
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 390,
            background: "rgba(3,7,18,0.18)",
            pointerEvents: "none",
            transition: "background 0.4s ease",
          }}
        />
      )}

      {(() => {
        // Compute a perimeter-walking path from previous corner to current.
        const path = perimeterPath(
          prevFoxCornerRef.current ?? foxCorner,
          foxCorner,
        );
        const xs = path.map((c) => cornerToXY(c, vp.w, vp.h)[0]);
        const ys = path.map((c) => cornerToXY(c, vp.w, vp.h)[1]);
        const segmentSec = 1.4;
        const duration = Math.max(0.6, (path.length - 1) * segmentSec);
        let facing: FoxFacing = "right";
        for (let i = 0; i < path.length - 1; i++) {
          facing = facingForMove(
            cornerToXY(path[i], vp.w, vp.h),
            cornerToXY(path[i + 1], vp.w, vp.h),
          );
        }
        prevFoxCornerRef.current = foxCorner;
        return (
          <motion.div
            initial={false}
            animate={{ x: xs, y: ys }}
            transition={{
              duration,
              ease: "linear",
              times:
                xs.length > 1
                  ? xs.map((_, i) => i / (xs.length - 1))
                  : undefined,
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 401,
              pointerEvents: "none",
              willChange: "transform",
              filter: "drop-shadow(0 10px 26px rgba(16,185,129,0.45))",
            }}
          >
            <FoxWalkingSide size={104} facing={facing} />
          </motion.div>
        );
      })()}

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
              {tourStep + 1} / {steps.length}
            </span>
            <div style={{ display: "flex", gap: 3 }}>
              {steps.map((_, i) => (
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
            {typedBody}
            {typedBody.length < step.body.length && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "#34D399",
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                  animation: "finfox-cursor-blink 0.7s steps(1) infinite",
                }}
              />
            )}
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
