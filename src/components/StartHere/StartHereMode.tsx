import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimulatorId } from "../SimulatorSelector";
import type { PETabId, VCTabId } from "../TabBar";
import { captureEvent } from "../../lib/posthog";

export interface StartHereModeProps {
  onClose: () => void;
  // finfoxMsg is passed as 5th arg so App.tsx can fire openChat AFTER
  // React commits the new activeSimulator/tab state — no setTimeout race.
  onComplete: (
    sim: SimulatorId,
    peTab?: PETabId,
    vcTab?: VCTabId,
    ibView?: "simulator" | "compare" | "roleplay",
    finfoxMsg?: string,
  ) => void;
}

type Background = "new" | "some" | "interview";
type Goal = string;

const BACKDROP: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(0,0,0,0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const CARD: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  borderRadius: 14,
  background: "#111827",
  border: "1px solid #1F2937",
  padding: "28px",
  position: "relative",
};

const PILL_BASE: React.CSSProperties = {
  width: "100%",
  padding: "12px 18px",
  borderRadius: 10,
  border: "1px solid #1F2937",
  background: "transparent",
  color: "#E5E7EB",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.12s, border-color 0.12s",
};

const PILL_HOVER: React.CSSProperties = {
  background: "rgba(129,140,248,0.10)",
  borderColor: "rgba(129,140,248,0.35)",
};

function Pill({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{ ...PILL_BASE, ...(hovered ? PILL_HOVER : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span style={{ display: "block" }}>{label}</span>
      {sub && (
        <span
          style={{
            display: "block",
            fontSize: 12,
            color: "#6B7280",
            marginTop: 3,
            fontWeight: 400,
          }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

export function StartHereMode({ onClose, onComplete }: StartHereModeProps) {
  // Steps: 0 = background selection, 1 = goal selection (removed empty welcome step)
  const [step, setStep] = useState<0 | 1>(0);
  const [background, setBackground] = useState<Background | null>(null);

  const dismiss = useCallback(
    (s: number) => {
      captureEvent("start_here_skipped", { step: s });
      onClose();
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) dismiss(step);
    },
    [dismiss, step],
  );

  const resolve = useCallback(
    (bg: Background, goal: Goal) => {
      let sim: SimulatorId;
      let peTab: PETabId | undefined;
      let vcTab: VCTabId | undefined;
      let ibView: "simulator" | "compare" | "roleplay" | undefined;
      let finfoxMsg: string | undefined;

      if (bg === "new" && goal === "understand") {
        sim = "pe";
        peTab = "lifecycle";
        finfoxMsg =
          "I'm new to finance. Walk me through how a PE fund lifecycle works.";
      } else if (bg === "new" && goal === "dealmath") {
        sim = "pe";
        peTab = "waterfall";
        finfoxMsg = "Explain a waterfall distribution in plain English.";
      } else if (bg === "some" && goal === "practice") {
        sim = "pe";
        peTab = "waterfall";
        finfoxMsg =
          "Help me practice the waterfall — explain carried interest step by step.";
      } else if (bg === "some" && goal === "explore") {
        // No sim; scroll to selector. scrollIntoView fires directly after
        // onClose() because #simulator-selector lives outside the modal and
        // survives the modal unmount — no setTimeout needed.
        captureEvent("start_here_completed", {
          background: bg,
          goal,
          dest_sim: "none",
          dest_tab: "none",
        });
        onClose();
        document
          .getElementById("simulator-selector")
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      } else if (bg === "interview" && goal === "ib") {
        sim = "ib";
        ibView = "simulator";
        finfoxMsg =
          "I'm prepping for IB interviews. Walk me through an M&A deal.";
      } else {
        // interview + vcpe
        sim = "pe";
        peTab = "roleplay";
        finfoxMsg =
          "I'm preparing for PE interviews. Let's do a deal walkthrough.";
      }

      captureEvent("start_here_completed", {
        background: bg,
        goal,
        dest_sim: sim,
        dest_tab: peTab ?? vcTab ?? ibView ?? "none",
      });

      // Pass finfoxMsg to parent so it fires openChat AFTER React commits the
      // new activeSimulator state (via useEffect in App.tsx), not via a fragile
      // setTimeout race from inside the modal.
      onComplete(sim, peTab, vcTab, ibView, finfoxMsg);
    },
    [onClose, onComplete],
  );

  const goalOptions: Record<
    Background,
    { label: string; sub: string; key: string }[]
  > = {
    new: [
      {
        label: "Understand how a fund works",
        sub: "See how capital flows from LPs to portfolio companies over a fund's life",
        key: "understand",
      },
      {
        label: "See real deal math",
        sub: "Walk through a waterfall — FinFox will explain each number as you drag",
        key: "dealmath",
      },
    ],
    some: [
      {
        label: "Practice deal modeling",
        sub: "Drag the waterfall sliders and test your intuition on carried interest",
        key: "practice",
      },
      {
        label: "Explore on my own",
        sub: "Jump straight to the simulator menu and pick what interests you",
        key: "explore",
      },
    ],
    interview: [
      {
        label: "Run through IB deal questions",
        sub: "M&A scenario with FinFox coaching — common first-round topics",
        key: "ib",
      },
      {
        label: "Practice VC / PE reasoning",
        sub: "Deal walkthrough with FinFox — typical case-style questions",
        key: "vcpe",
      },
    ],
  };

  return (
    <div style={BACKDROP} onClick={handleBackdropClick}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          style={CARD}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
        >
          {/* X close */}
          <button
            onClick={() => dismiss(step)}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: "transparent",
              border: "none",
              color: "#6B7280",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 4px",
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Step indicator — now 2 steps */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  height: 3,
                  flex: 1,
                  borderRadius: 2,
                  background: i <= step ? "#818CF8" : "#1F2937",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>

          {step === 0 && (
            <>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#F9FAFB",
                }}
              >
                Welcome to FundSim — where do you start?
              </h2>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9CA3AF" }}>
                Pick the closest match. Takes 10 seconds.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(
                  [
                    {
                      label: "New to finance",
                      sub: "Haven't studied accounting, PE, or IB yet",
                      key: "new" as Background,
                    },
                    {
                      label: "Some finance background",
                      sub: "Know the basics — want to go deeper",
                      key: "some" as Background,
                    },
                    {
                      label: "Prepping for interviews",
                      sub: "IB / PE / VC recruiting soon",
                      key: "interview" as Background,
                    },
                  ] as { label: string; sub: string; key: Background }[]
                ).map((opt) => (
                  <Pill
                    key={opt.key}
                    label={opt.label}
                    sub={opt.sub}
                    onClick={() => {
                      setBackground(opt.key);
                      setStep(1);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && background && (
            <>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#F9FAFB",
                }}
              >
                What do you want to do?
              </h2>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9CA3AF" }}>
                FinFox will walk you through it once you land.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {goalOptions[background].map((opt) => (
                  <Pill
                    key={opt.key}
                    label={opt.label}
                    sub={opt.sub}
                    onClick={() => resolve(background, opt.key)}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
