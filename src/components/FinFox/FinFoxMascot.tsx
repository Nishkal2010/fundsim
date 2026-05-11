import React from "react";
import { useFinFox } from "../../hooks/useFinFox";
import type { FinFoxExpression } from "./FinFoxProvider";

interface FoxSvgProps {
  expression: FinFoxExpression;
  size?: number;
  walking?: boolean;
}

export function FoxSvg({
  expression,
  size = 48,
  walking = false,
}: FoxSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes finfox-leg-a {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-2.5px) rotate(10deg); }
        }
        @keyframes finfox-leg-b {
          0%, 100% { transform: translateY(-2.5px) rotate(10deg); }
          50%      { transform: translateY(0) rotate(0deg); }
        }
        @keyframes finfox-tail-wag {
          0%, 100% { transform: rotate(-6deg); }
          50%      { transform: rotate(8deg); }
        }
      `}</style>

      {/* Tail (wags when walking) */}
      <g
        style={
          walking
            ? {
                transformOrigin: "54px 60px",
                animation: "finfox-tail-wag 0.7s ease-in-out infinite",
              }
            : undefined
        }
      >
        <path d="M52 56 Q70 44 65 62 Q61 72 46 66 Z" fill="#059669" />
        <path d="M54 59 Q66 50 63 62 Q60 68 48 64 Z" fill="#A7F3D0" />
      </g>

      {/* Legs (visible below body). Front-left + back-right share a phase;
          front-right + back-left share the opposite phase, so the walk
          looks like a real diagonal gait. */}
      <g
        style={
          walking
            ? {
                transformOrigin: "27px 64px",
                animation: "finfox-leg-a 0.45s ease-in-out infinite",
              }
            : undefined
        }
      >
        <rect x="24.5" y="62" width="5" height="14" rx="2.5" fill="#059669" />
      </g>
      <g
        style={
          walking
            ? {
                transformOrigin: "53px 64px",
                animation: "finfox-leg-a 0.45s ease-in-out infinite",
              }
            : undefined
        }
      >
        <rect x="50.5" y="62" width="5" height="14" rx="2.5" fill="#059669" />
      </g>
      <g
        style={
          walking
            ? {
                transformOrigin: "37px 64px",
                animation: "finfox-leg-b 0.45s ease-in-out infinite",
              }
            : undefined
        }
      >
        <rect x="34.5" y="62" width="5" height="14" rx="2.5" fill="#10B981" />
      </g>
      <g
        style={
          walking
            ? {
                transformOrigin: "47px 64px",
                animation: "finfox-leg-b 0.45s ease-in-out infinite",
              }
            : undefined
        }
      >
        <rect x="44.5" y="62" width="5" height="14" rx="2.5" fill="#10B981" />
      </g>

      {/* Body */}
      <ellipse cx="40" cy="56" rx="18" ry="13" fill="#10B981" />

      {/* Ears */}
      <polygon points="20,30 14,6 30,24" fill="#10B981" />
      <polygon points="21,29 16,11 28,24" fill="#6EE7B7" />
      <polygon points="60,30 66,6 50,24" fill="#10B981" />
      <polygon points="59,29 64,11 52,24" fill="#6EE7B7" />

      {/* Head */}
      <rect x="18" y="18" width="44" height="40" rx="22" fill="#10B981" />

      {/* Chest patch */}
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
  const { disabled, chatOpen, expression, tourActive, openChat } = useFinFox();

  if (disabled) return null;
  if (tourActive) return null;

  return (
    <>
      <style>{`
        @keyframes finfox-idle-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes finfox-idle-glow {
          0%, 100% { filter: drop-shadow(0 2px 6px rgba(16,185,129,0.22)); }
          50% { filter: drop-shadow(0 4px 12px rgba(16,185,129,0.45)); }
        }
        @keyframes finfox-hint-pulse {
          0%, 100% { opacity: 0; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 200,
        }}
      >
        {/* "?" hint badge when chat is closed */}
        {!chatOpen && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              zIndex: 1,
              animation: "finfox-hint-pulse 3s ease-in-out 2s infinite",
              pointerEvents: "none",
            }}
          >
            ?
          </div>
        )}

        <button
          onClick={() => !chatOpen && openChat()}
          title="Ask FinFox (press ? anywhere)"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: chatOpen ? "default" : "pointer",
            display: "block",
            opacity: chatOpen ? 0.45 : 1,
            transition: "opacity 0.2s ease",
            animation: chatOpen
              ? "none"
              : expression === "thinking"
                ? "none"
                : "finfox-idle-bob 3s ease-in-out infinite, finfox-idle-glow 3s ease-in-out infinite",
          }}
        >
          <FoxSvg expression={expression} size={38} />
        </button>
      </div>
    </>
  );
}
