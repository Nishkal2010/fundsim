import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { getDealShare } from "../lib/dealShare";
import type { DealShare } from "../lib/dealShare";

const SIMULATOR_LABELS: Record<string, string> = {
  pe: "Private Equity Fund Model",
  vc: "Venture Capital Model",
  ib: "Investment Banking Model",
};

interface ShareViewProps {
  id: string;
}

export function ShareView({ id }: ShareViewProps) {
  const [deal, setDeal] = useState<DealShare | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDealShare(id).then((d) => {
      setDeal(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F1C" }}>
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0A0F1C" }}>
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-300 text-lg">Deal not found or link has expired.</p>
        <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm underline">
          Go to FundSim →
        </a>
      </div>
    );
  }

  const { summary, simulator } = deal;
  const highlightMetrics = summary.metrics.filter((m) => m.highlight);
  const otherMetrics = summary.metrics.filter((m) => !m.highlight);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0F1C" }}>
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} style={{ color: "#6366F1" }} />
          <span className="font-bold text-white text-lg">FundSim</span>
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Run your own deal
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-2xl"
        >
          {/* Badge */}
          <div className="mb-4">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "#1F2937", color: "#9CA3AF" }}
            >
              {SIMULATOR_LABELS[simulator] ?? "Deal Model"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-1">{summary.title}</h1>
          <p className="text-gray-400 text-sm mb-8">{summary.subtitle}</p>

          {/* Highlight metrics */}
          {highlightMetrics.length > 0 && (
            <div
              className="grid gap-4 mb-6"
              style={{ gridTemplateColumns: `repeat(${Math.min(highlightMetrics.length, 3)}, 1fr)` }}
            >
              {highlightMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-5 text-center"
                  style={{ background: "#111827", border: "1px solid #1F2937" }}
                >
                  <div className="text-3xl font-bold mb-1" style={{ color: "#6366F1" }}>
                    {m.value}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Other metrics */}
          {otherMetrics.length > 0 && (
            <div
              className="rounded-xl p-5 mb-8"
              style={{ background: "#111827", border: "1px solid #1F2937" }}
            >
              <div className="grid grid-cols-2 gap-4">
                {otherMetrics.map((m) => (
                  <div key={m.label} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{m.label}</span>
                    <span className="text-white text-sm font-medium">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <p className="text-gray-300 mb-4 text-sm">
              Run this scenario yourself — adjust assumptions and see how returns change in real time.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Try it on FundSim — free
              <ExternalLink size={14} />
            </a>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Created with FundSim · fundsimulate.com
          </p>
        </motion.div>
      </div>
    </div>
  );
}
