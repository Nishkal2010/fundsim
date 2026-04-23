import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  Briefcase,
  ArrowRight,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";

export type SimulatorId = "pe" | "vc" | "ib";

interface Props {
  onSelect: (sim: SimulatorId) => void;
}

const simulators = [
  {
    id: "pe" as SimulatorId,
    label: "Private Equity",
    sublabel: "Buyout Fund Simulator",
    icon: Building2,
    color: "#818CF8",
    dim: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    hoverBorder: "rgba(129,140,248,0.55)",
    badge: "PE",
    description:
      "Model institutional buyout fund economics end-to-end — from LP capital calls to final distributions. Master leverage, fee drag, waterfall distributions, and what actually drives PE returns.",
    features: [
      "Fund Lifecycle & Management Fee Drag",
      "J-Curve: Capital Deployment & Recovery",
      "Waterfall: European vs American Structure",
      "Performance: DPI / TVPI / Net IRR / PME",
      "LBO Modeling — Debt Schedule & Returns",
      "GP/LP Economics & Carried Interest",
      "Debt Structure: Tranches, DSCR, Covenants",
      "Sector Benchmarks & Value Creation Bridge",
    ],
    stats: ["8 modules", "2/20 fee model", "LBO + Waterfall", "8% hurdle rate"],
    tagline: "KKR · Blackstone · Apollo",
  },
  {
    id: "vc" as SimulatorId,
    label: "Venture Capital",
    sublabel: "Startup Investing Simulator",
    icon: TrendingUp,
    color: "#34D399",
    dim: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    hoverBorder: "rgba(52,211,153,0.55)",
    badge: "VC",
    description:
      "Simulate the full venture investing cycle from first check to exit. Master cap table dilution, SAFE notes, power law portfolio construction, and term sheet mechanics that determine who gets paid.",
    features: [
      "Cap Table — Dilution Across All Rounds",
      "SAFE Notes & Convertible Instruments",
      "Option Pool Shuffle & Anti-Dilution",
      "Portfolio Construction & Power Law Returns",
      "Reserve Strategy & Follow-On Allocation",
      "Term Sheet Provisions — VC vs Founder Impact",
      "Pro-Rata Rights & Liquidation Waterfalls",
      "Exit Scenario Analysis by Stakeholder",
      "Qualitative Scorecard — Payne + Berkus Method",
      "Market Sizing — TAM/SAM/SOM Analysis",
      "Founder DNA Score — Beyond the Numbers",
    ],
    stats: [
      "11 modules",
      "Pre/Post SAFEs",
      "Power law model",
      "Qualitative+Quant",
    ],
    tagline: "Sequoia · a16z · Benchmark",
  },
  {
    id: "ib" as SimulatorId,
    label: "Investment Banking",
    sublabel: "M&A Deal Simulator",
    icon: Briefcase,
    color: "#F59E0B",
    dim: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    hoverBorder: "rgba(245,158,11,0.55)",
    badge: "IB",
    description:
      "Run a real M&A deal from valuation pitch to signed merger agreement. Use four valuation methods, structure the offer, model accretion/dilution with synergies, and score your deal like an IB analyst.",
    features: [
      "DCF — WACC, Terminal Value, Sensitivity",
      "Comparable Companies Analysis",
      "Precedent Transaction Analysis",
      "Football Field Valuation Chart",
      "Offer Structure — Cash / Stock / Mixed",
      "Accretion/Dilution with PPA & Synergies",
      "LBO Credit & Sponsor Returns Analysis",
      "100-Point Deal Score Rubric",
    ],
    stats: ["9 modules", "4 val methods", "8 deal presets", "100-pt score"],
    tagline: "Goldman · Morgan Stanley · JPMorgan",
  },
];

const comparisonCols = [
  {
    label: "vs Textbooks",
    icon: "❌",
    positive: false,
    description: "Static examples that don't let you change assumptions",
  },
  {
    label: "vs SimCap",
    icon: "❌",
    positive: false,
    description:
      "Interview prep for one track. No PE, no IB, no qualitative judgment.",
  },
  {
    label: "FunSim",
    icon: "✅",
    positive: true,
    description:
      "Live models. Real mechanics. Qualitative + quantitative. Three career tracks.",
  },
];

export function SimulatorSelector({ onSelect }: Props) {
  return (
    <div
      className="flex-1 flex flex-col items-center px-6 py-14"
      style={{
        background: "linear-gradient(180deg, #0A0F1C 0%, #0D1424 100%)",
      }}
    >
      {/* Problem Statement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mb-10 text-center"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "#F87171",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <Zap size={11} />
          THE PROBLEM WITH FINANCE EDUCATION
        </div>

        <h2
          className="font-serif text-3xl md:text-4xl mb-4 leading-tight"
          style={{ color: "#F9FAFB" }}
        >
          Most finance students graduate{" "}
          <span style={{ color: "#F87171", fontStyle: "italic" }}>
            unable to do a deal.
          </span>
        </h2>

        <p className="text-base leading-relaxed" style={{ color: "#6B7280" }}>
          They know the vocabulary. They don&apos;t know the math.{" "}
          <span style={{ color: "#9CA3AF" }}>
            FunSim fixes that — quantitatively <em>and</em> qualitatively.
          </span>
        </p>

        <p
          className="mt-4 text-sm italic leading-relaxed max-w-2xl mx-auto"
          style={{ color: "#4B5563" }}
        >
          &ldquo;Finance is one of the most lucrative careers in the world — yet
          there&apos;s no serious way to learn it hands-on before you&apos;re in
          the room. Textbooks teach concepts. Professors describe deals. But
          nothing makes you <em style={{ color: "#818CF8" }}>do</em> the math,
          feel the leverage, and understand what separates winners from losers —
          until now.&rdquo;
        </p>
      </motion.div>

      {/* Differentiation Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-3xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {comparisonCols.map((col) => (
          <div
            key={col.label}
            style={{
              background: col.positive
                ? "rgba(99,102,241,0.08)"
                : "rgba(239,68,68,0.06)",
              border: `1px solid ${
                col.positive ? "rgba(99,102,241,0.25)" : "rgba(239,68,68,0.15)"
              }`,
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{col.icon}</span>
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: col.positive ? "#818CF8" : "#6B7280",
                  letterSpacing: "0.06em",
                }}
              >
                {col.label}
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: col.positive ? "#F9FAFB" : "#9CA3AF" }}
            >
              {col.description}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Section headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
        className="text-center mb-10 max-w-2xl"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
          style={{
            background: "rgba(99,102,241,0.08)",
            color: "#818CF8",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          PROFESSIONAL FINANCE SIMULATORS
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-[#F9FAFB] mb-4 leading-tight">
          Three Careers.
          <br />
          <span style={{ color: "#818CF8", fontStyle: "italic" }}>
            One Platform.
          </span>
        </h1>
        <p className="text-[#6B7280] text-base leading-relaxed">
          Each simulator models a distinct finance career track with real
          mechanics, real formulas, and real depth — the kind that makes
          professionals say{" "}
          <em style={{ color: "#9CA3AF" }}>
            &ldquo;I wish I had this starting out.&rdquo;
          </em>
        </p>
      </motion.div>

      {/* Simulator Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full max-w-6xl">
        {simulators.map((sim, i) => {
          const Icon = sim.icon;
          return (
            <motion.div
              key={sim.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 + i * 0.08 }}
              className="h-full"
            >
              <SimCard sim={sim} onSelect={onSelect} Icon={Icon} />
            </motion.div>
          );
        })}
      </div>

      {/* Social Proof Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col items-center gap-2 mt-10"
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={13} color="#34D399" />
          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
            Qualitative + Quantitative — the only simulator that scores both
          </p>
        </div>
        <p className="text-xs" style={{ color: "#374151" }}>
          Used by students at finance programs worldwide &middot; Covers PE
          &middot; VC &middot; IB &middot; DECA &middot; YIS competitions
        </p>
      </motion.div>
    </div>
  );
}

function SimCard({
  sim,
  onSelect,
  Icon,
}: {
  sim: (typeof simulators)[0];
  onSelect: (id: SimulatorId) => void;
  Icon: React.FC<{ size?: number; color?: string }>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(sim.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#111827" : "#0D1220",
        border: `1px solid ${hovered ? sim.hoverBorder : sim.border}`,
        borderRadius: "14px",
        padding: "24px",
        cursor: "pointer",
        transition:
          "border-color 0.2s ease, background 0.2s ease, transform 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
          style={{ background: sim.dim, border: `1px solid ${sim.border}` }}
        >
          <Icon size={20} color={sim.color} />
        </div>
        <div>
          <div
            className="font-serif text-xl leading-tight"
            style={{ color: "#F9FAFB" }}
          >
            {sim.label}
          </div>
          <div
            className="text-xs font-bold mt-0.5"
            style={{
              color: sim.color,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {sim.sublabel}
          </div>
        </div>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{
            background: sim.dim,
            color: sim.color,
            border: `1px solid ${sim.border}`,
            fontFamily: "monospace",
          }}
        >
          {sim.badge}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#9CA3AF" }}>
        {sim.description}
      </p>

      {/* Features */}
      <div className="flex-1 mb-5 space-y-0">
        {sim.features.map((f) => (
          <div
            key={f}
            className="flex items-center gap-2.5 py-1.5"
            style={{ borderBottom: "1px solid rgba(31,41,55,0.8)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: sim.color, opacity: 0.7 }}
            />
            <span className="text-xs" style={{ color: "#D1D5DB" }}>
              {f}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {sim.stats.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: sim.dim,
              color: sim.color,
              border: `1px solid ${sim.border}`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <div className="text-xs mb-4" style={{ color: "#4B5563" }}>
        Used at: {sim.tagline}
      </div>

      {/* CTA */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-lg"
        style={{
          background: hovered ? sim.dim : "rgba(255,255,255,0.02)",
          border: `1px solid ${hovered ? sim.border : "rgba(255,255,255,0.05)"}`,
          transition: "all 0.18s ease",
        }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: hovered ? sim.color : "#6B7280" }}
        >
          Enter {sim.badge} Simulator
        </span>
        <ArrowRight size={15} color={hovered ? sim.color : "#4B5563"} />
      </div>
    </div>
  );
}
