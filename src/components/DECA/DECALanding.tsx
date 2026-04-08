import React from "react";
import { motion } from "framer-motion";
import { EVENT_CONFIG } from "./config/eventConfig";

interface Props {
  onStart: () => void;
}

const features = [
  {
    number: "01",
    title: "Event-Aware",
    desc: "Only shows the sections your specific DECA event requires. No noise, no guessing what judges expect.",
  },
  {
    number: "02",
    title: "ICDC-Level Depth",
    desc: "Break-even analysis, sensitivity tables, and 3-year projections that separate you from state-level competitors.",
  },
  {
    number: "03",
    title: "Auto-Validates",
    desc: "Catches the 10 most common financial mistakes before judges ever see your paper.",
  },
  {
    number: "04",
    title: "Print-Ready Export",
    desc: "Generates a formatted financial section ready to paste directly into your written paper.",
  },
];

const stats = [
  { value: "9", label: "DECA Events" },
  { value: "14", label: "Financial Sections" },
  { value: "10", label: "Auto-Validations" },
  { value: "100%", label: "Client-Side" },
];

// Pull events from config to stay in sync
const FEATURED_EVENTS = (
  ["EIB", "IBP", "EFB", "EBG", "ESB", "BOR"] as const
).map((code) => EVENT_CONFIG[code]);

export function DECALanding({ onStart }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Header — matches main site Header style */}
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
                  background: "rgba(99,102,241,0.15)",
                  color: "#818CF8",
                  border: "1px solid rgba(99,102,241,0.3)",
                  fontFamily: "monospace",
                }}
              >
                DECA SUITE
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
            transition: "all 0.18s ease",
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
                background: "rgba(99,102,241,0.1)",
                color: "#818CF8",
                border: "1px solid rgba(99,102,241,0.25)",
                letterSpacing: "0.06em",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#818CF8" }}
              />
              DECA FINANCE SUITE · 2025–26
            </span>
          </div>

          {/* Headline — uses serif like main site Hero */}
          <h1
            className="font-serif leading-tight mb-5"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
              color: "#F9FAFB",
            }}
          >
            Stop Losing Points On{" "}
            <span style={{ color: "#818CF8", fontStyle: "italic" }}>
              The Section Worth The Most
            </span>
          </h1>

          <p
            className="text-lg mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#9CA3AF" }}
          >
            Build competition-ready financial statements for every DECA written
            event — in minutes, not hours.
          </p>

          <p className="text-sm mb-10" style={{ color: "#6B7280" }}>
            Event-aware &nbsp;·&nbsp; ICDC-Level &nbsp;·&nbsp; Auto-validates
            &nbsp;·&nbsp; Print-ready
          </p>

          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base"
            style={{
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(99,102,241,0.35)",
              letterSpacing: "0.01em",
            }}
          >
            Build My Financial Section
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
                  style={{ color: "#818CF8" }}
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

        {/* Feature cards — 2x2 grid */}
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
              style={{
                background: "#111827",
                border: "1px solid #374151",
              }}
            >
              <div
                className="text-xs font-bold mb-3"
                style={{
                  color: "#818CF8",
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

        {/* Supported events */}
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
            SUPPORTED EVENTS
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURED_EVENTS.map((evt) => {
              const isWritten = evt.format === "written";
              return (
                <div
                  key={evt.code}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: "#111827",
                    border: "1px solid #374151",
                    color: "#9CA3AF",
                  }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "#818CF8", fontFamily: "monospace" }}
                  >
                    {evt.code}
                  </span>
                  <span>{evt.name}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: isWritten
                        ? "rgba(99,102,241,0.1)"
                        : "rgba(212,175,55,0.12)",
                      color: isWritten ? "#818CF8" : "#d4af37",
                    }}
                  >
                    {isWritten ? "Written" : "Pitch Deck"}
                  </span>
                  <span style={{ color: "#4B5563" }}>·</span>
                  <span style={{ color: "#d4af37", fontFamily: "monospace" }}>
                    {evt.financialPointsWritten}pts
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
