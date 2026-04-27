import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import type { FinFoxCorner, FinFoxExpression } from "./FinFoxProvider";

const CORNER_STYLE: Record<FinFoxCorner, React.CSSProperties> = {
  "bottom-right": { bottom: 24, right: 24 },
  "bottom-left": { bottom: 24, left: 24 },
  "top-right": { top: 80, right: 24 },
  "top-left": { top: 80, left: 24 },
};

interface FoxSvgProps {
  expression: FinFoxExpression;
  size?: number;
}

function FoxSvg({ expression, size = 64 }: FoxSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tail */}
      <ellipse
        cx="48"
        cy="48"
        rx="10"
        ry="7"
        fill="#F59E0B"
        transform="rotate(-30 48 48)"
      />
      <ellipse
        cx="48"
        cy="48"
        rx="6"
        ry="4"
        fill="#FEF3C7"
        transform="rotate(-30 48 48)"
      />

      {/* Body */}
      <ellipse cx="32" cy="40" rx="16" ry="13" fill="#F59E0B" />

      {/* Left ear */}
      <polygon points="12,20 8,6 20,16" fill="#F59E0B" />
      <polygon points="13,19 9,9 19,16" fill="#F87171" />

      {/* Right ear */}
      <polygon points="52,20 56,6 44,16" fill="#F59E0B" />
      <polygon points="51,19 55,9 45,16" fill="#F87171" />

      {/* Head */}
      <circle cx="32" cy="28" r="16" fill="#F59E0B" />

      {/* Muzzle */}
      <ellipse cx="32" cy="34" rx="8" ry="5" fill="#F9FAFB" />

      {/* Nose */}
      <ellipse cx="32" cy="32" rx="2.5" ry="1.8" fill="#1F2937" />

      {/* Eyes */}
      {expression === "thinking" ? (
        <>
          {/* Thinking eyes — half closed */}
          <path
            d="M24 25 Q26 23 28 25"
            stroke="#1F2937"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36 25 Q38 23 40 25"
            stroke="#1F2937"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : expression === "approving" ? (
        <>
          {/* Approving eyes — arched upward (happy) */}
          <path
            d="M24 26 Q26 22 28 26"
            stroke="#1F2937"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36 26 Q38 22 40 26"
            stroke="#1F2937"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Neutral eyes — normal circles */}
          <circle cx="26" cy="25" r="3" fill="#1F2937" />
          <circle cx="38" cy="25" r="3" fill="#1F2937" />
          {/* Eye shine */}
          <circle cx="27" cy="24" r="1" fill="#F9FAFB" />
          <circle cx="39" cy="24" r="1" fill="#F9FAFB" />
        </>
      )}

      {/* Mouth */}
      {expression === "approving" ? (
        <path
          d="M28 36 Q32 39 36 36"
          stroke="#1F2937"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M29 36 Q32 38 35 36"
          stroke="#9CA3AF"
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

  const cornerStyle = CORNER_STYLE[foxCorner];

  return (
    <>
      <style>{`
        @keyframes finfox-blink {
          0%, 92%, 100% { opacity: 1; }
          94%, 98% { opacity: 0; }
        }
        @keyframes finfox-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes finfox-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .finfox-mascot-svg {
          animation: finfox-float 3s ease-in-out infinite;
        }
        .finfox-mascot-svg.thinking {
          animation: finfox-float 1s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          zIndex: 200,
          transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          ...cornerStyle,
        }}
      >
        {/* Pulse ring when not open */}
        {!chatOpen && !tourActive && (
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "2px solid rgba(245,158,11,0.5)",
              animation: "finfox-pulse-ring 2.5s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        <button
          onClick={() => !chatOpen && openChat()}
          title="Ask FinFox"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: chatOpen ? "default" : "pointer",
            display: "block",
            filter: "drop-shadow(0 4px 12px rgba(245,158,11,0.35))",
          }}
        >
          <div
            className={`finfox-mascot-svg${expression === "thinking" ? " thinking" : ""}`}
            style={{
              animation:
                expression === "thinking"
                  ? "finfox-float 1s ease-in-out infinite"
                  : "finfox-float 3s ease-in-out infinite",
            }}
          >
            <FoxSvg expression={expression} size={64} />
          </div>
        </button>
      </div>
    </>
  );
}

export { FoxSvg };
