import React, { useState } from "react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { FundModelContext } from "../hooks/useFundModel";
import type { FundModel } from "../types/fund";
import { GlobalInputs } from "./GlobalInputs";
import { TabBar } from "./TabBar";
import type { PETabId } from "./TabBar";
import { FundLifecycleTab } from "./FundLifecycle/FundLifecycleTab";
import { JCurveTab } from "./JCurve/JCurveTab";
import { WaterfallTab } from "./Waterfall/WaterfallTab";
import { PerformanceTab } from "./Performance/PerformanceTab";

interface ComparePanelProps {
  model: FundModel;
  label: "Fund A" | "Fund B";
  accentColor: string; // e.g. '#6366F1' for A, '#10B981' for B
  activeTab: PETabId;
  onTabChange: (tab: PETabId) => void;
}

export function ComparePanel({
  model,
  label,
  accentColor,
  activeTab,
  onTabChange,
}: ComparePanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabContent: Record<PETabId, React.ReactNode> = {
    lifecycle: <FundLifecycleTab />,
    jcurve: <JCurveTab />,
    waterfall: <WaterfallTab />,
    performance: <PerformanceTab />,
    portfolio: null,
    lbo: null,
    gplp: null,
    debt: null,
    sector: null,
  };

  return (
    <FundModelContext.Provider value={model}>
      <LayoutGroup id={label}>
        <div
          className="flex flex-col min-h-0"
          style={{
            background: "#111827",
            border: "1px solid #1F2937",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: `2px solid ${accentColor}`,
              background: "#0A0F1C",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: accentColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{ color: "#F9FAFB", fontWeight: 600, fontSize: "15px" }}
            >
              {label}
            </span>
          </div>

          {/* Collapsible settings */}
          <div style={{ borderBottom: "1px solid #1F2937" }}>
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className="flex items-center gap-2 w-full px-4 py-2 text-left"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9CA3AF",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              <Settings size={13} />
              Fund Settings
              {settingsOpen ? (
                <ChevronUp size={13} style={{ marginLeft: "auto" }} />
              ) : (
                <ChevronDown size={13} style={{ marginLeft: "auto" }} />
              )}
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <GlobalInputs />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab bar */}
          <TabBar
            simulator="pe"
            active={activeTab}
            onChange={(t) => onTabChange(t as PETabId)}
            onBack={() => {}}
          />

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>
    </FundModelContext.Provider>
  );
}
