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

// Green flat-design fox — Mint Mobile inspired
export function FoxSvg({ expression, size = 48 }: FoxSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tail */}
      <path d="M44 46 Q58 38 54 54 Q50 62 38 56 Z" fill="#059669" />
      <path d="M46 49 Q56 43 53 54 Q50 59 40 55 Z" fill="#6EE7B7" />

      {/* Body */}
      <ellipse cx="32" cy="44" rx="15" ry="11" fill="#10B981" />

      {/* Left ear — sharp pointed */}
      <polygon points="16,22 11,4 24,17" fill="#10B981" />
      <polygon points="17,21 13,8 23,17" fill="#6EE7B7" />

      {/* Right ear */}
      <polygon points="48,22 53,4 40,17" fill="#10B981" />
      <polygon points="47,21 51,8 41,17" fill="#6EE7B7" />

      {/* Head */}
      <circle cx="32" cy="28" r="16" fill="#10B981" />

      {/* Chest / inner fur */}
      <ellipse cx="32" cy="44" rx="8" ry="6" fill="#ECFDF5" />

      {/* Muzzle */}
      <ellipse cx="32" cy="33" rx="7" ry="4.5" fill="#ECFDF5" />

      {/* Nose */}
      <ellipse cx="32" cy="31" rx="2" ry="1.5" fill="#065F46" />

      {/* Eyes */}
      {expression === "thinking" ? (
        <>
          <path
            d="M24 25 Q26 22 28 25"
            stroke="#065F46"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36 25 Q38 22 40 25"
            stroke="#065F46"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : expression === "approving" ? (
        <>
          <path
            d="M23 26 Q26 21 29 26"
            stroke="#065F46"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M35 26 Q38 21 41 26"
            stroke="#065F46"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Rosy cheeks */}
          <circle cx="22" cy="30" r="3" fill="rgba(16,185,129,0.3)" />
          <circle cx="42" cy="30" r="3" fill="rgba(16,185,129,0.3)" />
        </>
      ) : (
        <>
          <circle cx="26" cy="25" r="4" fill="#065F46" />
          <circle cx="38" cy="25" r="4" fill="#065F46" />
          <circle cx="27.5" cy="23.5" r="1.4" fill="white" />
          <circle cx="39.5" cy="23.5" r="1.4" fill="white" />
        </>
      )}

      {/* Mouth */}
      {expression === "approving" ? (
        <path
          d="M28 35 Q32 38.5 36 35"
          stroke="#065F46"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M29 35 Q32 37 35 35"
          stroke="#6EE7B7"
          strokeWidth="1.2"
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
