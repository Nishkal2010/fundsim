import React, { useEffect, useState } from "react";
import { X, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { captureEvent } from "../../lib/posthog";

interface LeaderboardRow {
  id: string;
  created_at: string;
  simulator: "pe" | "vc" | "ib";
  tab: string;
  summary: {
    title: string;
    subtitle: string;
    metrics: Array<{ label: string; value: string; highlight?: boolean }>;
  };
  // computed after fetch
  keyMetricLabel: string;
  keyMetricValue: string;
  numericValue: number;
}

const TAB_LABELS: Record<string, string> = {
  "pe/lifecycle": "PE Fund Lifecycle",
  "pe/waterfall": "Distribution Waterfall",
  "pe/lbo": "LBO Model",
  "pe/jcurve": "J-Curve",
  "vc/captable": "Cap Table",
  "vc/safenotes": "SAFE Notes",
  "vc/safe": "SAFE Notes",
  "vc/termsheet": "Term Sheet",
  "ib/dcf": "DCF",
  "ib/main": "IB Deal",
  "pe/challenge": "Deal Challenge",
};

function tabLabel(simulator: string, tab: string): string {
  const key = `${simulator}/${tab}`;
  if (TAB_LABELS[key]) return TAB_LABELS[key];
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}

function parseNumeric(value: string): number {
  // Take the part before any "/" so a quiz score like "5/5" parses to 5, not
  // 55 (the regex strip alone would concatenate both digits and fraudulently
  // rank the row at the top of a board it shares with deal metrics).
  const cleaned = value.split("/")[0].replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SIM_COLORS: Record<string, { bg: string; text: string; border: string }> =
  {
    pe: {
      bg: "rgba(99,102,241,0.15)",
      text: "#818CF8",
      border: "rgba(99,102,241,0.3)",
    },
    vc: {
      bg: "rgba(168,85,247,0.15)",
      text: "#C084FC",
      border: "rgba(168,85,247,0.3)",
    },
    ib: {
      bg: "rgba(16,185,129,0.15)",
      text: "#34D399",
      border: "rgba(16,185,129,0.3)",
    },
  };

const RANK_STYLES: Record<number, { color: string; label: string }> = {
  1: { color: "#F59E0B", label: "1st" },
  2: { color: "#9CA3AF", label: "2nd" },
  3: { color: "#B45309", label: "3rd" },
};

function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid #1F2937" }}
    >
      <div className="w-6 h-4 rounded" style={{ background: "#374151" }} />
      <div className="flex-1 h-4 rounded" style={{ background: "#374151" }} />
      <div className="w-24 h-4 rounded" style={{ background: "#374151" }} />
      <div className="w-16 h-4 rounded" style={{ background: "#374151" }} />
    </div>
  );
}

export function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("deal_shares")
        .select("id, created_at, simulator, tab, summary")
        .gt(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const processed: LeaderboardRow[] = data.map((row) => {
        const metrics: Array<{
          label: string;
          value: string;
          highlight?: boolean;
        }> = Array.isArray(row.summary?.metrics) ? row.summary.metrics : [];
        const highlight = metrics.find((m) => m.highlight) ?? metrics[0];
        return {
          ...row,
          keyMetricLabel: highlight?.label ?? "",
          keyMetricValue: highlight?.value ?? "",
          numericValue: parseNumeric(highlight?.value ?? "0"),
        };
      });

      processed.sort((a, b) => b.numericValue - a.numericValue);

      setRows(processed.slice(0, 25));
      captureEvent("leaderboard_viewed", { count: processed.length });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          width: "100%",
          maxWidth: 680,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #1E293B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={18} color="#F59E0B" />
            <span style={{ color: "#F9FAFB", fontWeight: 600, fontSize: 16 }}>
              Weekly Leaderboard
            </span>
            <span style={{ color: "#6B7280", fontSize: 12 }}>
              Rolling 7 days
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 160px 80px",
            padding: "8px 20px",
            borderBottom: "1px solid #1E293B",
            color: "#6B7280",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>#</span>
          <span>Deal Type</span>
          <span>Key Metric</span>
          <span style={{ textAlign: "right" }}>When</span>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {!loading && rows.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "48px 20px",
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              <Trophy size={36} color="#374151" />
              <span>No deals shared this week yet — be the first!</span>
            </div>
          )}

          {!loading &&
            rows.map((row, idx) => {
              const rank = idx + 1;
              const rankStyle = RANK_STYLES[rank];
              const simColor = SIM_COLORS[row.simulator] ?? SIM_COLORS.pe;

              return (
                <div
                  key={row.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 160px 80px",
                    alignItems: "center",
                    padding: "10px 20px",
                    borderBottom: "1px solid #1E293B",
                    background:
                      rank <= 3 ? "rgba(245,158,11,0.03)" : "transparent",
                  }}
                >
                  {/* Rank */}
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: rank <= 3 ? 14 : 13,
                      color: rankStyle?.color ?? "#4B5563",
                      fontFamily: "monospace",
                    }}
                  >
                    {rankStyle?.label ?? `${rank}`}
                  </span>

                  {/* Deal type */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: simColor.bg,
                        color: simColor.text,
                        border: `1px solid ${simColor.border}`,
                        textTransform: "uppercase",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.simulator}
                    </span>
                    <span style={{ color: "#D1D5DB", fontSize: 13 }}>
                      {tabLabel(row.simulator, row.tab)}
                    </span>
                  </div>

                  {/* Key metric */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <span
                      style={{
                        color: "#F9FAFB",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {row.keyMetricValue}
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 11 }}>
                      {row.keyMetricLabel}
                    </span>
                  </div>

                  {/* Time */}
                  <span
                    style={{
                      color: "#6B7280",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    {timeAgo(row.created_at)}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #1E293B",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <a
            href="/#pe"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              color: "#818CF8",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <Trophy size={13} />
            Share Your Deal
          </a>
        </div>
      </div>
    </div>
  );
}
