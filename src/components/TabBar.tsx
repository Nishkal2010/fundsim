import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  BarChart3,
  Layers,
  Activity,
  Briefcase,
  Building2,
  GitBranch,
  ArrowLeft,
  DollarSign,
  PieChart,
  FileText,
  Shield,
  Star,
  Globe,
  ClipboardList,
  Swords,
} from "lucide-react";

export type PETabId =
  | "lifecycle"
  | "jcurve"
  | "waterfall"
  | "performance"
  | "portfolio"
  | "lbo"
  | "gplp"
  | "debt"
  | "sector"
  | "roleplay";

export type VCTabId =
  | "captable"
  | "safe"
  | "portfolioconstruction"
  | "termsheet"
  | "qualitative"
  | "marketsizing"
  | "dealmemo"
  | "roleplay";

export type TabId = PETabId | VCTabId;

type SimulatorId = "pe" | "vc" | "ib";

const peTabs: {
  id: PETabId;
  label: string;
  icon: React.FC<{ size?: number }>;
  group: string;
}[] = [
  { id: "lifecycle", label: "Fund Lifecycle", icon: Layers, group: "fund" },
  { id: "jcurve", label: "J-Curve", icon: TrendingDown, group: "fund" },
  { id: "waterfall", label: "Waterfall", icon: BarChart3, group: "fund" },
  { id: "performance", label: "Performance", icon: Activity, group: "fund" },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, group: "models" },
  { id: "lbo", label: "LBO Model", icon: Building2, group: "models" },
  { id: "gplp", label: "GP/LP Economics", icon: DollarSign, group: "advanced" },
  { id: "debt", label: "Debt Structure", icon: PieChart, group: "advanced" },
  {
    id: "sector",
    label: "Sector Benchmarks",
    icon: BarChart3,
    group: "advanced",
  },
  { id: "roleplay", label: "Role-Play", icon: Swords, group: "roleplay" },
];

const vcTabs: {
  id: VCTabId;
  label: string;
  icon: React.FC<{ size?: number }>;
  group: string;
}[] = [
  { id: "captable", label: "Cap Table", icon: GitBranch, group: "core" },
  { id: "safe", label: "SAFE Notes", icon: FileText, group: "core" },
  {
    id: "portfolioconstruction",
    label: "Portfolio Construction",
    icon: PieChart,
    group: "fund",
  },
  { id: "termsheet", label: "Term Sheet", icon: Shield, group: "fund" },
  { id: "qualitative", label: "Qualitative Score", icon: Star, group: "edge" },
  { id: "marketsizing", label: "Market Sizing", icon: Globe, group: "edge" },
  { id: "dealmemo", label: "Deal Memo", icon: ClipboardList, group: "edge" },
  { id: "roleplay", label: "Role-Play", icon: Swords, group: "roleplay" },
];

const peColor = "#818CF8";
const vcColor = "#34D399";

interface TabBarProps {
  simulator: SimulatorId;
  active: TabId;
  onChange: (tab: TabId) => void;
  onBack: () => void;
}

export function TabBar({ simulator, active, onChange, onBack }: TabBarProps) {
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  const accentColor = simulator === "pe" ? peColor : vcColor;
  const accentDim =
    simulator === "pe" ? "rgba(99,102,241,0.05)" : "rgba(52,211,153,0.05)";
  const gradient =
    simulator === "pe"
      ? "linear-gradient(90deg, #6366F1, #818CF8)"
      : "linear-gradient(90deg, #10B981, #34D399)";

  const tabs = simulator === "pe" ? peTabs : vcTabs;

  const groups =
    simulator === "pe"
      ? [
          { key: "fund", label: "Fund" },
          { key: "models", label: "Models" },
          { key: "advanced", label: "Advanced" },
          { key: "roleplay", label: "FinFox" },
        ]
      : [
          { key: "core", label: "Core" },
          { key: "fund", label: "Fund" },
          { key: "edge", label: "Edge" },
          { key: "roleplay", label: "FinFox" },
        ];

  const renderTab = (tab: (typeof peTabs)[0] | (typeof vcTabs)[0]) => {
    const Icon = tab.icon;
    const isActive = tab.id === active;
    const isHovered = hoveredTab === tab.id;

    return (
      <button
        key={tab.id}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${tab.id}`}
        onClick={() => onChange(tab.id as TabId)}
        onMouseEnter={() => setHoveredTab(tab.id as TabId)}
        onMouseLeave={() => setHoveredTab(null)}
        className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium"
        style={{
          color: isActive ? accentColor : isHovered ? "#D1D5DB" : "#6B7280",
          background: isHovered && !isActive ? accentDim : "transparent",
          transition: "color 0.18s ease, background 0.18s ease",
          borderRadius: "6px 6px 0 0",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.18s ease",
          }}
        >
          <Icon size={15} />
        </span>
        {tab.label}
        {isActive && (
          <motion.div
            layoutId="tab-indicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ background: gradient }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    );
  };

  return (
    <div
      className="w-full px-6"
      style={{ background: "#111827", borderBottom: "1px solid #374151" }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-0 overflow-x-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          aria-label="Back to simulator selection"
          className="flex items-center gap-1.5 mr-4 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#D1D5DB",
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.13)";
            (e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLButtonElement).style.color = "#D1D5DB";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,255,255,0.15)";
          }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {/* Simulator badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded mr-4 flex-shrink-0"
          style={{
            background:
              simulator === "pe"
                ? "rgba(99,102,241,0.12)"
                : "rgba(52,211,153,0.12)",
            color: accentColor,
            border: `1px solid ${simulator === "pe" ? "rgba(99,102,241,0.3)" : "rgba(52,211,153,0.3)"}`,
            fontFamily: "monospace",
          }}
        >
          {simulator.toUpperCase()}
        </span>

        {/* Tabs grouped */}
        <div
          role="tablist"
          aria-label={`${simulator.toUpperCase()} simulator tabs`}
          className="flex items-center gap-0"
        >
          {groups.map((group, gi) => (
            <React.Fragment key={group.key}>
              {gi > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "#374151",
                    margin: "0 8px",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: 10,
                  color: "#4B5563",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  paddingRight: 4,
                  flexShrink: 0,
                }}
              >
                {group.label}
              </span>
              {tabs.filter((t) => t.group === group.key).map(renderTab)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
