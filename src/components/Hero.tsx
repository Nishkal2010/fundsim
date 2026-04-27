import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const competitors = [
  {
    name: "Wall Street Prep",
    price: "$499–$1,497",
    interactive: false,
    depth: "IB + PE only. No VC. Videos + PDFs.",
  },
  {
    name: "Breaking Into Wall Street",
    price: "$497–$1,497",
    interactive: false,
    depth: "IB-focused. Very thin on VC. Passive video.",
  },
  {
    name: "CFI",
    price: "$497/yr",
    interactive: false,
    depth: "Generalist. No PE/VC simulation depth.",
  },
  {
    name: "SimCap",
    price: "Gated / invite",
    interactive: true,
    depth: "VC only. No PE or IB. Not self-serve.",
  },
  {
    name: "Textbooks / Excel",
    price: "$80–$200",
    interactive: false,
    depth: "Static. No feedback. High skill barrier.",
  },
];

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart: _onStart }: HeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center px-6 py-14"
      style={{
        background: "linear-gradient(180deg, #0A0F1C 0%, #0D1424 100%)",
      }}
    >
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(239,68,68,0.08)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <XCircle size={11} />
            THE HONEST COMPARISON
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#F9FAFB] leading-tight mb-3">
            Why pay $1,499 for a course{" "}
            <span style={{ color: "#818CF8", fontStyle: "italic" }}>
              when you can simulate the deal?
            </span>
          </h2>
          <p className="text-sm text-[#6B7280] max-w-xl mx-auto">
            Every competitor teaches you <em>about</em> finance. FundSim makes
            you <em>do</em> it.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #1F2937" }}
        >
          {/* Table header */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              background: "#0D1220",
              borderBottom: "1px solid #1F2937",
              padding: "12px 20px",
            }}
          >
            {[
              "Platform",
              "Price",
              "PE+VC+IB",
              "Live Models",
              "Qual. Scores",
              "Free",
            ].map((h, i) => (
              <span
                key={h}
                className={`text-xs font-semibold uppercase tracking-wide ${i > 0 ? "text-center" : ""}`}
                style={{ color: "#4B5563" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Competitor rows */}
          {competitors.map((c, i) => (
            <div
              key={c.name}
              className="grid items-center"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                padding: "14px 20px",
                background: i % 2 === 0 ? "#0A0F1C" : "rgba(17,24,39,0.5)",
                borderBottom: "1px solid rgba(31,41,55,0.6)",
              }}
            >
              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "#9CA3AF" }}
                >
                  {c.name}
                </span>
                <span
                  className="block text-[11px] mt-0.5"
                  style={{ color: "#4B5563" }}
                >
                  {c.depth}
                </span>
              </div>
              <span
                className="text-xs text-center font-mono"
                style={{ color: "#6B7280" }}
              >
                {c.price}
              </span>
              <div className="flex justify-center">
                <XCircle size={15} color="#EF4444" />
              </div>
              <div className="flex justify-center">
                {c.interactive ? (
                  <CheckCircle size={15} color="#34D399" />
                ) : (
                  <XCircle size={15} color="#EF4444" />
                )}
              </div>
              <div className="flex justify-center">
                <XCircle size={15} color="#EF4444" />
              </div>
              <div className="flex justify-center">
                <XCircle size={15} color="#EF4444" />
              </div>
            </div>
          ))}

          {/* FundSim row */}
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              padding: "16px 20px",
              background: "rgba(99,102,241,0.08)",
              borderTop: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="7" fill="#0D1220" />
                <rect x="7" y="19" width="4" height="7" rx="1" fill="#6366F1" />
                <rect
                  x="14"
                  y="13"
                  width="4"
                  height="13"
                  rx="1"
                  fill="#818CF8"
                />
                <rect
                  x="21"
                  y="7"
                  width="4"
                  height="19"
                  rx="1"
                  fill="#A5B4FC"
                />
              </svg>
              <div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "#F9FAFB" }}
                >
                  FundSim
                </span>
                <span
                  className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#818CF8",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  YOU ARE HERE
                </span>
                <span
                  className="block text-[11px] mt-0.5"
                  style={{ color: "#6366F1" }}
                >
                  Live PE + VC + IB — qualitative + quantitative
                </span>
              </div>
            </div>
            <span
              className="text-sm text-center font-bold"
              style={{ color: "#34D399" }}
            >
              $0
            </span>
            <div className="flex justify-center">
              <CheckCircle size={15} color="#34D399" />
            </div>
            <div className="flex justify-center">
              <CheckCircle size={15} color="#34D399" />
            </div>
            <div className="flex justify-center">
              <CheckCircle size={15} color="#34D399" />
            </div>
            <div className="flex justify-center">
              <CheckCircle size={15} color="#34D399" />
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { value: "28+", label: "Interactive modules", color: "#818CF8" },
            {
              value: "3",
              label: "Career tracks: PE, VC, IB",
              color: "#34D399",
            },
            { value: "$0", label: "Cost. Free forever.", color: "#F59E0B" },
          ].map(({ value, label, color }) => (
            <div
              key={label}
              className="text-center py-4 px-3 rounded-xl"
              style={{
                background: "rgba(17,24,39,0.6)",
                border: "1px solid #1F2937",
              }}
            >
              <div
                className="text-2xl font-bold font-serif mb-1"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
