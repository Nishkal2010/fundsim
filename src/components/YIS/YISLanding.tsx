import React from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

const features = [
  {
    number: "01",
    title: "Rubric-Aware",
    desc: "Breaks down all 100 points so you know exactly where judges award and where teams lose points.",
  },
  {
    number: "02",
    title: "DCF Calculator",
    desc: "Interactive discounted cash flow model with terminal value — the exact tool YIS expects in your report.",
  },
  {
    number: "03",
    title: "Report Sections Guide",
    desc: "All 7 mandatory sections with judge tips, common mistakes, and what separates winners from average submissions.",
  },
  {
    number: "04",
    title: "Q&A Prep",
    desc: "Every standard judge question from Goldman Sachs, Bloomberg, and J.P. Morgan panels — with coaching on how to answer.",
  },
];

const stats = [
  { value: "100", label: "Points Rubric" },
  { value: "7", label: "Report Sections" },
  { value: "400+", label: "Teams Compete" },
  { value: "$5K", label: "First Prize" },
];

export function YISLanding({ onStart }: Props) {
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
        <div className="flex items-center gap-3">
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
                  background: "rgba(34,197,94,0.15)",
                  color: "#4ADE80",
                  border: "1px solid rgba(34,197,94,0.3)",
                  fontFamily: "monospace",
                }}
              >
                YIS SUITE
              </span>
            </div>
            <span className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              2025–26 Competition Guidelines
            </span>
          </div>
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
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#4ADE80",
                border: "1px solid rgba(34,197,94,0.25)",
                letterSpacing: "0.06em",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#4ADE80" }}
              />
              YIS GLOBAL STOCK PITCH · 2025–26
            </span>
          </div>

          <h1
            className="font-serif leading-tight mb-5"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
              color: "#F9FAFB",
            }}
          >
            Win the{" "}
            <span style={{ color: "#4ADE80", fontStyle: "italic" }}>
              World's Top High School
            </span>{" "}
            Stock Pitch Competition
          </h1>

          <p
            className="text-lg mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#9CA3AF" }}
          >
            The complete preparation suite for the YIS Global Stock Pitch —
            rubric breakdown, DCF calculator, report guide, and Q&A prep from
            Wall Street judge panels.
          </p>

          <p className="text-sm mb-10" style={{ color: "#6B7280" }}>
            Rubric-aware &nbsp;·&nbsp; DCF Tool &nbsp;·&nbsp; 7-Section Guide
            &nbsp;·&nbsp; Q&A Coaching
          </p>

          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base"
            style={{
              background: "linear-gradient(135deg, #16A34A, #22C55E)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(34,197,94,0.35)",
              letterSpacing: "0.01em",
            }}
          >
            Open YIS Suite
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
                  style={{ color: "#4ADE80" }}
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
                  color: "#4ADE80",
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

        {/* Competition highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 max-w-3xl w-full"
        >
          <p
            className="text-xs font-semibold tracking-widest mb-5 text-center"
            style={{ color: "#4B5563" }}
          >
            SPONSORED BY
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Bloomberg",
              "Goldman Sachs",
              "J.P. Morgan",
              "PIMCO",
              "Oaktree Capital",
            ].map((sponsor) => (
              <div
                key={sponsor}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "#111827",
                  border: "1px solid #374151",
                  color: "#9CA3AF",
                }}
              >
                {sponsor}
              </div>
            ))}
          </div>
          <p className="text-xs mt-6" style={{ color: "#4B5563" }}>
            Submission deadline:{" "}
            <span style={{ color: "#9CA3AF" }}>
              February 20, 2026 · 11:59 PM PST
            </span>
            &nbsp;·&nbsp; Finals:{" "}
            <span style={{ color: "#9CA3AF" }}>
              May 28–29, 2026 · Cornell Tech, NYC
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
