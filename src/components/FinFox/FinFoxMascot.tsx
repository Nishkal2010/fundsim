import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import type { FinFoxCorner, FinFoxExpression } from "./FinFoxProvider";

const CORNER_STYLE: Record<FinFoxCorner, React.CSSProperties> = {
  "bottom-right": { bottom: 20, right: 20 },
  "bottom-left": { bottom: 20, left: 20 },
  "top-right": { top: 80, right: 20 },
  "top-left": { top: 80, left: 20 },
};

interface FoxSvgProps {
  expression: FinFoxExpression;
  size?: number;
}

// Green fox — clean geometric flat design (Mint Mobile inspired)
export function FoxSvg({ expression, size = 48 }: FoxSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tail */}
      <path d="M52 56 Q70 44 65 62 Q61 72 46 66 Z" fill="#059669" />
      <path d="M54 59 Q66 50 63 62 Q60 68 48 64 Z" fill="#A7F3D0" />

      {/* Body */}
      <ellipse cx="40" cy="56" rx="18" ry="13" fill="#10B981" />

      {/* Left ear */}
      <polygon points="20,30 14,6 30,24" fill="#10B981" />
      <polygon points="21,29 16,11 28,24" fill="#6EE7B7" />

      {/* Right ear */}
      <polygon points="60,30 66,6 50,24" fill="#10B981" />
      <polygon points="59,29 64,11 52,24" fill="#6EE7B7" />

      {/* Head — wide rounded rect */}
      <rect x="18" y="18" width="44" height="40" rx="22" fill="#10B981" />

      {/* White chest patch */}
      <ellipse cx="40" cy="56" rx="10" ry="7" fill="#ECFDF5" />

      {/* Muzzle */}
      <rect x="27" y="40" width="26" height="14" rx="10" fill="#ECFDF5" />

      {/* Nose */}
      <rect x="36" y="41" width="8" height="5" rx="2.5" fill="#065F46" />

      {/* Eyes */}
      {expression === "thinking" ? (
        <>
          <path
            d="M27 34 Q31 31 35 34"
            stroke="#065F46"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M45 34 Q49 31 53 34"
            stroke="#065F46"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : expression === "approving" ? (
        <>
          <path
            d="M26 35 Q31 29 36 35"
            stroke="#065F46"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M44 35 Q49 29 54 35"
            stroke="#065F46"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="31" cy="33" r="5" fill="#065F46" />
          <circle cx="49" cy="33" r="5" fill="#065F46" />
          <circle cx="33" cy="31" r="1.8" fill="white" />
          <circle cx="51" cy="31" r="1.8" fill="white" />
        </>
      )}

      {/* Mouth */}
      {expression === "approving" ? (
        <path
          d="M34 48 Q40 53 46 48"
          stroke="#065F46"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M35 48 Q40 51 45 48"
          stroke="#6EE7B7"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function FinFoxMascot() {
  const { disabled, chatOpen, expression, foxCorner, openChat, tourActive } =
    useFinFox();

  if (disabled) return null;

  // During tour, fox is shown inside GuidedTour at correct corner
  if (tourActive) return null;

  const cornerStyle = CORNER_STYLE[foxCorner];

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 200,
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        ...cornerStyle,
      }}
    >
      <button
        onClick={() => !chatOpen && openChat()}
        title="Ask FinFox"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: chatOpen ? "default" : "pointer",
          display: "block",
          opacity: chatOpen ? 0.5 : 1,
          transition: "opacity 0.2s ease",
          filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.25))",
        }}
      >
        <FoxSvg expression={expression} size={36} />
      </button>
    </div>
  );
}
