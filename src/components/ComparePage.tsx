import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useFundModelState } from "../hooks/useFundModel";
import type { PETabId } from "./TabBar";
import { ComparePanel } from "./ComparePanel";

// Fund B defaults — meaningfully different from Fund A so comparison is interesting on load
const FUND_B_OVERRIDES = {
  carryPercentage: 0.25,
  avgExitMultiple: 2.5,
  lossRatio: 0.35,
  managementFee: 0.025,
  waterfallType: "american" as const,
};

export function ComparePage() {
  const modelA = useFundModelState(null);
  const modelB = useFundModelState(null);
  const [activeTab, setActiveTab] = useState<PETabId>("lifecycle");

  // Apply Fund B overrides once on mount
  useEffect(() => {
    modelB.setInput("carryPercentage", FUND_B_OVERRIDES.carryPercentage);
    modelB.setInput("avgExitMultiple", FUND_B_OVERRIDES.avgExitMultiple);
    modelB.setInput("lossRatio", FUND_B_OVERRIDES.lossRatio);
    modelB.setInput("managementFee", FUND_B_OVERRIDES.managementFee);
    modelB.setInput("waterfallType", FUND_B_OVERRIDES.waterfallType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Page header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => {
            window.location.hash = "";
          }}
          className="flex items-center gap-2"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: "14px",
            padding: "6px 10px",
            borderRadius: "8px",
            transition: "color 0.18s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
          }}
        >
          <ArrowLeft size={16} />
          Back to Simulator
        </button>

        <span style={{ color: "#6B7280", fontSize: "14px" }}>|</span>

        <span style={{ color: "#F9FAFB", fontWeight: 600, fontSize: "16px" }}>
          Compare Mode
        </span>
      </div>

      {/* Two-panel grid */}
      <div
        className="flex-1 p-4 grid gap-4"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
        }}
      >
        <ComparePanel
          model={modelA}
          label="Fund A"
          accentColor="#6366F1"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <ComparePanel
          model={modelB}
          label="Fund B"
          accentColor="#10B981"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
