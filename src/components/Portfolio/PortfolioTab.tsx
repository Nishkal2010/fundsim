import React, { useState } from "react";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useFundModel } from "../../hooks/useFundModel";
import { MetricCard } from "../MetricCard";
import { Slider } from "../Slider";
import { Tooltip } from "../Tooltip";
import {
  formatMillions,
  formatPercent,
  formatMultiple,
} from "../../utils/formatting";
import type { PortfolioCompany } from "../../types/fund";

const STATUS_COLORS: Record<
  PortfolioCompany["status"],
  { bg: string; border: string; text: string; label: string }
> = {
  unrealized: {
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.3)",
    text: "#818CF8",
    label: "Unrealized",
  },
  realized: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    text: "#34D399",
    label: "Realized",
  },
  "partial-exit": {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    text: "#FCD34D",
    label: "Partial Exit",
  },
  "written-off": {
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.25)",
    text: "#F87171",
    label: "Written Off",
  },
};

const STRATEGY_LABELS: Record<string, string> = {
  buyout: "Buyout",
  growth: "Growth Equity",
  venture: "Venture Capital",
};

function MOICBadge({ moic }: { moic: number }) {
  const color =
    moic >= 3
      ? "#34D399"
      : moic >= 1.5
        ? "#818CF8"
        : moic >= 1
          ? "#FCD34D"
          : "#F87171";
  const icon =
    moic >= 2 ? (
      <TrendingUp size={10} />
    ) : moic < 0.5 ? (
      <TrendingDown size={10} />
    ) : (
      <Minus size={10} />
    );
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {icon}
      {moic.toFixed(2)}x
    </span>
  );
}

export function PortfolioTab() {
  const { inputs, setInput, portfolio } = useFundModel();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const displayed = selectedSector
    ? portfolio.companies.filter((c) => c.sector === selectedSector)
    : portfolio.companies;

  const maxSectorValue = Math.max(
    ...portfolio.sectorBreakdown.map((s) => s.invested),
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Educational callout */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <Info
          size={16}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "#818CF8" }}
        />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          <strong className="text-[#818CF8]">Portfolio Construction</strong>{" "}
          shows how capital is deployed across deals. The{" "}
          <Tooltip
            term="Power Law"
            definition="In VC/PE, a small number of investments drive the majority of returns — top 20% of deals often generate 80%+ of returns"
          >
            power law
          </Tooltip>{" "}
          means a few winners fund losses on the rest.{" "}
          <Tooltip
            term="Follow-On Reserve"
            definition="Capital held back from initial deployment to support future financing rounds of existing portfolio companies"
          >
            Follow-on reserves
          </Tooltip>{" "}
          protect ownership in breakout companies. Loss ratio and exit multiple
          directly drive{" "}
          <Tooltip
            term="TVPI"
            definition="Total Value to Paid-In — total value (realized + unrealized) divided by capital called"
          >
            TVPI
          </Tooltip>
          .
        </div>
      </div>

      {/* Portfolio Construction Controls */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
          Portfolio Construction Parameters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">
              Fund Strategy
            </label>
            <div className="flex flex-col gap-1.5">
              {(["buyout", "growth", "venture"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setInput("fundStrategy", s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-left"
                  style={{
                    background:
                      inputs.fundStrategy === s
                        ? "rgba(99,102,241,0.2)"
                        : "#1F2937",
                    color: inputs.fundStrategy === s ? "#818CF8" : "#6B7280",
                    border: `1px solid ${inputs.fundStrategy === s ? "rgba(99,102,241,0.4)" : "#374151"}`,
                    cursor: "pointer",
                  }}
                >
                  {STRATEGY_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Number of Deals"
            value={inputs.numDeals}
            min={5}
            max={50}
            step={1}
            format={(v) => `${v} cos`}
            onChange={(v) => setInput("numDeals", v)}
          />
          <Slider
            label="Follow-On Reserve"
            value={inputs.followOnReservePercent * 100}
            min={0}
            max={40}
            step={5}
            format={(v) => `${v.toFixed(0)}%`}
            onChange={(v) => setInput("followOnReservePercent", v / 100)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">
              Vintage Year
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[2018, 2019, 2020, 2021, 2022, 2023].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setInput("vintageYear", yr)}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background:
                      inputs.vintageYear === yr
                        ? "rgba(99,102,241,0.2)"
                        : "#1F2937",
                    color: inputs.vintageYear === yr ? "#818CF8" : "#6B7280",
                    border: `1px solid ${inputs.vintageYear === yr ? "rgba(99,102,241,0.4)" : "#374151"}`,
                    cursor: "pointer",
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gross MOIC"
          value={formatMultiple(portfolio.grossMOIC)}
          status={
            portfolio.grossMOIC >= 2.5
              ? "positive"
              : portfolio.grossMOIC >= 1.5
                ? "neutral"
                : "negative"
          }
          description="Total value / total invested"
        />
        <MetricCard
          label="TVPI"
          value={formatMultiple(portfolio.tvpi)}
          status={
            portfolio.tvpi >= 2
              ? "positive"
              : portfolio.tvpi >= 1.3
                ? "neutral"
                : "negative"
          }
          description={`DPI ${formatMultiple(portfolio.dpi)} + RVPI ${formatMultiple(portfolio.rvpi)}`}
        />
        <MetricCard
          label="Deployed Capital"
          value={formatMillions(portfolio.totalInvested)}
          status="neutral"
          description={`Reserve: ${formatMillions(portfolio.reserveCapital)} undeployed`}
        />
        <MetricCard
          label="Top-3 Concentration"
          value={formatPercent(portfolio.concentrationTop3Pct)}
          status={
            portfolio.concentrationTop3Pct > 0.6
              ? "negative"
              : portfolio.concentrationTop3Pct > 0.4
                ? "neutral"
                : "positive"
          }
          description="% of total value in top 3 positions"
        />
      </div>

      {/* Portfolio Composition + MOIC Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome breakdown */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
            Portfolio Outcomes
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Winners (≥2x)",
                count: portfolio.winnerCount,
                color: "#34D399",
                pct: portfolio.winnerCount / inputs.numDeals,
              },
              {
                label: "Zombies (0.5–1.5x)",
                count: portfolio.zombieCount,
                color: "#FCD34D",
                pct: portfolio.zombieCount / inputs.numDeals,
              },
              {
                label: "Write-offs (<0.5x)",
                count: portfolio.loserCount,
                color: "#F87171",
                pct: portfolio.loserCount / inputs.numDeals,
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: row.color, fontWeight: 600 }}>
                    {row.label}
                  </span>
                  <span style={{ color: "#9CA3AF" }}>
                    {row.count} / {inputs.numDeals} (
                    {(row.pct * 100).toFixed(0)}%)
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ background: "#1F2937" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${row.pct * 100}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* MOIC buckets */}
          <div className="mt-5">
            <div className="text-xs text-[#6B7280] mb-3 font-semibold uppercase tracking-wide">
              MOIC Distribution
            </div>
            <div className="flex items-end gap-1 h-20">
              {portfolio.moicBuckets.map((b) => {
                const maxCount = Math.max(
                  ...portfolio.moicBuckets.map((x) => x.count),
                  1,
                );
                const heightPct = b.count / maxCount;
                const color = b.label.startsWith("5")
                  ? "#34D399"
                  : b.label.startsWith("3")
                    ? "#6EE7B7"
                    : b.label.startsWith("2")
                      ? "#818CF8"
                      : b.label.startsWith("1")
                        ? "#FCD34D"
                        : "#F87171";
                return (
                  <div
                    key={b.label}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span style={{ color: "#6B7280", fontSize: 9 }}>
                      {b.count}
                    </span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(4, heightPct * 56)}px`,
                        background: color,
                        opacity: b.count === 0 ? 0.2 : 1,
                      }}
                    />
                    <span
                      style={{
                        color: "#4B5563",
                        fontSize: 9,
                        textAlign: "center",
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sector breakdown */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
            Sector Breakdown
          </h3>
          <div className="space-y-2.5">
            {portfolio.sectorBreakdown.slice(0, 8).map((s) => {
              const isSelected = selectedSector === s.sector;
              const barWidth =
                maxSectorValue > 0 ? (s.invested / maxSectorValue) * 100 : 0;
              const moic = s.invested > 0 ? s.currentValue / s.invested : 0;
              return (
                <button
                  key={s.sector}
                  onClick={() =>
                    setSelectedSector(isSelected ? null : s.sector)
                  }
                  className="w-full space-y-1 text-left"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <div className="flex justify-between text-xs">
                    <span
                      style={{
                        color: isSelected ? "#818CF8" : "#D1D5DB",
                        fontWeight: isSelected ? 700 : 400,
                      }}
                    >
                      {s.sector}
                    </span>
                    <span style={{ color: "#6B7280" }}>
                      {formatMillions(s.invested)} · <MOICBadge moic={moic} />
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-1.5"
                    style={{ background: "#1F2937" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all duration-400"
                      style={{
                        width: `${barWidth}%`,
                        background: isSelected ? "#6366F1" : "#374151",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          {selectedSector && (
            <div className="mt-3 text-xs" style={{ color: "#818CF8" }}>
              Filtering by <strong>{selectedSector}</strong> — click again to
              clear
            </div>
          )}
        </div>
      </div>

      {/* Company Grid */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#F9FAFB]">
            Portfolio Companies {selectedSector ? `— ${selectedSector}` : ""}
          </h3>
          <div className="flex gap-2">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <span
                key={status}
                className="flex items-center gap-1 text-xs"
                style={{ color: colors.text }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: colors.text,
                    display: "inline-block",
                  }}
                />
                {colors.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayed.map((company) => {
            const sc = STATUS_COLORS[company.status];
            const totalValue = company.currentValue + company.realizedValue;
            return (
              <div
                key={company.id}
                className="rounded-lg p-3 space-y-2"
                style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#F9FAFB" }}
                    >
                      {company.name}
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      {company.sector}
                    </div>
                  </div>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: sc.border,
                      color: sc.text,
                      fontSize: 9,
                    }}
                  >
                    {sc.label}
                  </span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: "#6B7280" }}>Invested</span>
                    <span style={{ color: "#D1D5DB" }}>
                      {formatMillions(company.totalInvested)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#6B7280" }}>Value</span>
                    <span style={{ color: "#D1D5DB" }}>
                      {formatMillions(totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#6B7280" }}>MOIC</span>
                    <MOICBadge moic={company.currentMOIC} />
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#6B7280" }}>
                      Yr {company.investYear}
                    </span>
                    <span style={{ color: "#4B5563" }}>
                      {company.stage.charAt(0).toUpperCase() +
                        company.stage.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reserve utilization */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle size={15} style={{ color: "#FCD34D", marginTop: 2 }} />
          <div>
            <div className="text-sm font-semibold text-[#F9FAFB]">
              Capital Allocation Summary
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              How LP capital is allocated across the fund
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Initial Checks",
              value:
                portfolio.totalInvested -
                portfolio.companies.reduce((s, c) => s + c.followOnCapital, 0),
              color: "#818CF8",
            },
            {
              label: "Follow-Ons",
              value: portfolio.companies.reduce(
                (s, c) => s + c.followOnCapital,
                0,
              ),
              color: "#6EE7B7",
            },
            {
              label: "Undeployed Reserve",
              value: portfolio.reserveCapital,
              color: "#FCD34D",
            },
            {
              label: "Mgmt Fees (est.)",
              value:
                inputs.fundSize * inputs.managementFee * inputs.fundLife * 0.7,
              color: "#F87171",
            },
          ].map((item) => {
            const pct = inputs.fundSize > 0 ? item.value / inputs.fundSize : 0;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#9CA3AF" }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 600 }}>
                    {formatMillions(item.value)}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ background: "#1F2937" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, pct * 100)}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <div className="text-xs" style={{ color: "#4B5563" }}>
                  {(pct * 100).toFixed(1)}% of fund
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
