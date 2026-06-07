import React, { useState } from "react";
import { X } from "lucide-react";

interface DefenseGateProps {
  prompt: string;
  onSubmit: (defense: string) => void;
  onDismiss: () => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function DefenseGate({ prompt, onSubmit, onDismiss }: DefenseGateProps) {
  const [defense, setDefense] = useState("");
  const words = countWords(defense);
  const inRange = words >= 80 && words <= 120;

  const wordCountColor = inRange
    ? "#34D399"
    : words > 0
      ? "#F59E0B"
      : "#6B7280";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 16,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={onDismiss}
          title="Cancel"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={16} />
        </button>

        <p
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 6,
          }}
        >
          Defend your assumption
        </p>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            fontStyle: "italic",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {prompt}
        </p>

        <textarea
          value={defense}
          onChange={(e) => setDefense(e.target.value)}
          placeholder="Explain your reasoning… (80–120 words)"
          rows={6}
          style={{
            width: "100%",
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 8,
            color: "#E5E7EB",
            fontSize: 13,
            lineHeight: 1.6,
            padding: "10px 12px",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 6,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: wordCountColor,
              transition: "color 0.15s",
            }}
          >
            {words} / 80–120 words
          </span>
        </div>

        <button
          onClick={() => inRange && onSubmit(defense)}
          disabled={!inRange}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 8,
            border: "none",
            background: inRange
              ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
              : "#374151",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: inRange ? "pointer" : "not-allowed",
            opacity: inRange ? 1 : 0.5,
            transition: "opacity 0.15s, background 0.15s",
          }}
        >
          Generate submission link
        </button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              fontSize: 12,
              textDecoration: "underline",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D1D5DB")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
