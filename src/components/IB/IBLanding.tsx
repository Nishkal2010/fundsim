import React from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

const features = [
  {
    number: "01",
    title: "Multi-Method Valuation",
    desc: "Run DCF, comparable company analysis, precedent transactions, and LBO — then see all methods in a football field chart.",
  },
  {
    number: "02",
    title: "Offer & Structure",
    desc: "Set the premium, choose cash vs. stock vs. mixed financing, and see the exchange ratio and deal value update instantly.",
  },
  {
    number: "03",
    title: "Accretion / Dilution",
    desc: "Model the pro forma EPS impact with synergies, D&A step-up, and interest costs — know if your deal is accretive on day one.",
  },
  {
    number: "04",
    title: "100-Point Deal Score",
    desc: "Get scored on premium, leverage, synergy achievability, accretion, and strategic rationale — the exact IB analyst rubric.",
  },
];

const stats = [
  { value: "4", label: "Valuation Methods" },
  { value: "3", label: "Preset Deals" },
  { value: "100", label: "Point Rubric" },
  { value: "40+", label: "Glossary Terms" },
];

const A = {
  primary: "#B45309",
  light: "#F59E0B",
  dim: "rgba(245,158,11,0.12)",
  border: "rgba(245,158,11,0.28)",
  glow: "rgba(245,158,11,0.32)",
};

export function IBLanding({ onStart }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="font-serif leading-none tracking-tight"
              style={{ fontSize: "20px", color: "#F9FAFB" }}
            >
              FundSim
            </span>
            <span style={{ color: "#4B5563" }}>/</span>
            <span
              className="text-xs font-bold tracking-widest px-2 py-1 rounded"
              style={{
                background: A.dim,
                color: A.light,
                border: `1px solid ${A.border}`,
                fontFamily: "monospace",
              }}
            >
              IB SIM
            </span>
          </div>
          <span className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Investment Banking Deal Simulator
          </span>
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
          }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          style={{
            color: "#9CA3AF",
            textDecoration: "none",
            background: "rgba(55,65,81,0.5)",
            border: "1px solid #374151",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#F9FAFB";
            (e.currentTarget as HTMLAnchorElement).style.background = "#374151";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#9CA3AF";
            (e.currentTarget as HTMLAnchorElement).style.background =
              "rgba(55,65,81,0.5)";
          }}
        >
          ← Back to FundSim
        </a>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl w-full"
        >
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{
                background: A.dim,
                color: A.light,
                border: `1px solid ${A.border}`,
                letterSpacing: "0.06em",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: A.light }}
              />
              INVESTMENT BANKING · M&A DEAL SIMULATOR
            </span>
          </div>

          <h1
            className="font-serif leading-tight mb-5"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
              color: "#F9FAFB",
            }}
          >
            Model a Real{" "}
            <span style={{ color: A.light, fontStyle: "italic" }}>
              M&A Deal
            </span>{" "}
            Like a Banker
          </h1>

          <p
            className="text-lg mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#9CA3AF" }}
          >
            Run DCF, comps, and precedent transaction analysis. Structure the
            offer. Model accretion/dilution. Score your deal on a 100-point
            rubric used in IB recruiting and finance competitions.
          </p>

          <p className="text-sm mb-10" style={{ color: "#6B7280" }}>
            DCF &nbsp;·&nbsp; Comparable Companies &nbsp;·&nbsp; Precedent
            Transactions &nbsp;·&nbsp; LBO &nbsp;·&nbsp; Football Field Chart
          </p>

          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base"
            style={{
              background: `linear-gradient(135deg, ${A.primary}, ${A.light})`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 0 40px ${A.glow}`,
              letterSpacing: "0.01em",
            }}
          >
            Open IB Simulator
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex items-center gap-8 mt-14"
          style={{
            padding: "1.125rem 2.5rem",
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "1rem",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {stats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <div
                  className="w-px self-stretch"
                  style={{ background: "#374151" }}
                />
              )}
              <div className="text-center">
                <div
                  className="font-serif text-2xl font-bold"
                  style={{ color: A.light }}
                >
                  {s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="grid grid-cols-2 gap-4 mt-12 max-w-2xl w-full"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl text-left"
              style={{ background: "#111827", border: "1px solid #374151" }}
            >
              <div
                className="text-xs font-bold mb-3"
                style={{
                  color: A.light,
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                }}
              >
                {f.number}
              </div>
              <div
                className="font-semibold text-sm mb-2"
                style={{ color: "#F9FAFB" }}
              >
                {f.title}
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: "#6B7280" }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs mt-14"
          style={{ color: "#4B5563" }}
        >
          Covers all IB interview topics: DCF · Comps · Precedents · LBO ·
          Accretion/Dilution · Deal Structuring · Synergies
        </motion.p>
      </div>
    </div>
  );
}
