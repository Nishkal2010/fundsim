import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Sigma,
} from "lucide-react";
import { isFlagEnabled } from "../lib/flags";

export type SimulatorId = "pe" | "vc" | "ib" | "quant";

interface Props {
  onSelect: (sim: SimulatorId) => void;
}

const simulators = [
  {
    id: "pe" as SimulatorId,
    label: "Private Equity",
    sublabel: "Buyout Fund Simulator",
    icon: Building2,
    color: "#d9be7a",
    dim: "rgba(198, 161, 75,0.08)",
    border: "rgba(198, 161, 75,0.25)",
    hoverBorder: "rgba(217, 190, 122,0.55)",
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
    color: "#4bcb98",
    dim: "rgba(31, 169, 113,0.08)",
    border: "rgba(31, 169, 113,0.25)",
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
    color: "#e8913a",
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
  {
    id: "quant" as SimulatorId,
    label: "Quantitative Finance",
    sublabel: "Quant Trading & Research",
    icon: Sigma,
    color: "#5b9dff",
    dim: "rgba(91,157,255,0.08)",
    border: "rgba(91,157,255,0.25)",
    hoverBorder: "rgba(91,157,255,0.55)",
    badge: "QT",
    description:
      "Step onto the quant desk. Simulate random price paths, price options with Black-Scholes and the Greeks, optimize portfolios on the efficient frontier, measure tail risk with VaR, and backtest systematic strategies — the interview-grade math behind Citadel, Jane Street, and Two Sigma.",
    features: [
      "Random Walks — GBM, Jump-Diffusion, Mean Reversion",
      "Monte Carlo Engine with Antithetic Variates",
      "Black-Scholes-Merton Pricing & Implied Vol",
      "The Greeks — Delta, Gamma, Vega, Theta, Rho",
      "Binomial Trees & Path-Dependent Options",
      "Markowitz Efficient Frontier & Max-Sharpe",
      "Risk Desk — VaR, CVaR, Drawdown, EWMA Vol",
      "Fixed Income — Duration, Convexity, YTM",
      "Strategy Backtester — Momentum & Mean Reversion",
      "Quant Interview Drills — Probability & Pricing",
    ],
    stats: ["11 modules", "Black-Scholes", "Monte Carlo", "VaR + Greeks"],
    tagline: "Citadel · Jane Street · Two Sigma",
  },
];

export function SimulatorSelector({ onSelect }: Props) {
  return (
    <div
      className="flex-1 flex flex-col items-center px-6 pt-8 pb-14"
      style={{
        background: "linear-gradient(180deg, #0c0d10 0%, #0D1424 100%)",
      }}
    >
      {/* Tight headline — direct CTA, no marketing duplication.
          The Hero comparison table above already establishes the "why";
          this section is purely the picker. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center mb-8 max-w-2xl"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{
            background: "rgba(198, 161, 75,0.08)",
            color: "#d9be7a",
            border: "1px solid rgba(198, 161, 75,0.2)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          PICK YOUR TRACK
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-[#ece9e2] leading-tight">
          Three careers.{" "}
          <span style={{ color: "#d9be7a", fontStyle: "italic" }}>
            One platform.
          </span>
        </h1>
      </motion.div>

      {/* Simulator Cards — the Quant track is flag-gated so it ships dark. */}
      <div
        className={`grid grid-cols-1 gap-5 w-full ${
          isFlagEnabled("quant")
            ? "lg:grid-cols-2 xl:grid-cols-4 max-w-7xl"
            : "lg:grid-cols-3 max-w-6xl"
        }`}
      >
        {simulators
          .filter((sim) => sim.id !== "quant" || isFlagEnabled("quant"))
          .map((sim, i) => {
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
          <CheckCircle size={13} color="#4bcb98" />
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Qualitative + Quantitative — the only simulator that scores both
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Used by students at finance programs worldwide &middot; Built for PE
          &middot; VC &middot; IB — plus DECA &amp; YIS competition prep
        </p>
      </motion.div>
    </div>
  );
}

const MOBILE_VISIBLE_FEATURES = 4;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
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
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const isMobile = useIsMobile();

  const hiddenCount = sim.features.length - MOBILE_VISIBLE_FEATURES;
  const featuresId = `${sim.id}-features`;

  // Option B: on mobile the expand <button> is visible inside this card, so
  // we must not also have role="button" on the card — interactive descendants
  // of interactive elements break screen reader virtual cursor (ARIA 1.2 §6.6.1).
  // On desktop (≥640px) the expand button is CSS-hidden (sm:hidden), so the
  // card can safely carry its interactive role.
  const expandVisible = isMobile && hiddenCount > 0;

  return (
    <div
      role={expandVisible ? undefined : "button"}
      tabIndex={expandVisible ? undefined : 0}
      aria-label={expandVisible ? undefined : `Open ${sim.label} simulator`}
      onClick={() => onSelect(sim.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(sim.id);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#141519" : "#0e1014",
        border: `1px solid ${hovered ? sim.hoverBorder : sim.border}`,
        borderRadius: "14px",
        cursor: "pointer",
        transition:
          "border-color 0.2s ease, background 0.2s ease, transform 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      className="p-4 sm:p-6"
    >
      {/* Header — badge uses flex-shrink-0 + min-w-0 on the middle column to prevent wrapping */}
      <div className="flex items-start gap-3 mb-4 min-w-0">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
          style={{ background: sim.dim, border: `1px solid ${sim.border}` }}
        >
          <Icon size={20} color={sim.color} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="font-serif text-xl leading-tight"
            style={{ color: "#ece9e2" }}
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
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap"
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
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#a6a8b0" }}>
        {sim.description}
      </p>

      {/* Features — on mobile show first 4, rest behind expand trigger */}
      <div className="flex-1 mb-5 space-y-0">
        <div id={featuresId} aria-live="polite">
          {sim.features.map((f, idx) => {
            const hiddenOnMobile = idx >= MOBILE_VISIBLE_FEATURES;
            return (
              <div
                key={f}
                className={`flex items-center gap-2.5 py-1.5 ${hiddenOnMobile ? (featuresExpanded ? "" : "hidden sm:flex") : ""}`}
                style={{ borderBottom: "1px solid rgba(31,41,55,0.8)" }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: sim.color, opacity: 0.7 }}
                />
                <span className="text-xs" style={{ color: "#cfd1d6" }}>
                  {f}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expand/collapse trigger — only visible on mobile when there are hidden items.
            Safe here because when this button is visible, the parent div has no
            role="button" (expandVisible gates both). */}
        {hiddenCount > 0 && (
          <button
            type="button"
            className="sm:hidden flex items-center gap-1.5 py-1.5 w-full text-left"
            style={{ borderBottom: "1px solid rgba(31,41,55,0.8)" }}
            aria-expanded={featuresExpanded}
            aria-controls={featuresId}
            onClick={(e) => {
              e.stopPropagation();
              setFeaturesExpanded((v) => !v);
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: sim.color, opacity: 0.4 }}
            />
            <span className="text-xs font-medium" style={{ color: sim.color }}>
              {featuresExpanded
                ? "Show less"
                : `+ ${hiddenCount} more feature${hiddenCount > 1 ? "s" : ""}`}
            </span>
          </button>
        )}
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

      {/* Tagline — line-clamp-2 wraps to 2 lines; title omitted (invisible on touch) */}
      <div className="text-xs mb-4 line-clamp-2" style={{ color: "#3a3d45" }}>
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
          style={{ color: hovered ? sim.color : "#7d808a" }}
        >
          Enter {sim.badge} Simulator
        </span>
        <ArrowRight size={15} color={hovered ? sim.color : "#3a3d45"} />
      </div>
    </div>
  );
}
