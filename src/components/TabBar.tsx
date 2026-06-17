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
  Sigma,
  Dices,
  LineChart,
  Gauge,
  Waves,
  Landmark,
  BrainCircuit,
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

export type QuantTabId =
  | "pricepaths"
  | "montecarlo"
  | "options"
  | "greeks"
  | "impliedvol"
  | "frontier"
  | "risk"
  | "fixedincome"
  | "backtest"
  | "drills"
  | "roleplay";

export type TabId = PETabId | VCTabId | QuantTabId;

type SimulatorId = "pe" | "vc" | "ib" | "quant";

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

const quantTabs: {
  id: QuantTabId;
  label: string;
  icon: React.FC<{ size?: number }>;
  group: string;
}[] = [
  { id: "pricepaths", label: "Random Walks", icon: Waves, group: "sim" },
  { id: "montecarlo", label: "Monte Carlo", icon: Dices, group: "sim" },
  { id: "options", label: "Options Lab", icon: LineChart, group: "options" },
  { id: "greeks", label: "The Greeks", icon: Sigma, group: "options" },
  { id: "impliedvol", label: "Implied Vol", icon: Activity, group: "options" },
  { id: "frontier", label: "Optimizer", icon: PieChart, group: "portfolio" },
  { id: "risk", label: "Risk Desk", icon: Gauge, group: "portfolio" },
  {
    id: "fixedincome",
    label: "Fixed Income",
    icon: Landmark,
    group: "portfolio",
  },
  { id: "backtest", label: "Backtester", icon: BarChart3, group: "strategy" },
  {
    id: "drills",
    label: "Quant Drills",
    icon: BrainCircuit,
    group: "strategy",
  },
  { id: "roleplay", label: "Role-Play", icon: Swords, group: "roleplay" },
];

const peColor = "#d9be7a";
const vcColor = "#4bcb98";
const quantColor = "#5b9dff";

// Per-simulator accent config — generalizes the previous pe/vc ternaries so a
// 3rd/4th track slots in by adding one entry.
const SIM_ACCENT: Record<
  SimulatorId,
  {
    color: string;
    dim: string;
    gradient: string;
    badgeBg: string;
    badgeBorder: string;
  }
> = {
  pe: {
    color: peColor,
    dim: "rgba(198, 161, 75,0.05)",
    gradient: "linear-gradient(90deg, #c6a14b, #d9be7a)",
    badgeBg: "rgba(198, 161, 75,0.12)",
    badgeBorder: "rgba(198, 161, 75,0.3)",
  },
  vc: {
    color: vcColor,
    dim: "rgba(52,211,153,0.05)",
    gradient: "linear-gradient(90deg, #1fa971, #4bcb98)",
    badgeBg: "rgba(52,211,153,0.12)",
    badgeBorder: "rgba(52,211,153,0.3)",
  },
  ib: {
    color: "#e8913a",
    dim: "rgba(245,158,11,0.05)",
    gradient: "linear-gradient(90deg, #d97f2a, #e8913a)",
    badgeBg: "rgba(245,158,11,0.12)",
    badgeBorder: "rgba(245,158,11,0.3)",
  },
  quant: {
    color: quantColor,
    dim: "rgba(91,157,255,0.06)",
    gradient: "linear-gradient(90deg, #3b82f6, #5b9dff)",
    badgeBg: "rgba(91,157,255,0.12)",
    badgeBorder: "rgba(91,157,255,0.3)",
  },
};

interface TabBarProps {
  simulator: SimulatorId;
  active: TabId;
  onChange: (tab: TabId) => void;
  onBack: () => void;
}

export function TabBar({ simulator, active, onChange, onBack }: TabBarProps) {
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  const accent = SIM_ACCENT[simulator];
  const accentColor = accent.color;
  const accentDim = accent.dim;
  const gradient = accent.gradient;

  const tabs =
    simulator === "pe" ? peTabs : simulator === "vc" ? vcTabs : quantTabs;

  const groups =
    simulator === "pe"
      ? [
          { key: "fund", label: "Fund" },
          { key: "models", label: "Models" },
          { key: "advanced", label: "Advanced" },
          { key: "roleplay", label: "FinFox" },
        ]
      : simulator === "vc"
        ? [
            { key: "core", label: "Core" },
            { key: "fund", label: "Fund" },
            { key: "edge", label: "Edge" },
            { key: "roleplay", label: "FinFox" },
          ]
        : [
            { key: "sim", label: "Simulate" },
            { key: "options", label: "Options" },
            { key: "portfolio", label: "Portfolio" },
            { key: "strategy", label: "Strategy" },
            { key: "roleplay", label: "FinFox" },
          ];

  const renderTab = (
    tab: (typeof peTabs)[0] | (typeof vcTabs)[0] | (typeof quantTabs)[0],
  ) => {
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
          color: isActive ? accentColor : isHovered ? "#cfd1d6" : "#7d808a",
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
      style={{ background: "#141519", borderBottom: "1px solid #2b2d34" }}
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
            color: "#cfd1d6",
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.13)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ece9e2";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLButtonElement).style.color = "#cfd1d6";
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
            background: accent.badgeBg,
            color: accentColor,
            border: `1px solid ${accent.badgeBorder}`,
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
                    background: "#2b2d34",
                    margin: "0 8px",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: 10,
                  color: "#3a3d45",
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
