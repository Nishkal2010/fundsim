import React, { useState } from "react";
import { X } from "lucide-react";

interface PressureTestGateProps {
  onGenerate: () => void;
  onDismiss: () => void;
}

const CHECKS = [
  "I stress-tested the downside case",
  "My key assumptions are defensible",
  "All numbers tie out end-to-end",
];

export function PressureTestGate({
  onGenerate,
  onDismiss,
}: PressureTestGateProps) {
  const [checked, setChecked] = useState([false, false, false]);

  const allChecked = checked.every(Boolean);

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

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
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 16,
          padding: 24,
          maxWidth: 420,
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
          Before you send this deal
        </p>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.4,
          }}
        >
          Confirm you've pressure-tested the model — a banker will probe every
          assumption.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {CHECKS.map((label, i) => (
            <label
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                style={{
                  accentColor: "#6366F1",
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                }}
              />
              <span style={{ color: "#D1D5DB", fontSize: 14 }}>{label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={onGenerate}
          disabled={!allChecked}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 8,
            border: "none",
            background: allChecked
              ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
              : "#374151",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: allChecked ? "pointer" : "not-allowed",
            opacity: allChecked ? 1 : 0.5,
            transition: "opacity 0.15s, background 0.15s",
          }}
        >
          Generate link
        </button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          {/* Intentional cancel path — dismisses the gate without generating a link */}
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
