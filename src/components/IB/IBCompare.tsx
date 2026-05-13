import React from "react";
import { IBSimulator } from "./IBSimulator";

/**
 * Side-by-side comparison of two IB deals. Each IBSimulator owns its own
 * internal state, so the two panels are independent — pick a different
 * preset in each, tweak offer terms, and compare valuation, accretion,
 * and deal score head-to-head.
 */
export function IBCompare() {
  return (
    <div style={{ background: "#0A0F1C", flex: 1 }}>
      <div
        className="grid gap-3 p-3"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <Panel label="Deal A" accent="#F59E0B">
          <IBSimulator />
        </Panel>
        <Panel label="Deal B" accent="#10B981">
          <IBSimulator />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1F2937",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          borderBottom: `2px solid ${accent}`,
          background: "#0A0F1C",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: accent,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#F9FAFB",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
