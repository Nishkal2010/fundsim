import React, { useState, useMemo } from "react";
import { Info, ToggleLeft, ToggleRight } from "lucide-react";
import { Slider } from "../Slider";
import { MetricCard } from "../MetricCard";
import { Tooltip } from "../Tooltip";
import {
  calculateVCCapTable,
  DEFAULT_VC_ROUNDS,
  DEFAULT_VC_FOUNDER_SHARES,
  DEFAULT_ESOP_FOUNDING_PCT,
} from "../../utils/vcRound";
import { formatMillions, formatPercent } from "../../utils/formatting";
import type { VCRoundInput } from "../../types/fund";

const ROUND_COLORS = ["#818CF8", "#34D399", "#F59E0B", "#F87171", "#A78BFA"];
const FOUNDER_COLOR = "#6EE7B7";
const ESOP_COLOR = "#374151";

export function VCTab() {
  const [founderShares, setFounderShares] = useState(DEFAULT_VC_FOUNDER_SHARES);
  const [foundingESOPPct, setFoundingESOPPct] = useState(
    DEFAULT_ESOP_FOUNDING_PCT,
  );
  const [rounds, setRounds] = useState<VCRoundInput[]>(DEFAULT_VC_ROUNDS);

  const result = useMemo(
    () => calculateVCCapTable({ founderShares, foundingESOPPct, rounds }),
    [founderShares, foundingESOPPct, rounds],
  );

  const setRound = <K extends keyof VCRoundInput>(
    idx: number,
    key: K,
    val: VCRoundInput[K],
  ) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)),
    );
  };

  const enabledRounds = rounds.filter((r) => r.enabled);
  const snapshots = result.rounds;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Educational callout */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.2)",
        }}
      >
        <Info
          size={16}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "#A78BFA" }}
        />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          <strong style={{ color: "#A78BFA" }}>VC Cap Table</strong> models how
          founder ownership is diluted across financing rounds. Each round
          issues new shares at a{" "}
          <Tooltip
            term="Price Per Share"
            definition="Pre-money valuation ÷ fully diluted shares before the round. Determines how many new shares are issued for a given investment amount"
          >
            price per share
          </Tooltip>{" "}
          based on pre-money valuation. The{" "}
          <Tooltip
            term="Option Pool Shuffle"
            definition="When investors require an option pool top-up before their investment, it comes out of pre-money value and dilutes founders more than it appears"
          >
            option pool shuffle
          </Tooltip>{" "}
          means new ESOP shares are issued pre-investment, diluting existing
          shareholders. At exit,{" "}
          <Tooltip
            term="Liquidation Preference"
            definition="Investors receive their invested capital back (1x) or a multiple (2x) before common stockholders get anything"
          >
            liquidation preferences
          </Tooltip>{" "}
          determine who gets paid first.
        </div>
      </div>

      {/* Founding Parameters */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
          Founding Structure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Slider
            label="Founder Shares"
            value={founderShares / 1_000_000}
            min={1}
            max={20}
            step={0.5}
            format={(v) => `${v.toFixed(1)}M`}
            onChange={(v) => setFounderShares(Math.round(v * 1_000_000))}
          />
          <Slider
            label="Founding ESOP Pool"
            value={foundingESOPPct * 100}
            min={0}
            max={20}
            step={1}
            format={(v) => `${v.toFixed(0)}%`}
            onChange={(v) => setFoundingESOPPct(v / 100)}
          />
        </div>
      </div>

      {/* Round Configuration */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
          Financing Rounds
        </h3>
        <div className="space-y-4">
          {rounds.map((round, idx) => (
            <div
              key={idx}
              className="rounded-lg p-4"
              style={{
                background: round.enabled ? "#0A0F1C" : "#1F2937",
                border: `1px solid ${round.enabled ? ROUND_COLORS[idx % ROUND_COLORS.length] + "40" : "#374151"}`,
                opacity: round.enabled ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      background:
                        ROUND_COLORS[idx % ROUND_COLORS.length] + "20",
                      color: ROUND_COLORS[idx % ROUND_COLORS.length],
                    }}
                  >
                    {round.name}
                  </span>
                  {round.enabled &&
                    snapshots[
                      enabledRounds.findIndex((r) => r.name === round.name)
                    ] && (
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        Post: {formatMillions(round.preMoney + round.raise)} ·
                        Price: $
                        {snapshots[
                          enabledRounds.findIndex((r) => r.name === round.name)
                        ]?.pricePerShare.toFixed(3)}
                        /sh
                      </span>
                    )}
                </div>
                <button
                  onClick={() => setRound(idx, "enabled", !round.enabled)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: round.enabled ? "#34D399" : "#4B5563",
                  }}
                >
                  {round.enabled ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                </button>
              </div>
              {round.enabled && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Slider
                    label="Pre-Money"
                    value={round.preMoney}
                    min={1}
                    max={2000}
                    step={1}
                    format={(v) => formatMillions(v)}
                    onChange={(v) => setRound(idx, "preMoney", v)}
                  />
                  <Slider
                    label="New Raise"
                    value={round.raise}
                    min={0.5}
                    max={500}
                    step={0.5}
                    format={(v) => formatMillions(v)}
                    onChange={(v) => setRound(idx, "raise", v)}
                  />
                  <Slider
                    label="ESOP Top-Up"
                    value={round.optionPoolTopUp * 100}
                    min={0}
                    max={15}
                    step={1}
                    format={(v) => `${v.toFixed(0)}%`}
                    onChange={(v) => setRound(idx, "optionPoolTopUp", v / 100)}
                  />
                  <Slider
                    label="Liq. Pref"
                    value={round.liquidationPref}
                    min={1}
                    max={3}
                    step={0.5}
                    format={(v) => `${v.toFixed(1)}x`}
                    onChange={(v) => setRound(idx, "liquidationPref", v)}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">
                      Structure
                    </label>
                    <button
                      onClick={() =>
                        setRound(idx, "participating", !round.participating)
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-left"
                      style={{
                        background: round.participating
                          ? "rgba(245,158,11,0.15)"
                          : "#1F2937",
                        color: round.participating ? "#F59E0B" : "#6B7280",
                        border: `1px solid ${round.participating ? "rgba(245,158,11,0.3)" : "#374151"}`,
                        cursor: "pointer",
                      }}
                    >
                      {round.participating
                        ? "Participating"
                        : "Non-Participating"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Founder Ownership"
          value={formatPercent(result.currentFounderOwnershipPct)}
          status={
            result.currentFounderOwnershipPct > 0.3
              ? "positive"
              : result.currentFounderOwnershipPct > 0.15
                ? "neutral"
                : "negative"
          }
          description="Fully diluted after all rounds"
        />
        <MetricCard
          label="ESOP Pool"
          value={formatPercent(result.currentESOPPct)}
          status={result.currentESOPPct >= 0.1 ? "positive" : "neutral"}
          description="Employee option pool"
        />
        <MetricCard
          label="Total Raised"
          value={formatMillions(result.currentTotalRaised)}
          status="neutral"
          description={`${enabledRounds.length} financing rounds`}
        />
        <MetricCard
          label="Fully Diluted Shares"
          value={`${(result.fullyDilutedShares / 1_000_000).toFixed(2)}M`}
          status="neutral"
          description="All issued shares"
        />
      </div>

      {/* Dilution Chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Ownership Dilution Over Rounds
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Stacked ownership % at each financing round
        </p>
        <div className="flex items-end gap-4">
          {/* Founding state */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full flex flex-col rounded-lg overflow-hidden"
              style={{ height: 160 }}
            >
              <div style={{ flex: foundingESOPPct, background: ESOP_COLOR }} />
              <div
                style={{ flex: 1 - foundingESOPPct, background: FOUNDER_COLOR }}
              />
            </div>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              Founding
            </span>
          </div>
          {/* After each round */}
          {snapshots.map((snap, idx) => {
            const color = ROUND_COLORS[idx % ROUND_COLORS.length];
            // Stacked heights for all investors up to this round
            const prevInvestorsBar = snap.prevInvestorsPct;
            const newBar = snap.newInvestorPct;
            return (
              <div
                key={snap.roundName}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div
                  className="w-full flex flex-col rounded-lg overflow-hidden relative"
                  style={{ height: 160 }}
                >
                  {/* ESOP */}
                  <div style={{ flex: snap.esopPct, background: ESOP_COLOR }} />
                  {/* New investor */}
                  <div style={{ flex: newBar, background: color }} />
                  {/* Previous investors */}
                  <div
                    style={{
                      flex: prevInvestorsBar,
                      background: "rgba(99,102,241,0.4)",
                    }}
                  />
                  {/* Founder */}
                  <div
                    style={{
                      flex: snap.founderOwnershipPct,
                      background: FOUNDER_COLOR,
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {snap.roundName}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: FOUNDER_COLOR }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: FOUNDER_COLOR,
                borderRadius: 2,
                display: "inline-block",
              }}
            />{" "}
            Founders
          </span>
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "#6B7280" }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: ESOP_COLOR,
                borderRadius: 2,
                display: "inline-block",
              }}
            />{" "}
            ESOP
          </span>
          {snapshots.map((snap, idx) => (
            <span
              key={snap.roundName}
              className="flex items-center gap-1 text-xs"
              style={{ color: ROUND_COLORS[idx % ROUND_COLORS.length] }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: ROUND_COLORS[idx % ROUND_COLORS.length],
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              {snap.roundName}
            </span>
          ))}
        </div>
      </div>

      {/* Cap Table Snapshot */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
          Cap Table Snapshots
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                {[
                  "Round",
                  "Pre-Money",
                  "Raise",
                  "Post-Money",
                  "Price/Share",
                  "New Shares",
                  "ESOP Shares",
                  "Founder %",
                  "New Investor %",
                  "Cumul. Raised",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-right first:text-left"
                    style={{
                      color: "#6B7280",
                      fontWeight: 600,
                      paddingRight: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap, idx) => (
                <tr
                  key={snap.roundName}
                  style={{ borderBottom: "1px solid #1F2937" }}
                >
                  <td
                    className="py-2 text-left"
                    style={{
                      color: ROUND_COLORS[idx % ROUND_COLORS.length],
                      fontWeight: 600,
                      paddingRight: 10,
                    }}
                  >
                    {snap.roundName}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#D1D5DB", paddingRight: 10 }}
                  >
                    {formatMillions(snap.preMoneyValuation)}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#34D399", paddingRight: 10 }}
                  >
                    {formatMillions(snap.newInvestment)}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#D1D5DB", paddingRight: 10 }}
                  >
                    {formatMillions(snap.postMoneyValuation)}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#9CA3AF", paddingRight: 10 }}
                  >
                    ${snap.pricePerShare.toFixed(3)}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#9CA3AF", paddingRight: 10 }}
                  >
                    {(snap.newSharesIssued / 1000).toFixed(0)}K
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: ESOP_COLOR, paddingRight: 10 }}
                  >
                    {snap.optionSharesIssued > 0
                      ? `${(snap.optionSharesIssued / 1000).toFixed(0)}K`
                      : "—"}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: FOUNDER_COLOR, paddingRight: 10 }}
                  >
                    {(snap.founderOwnershipPct * 100).toFixed(1)}%
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{
                      color: ROUND_COLORS[idx % ROUND_COLORS.length],
                      paddingRight: 10,
                    }}
                  >
                    {(snap.newInvestorPct * 100).toFixed(1)}%
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#6B7280", paddingRight: 10 }}
                  >
                    {formatMillions(snap.cumulativeRaised)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exit Scenario Analysis */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Exit Scenario Analysis
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Proceeds to each stakeholder at various exit valuations — total
          raised: {formatMillions(result.currentTotalRaised)} · liquidation
          preferences apply
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <th
                  className="pb-2 text-left"
                  style={{
                    color: "#6B7280",
                    fontWeight: 600,
                    paddingRight: 10,
                  }}
                >
                  Exit Val.
                </th>
                <th
                  className="pb-2 text-right"
                  style={{
                    color: FOUNDER_COLOR,
                    fontWeight: 600,
                    paddingRight: 10,
                  }}
                >
                  Founder $
                </th>
                <th
                  className="pb-2 text-right"
                  style={{
                    color: "#6B7280",
                    fontWeight: 600,
                    paddingRight: 10,
                  }}
                >
                  ESOP $
                </th>
                {snapshots.map((snap, idx) => (
                  <th
                    key={snap.roundName}
                    className="pb-2 text-right"
                    style={{
                      color: ROUND_COLORS[idx % ROUND_COLORS.length],
                      fontWeight: 600,
                      paddingRight: 10,
                    }}
                  >
                    {snap.roundName} $
                  </th>
                ))}
                {snapshots.map((snap, idx) => (
                  <th
                    key={`moic-${snap.roundName}`}
                    className="pb-2 text-right"
                    style={{
                      color: ROUND_COLORS[idx % ROUND_COLORS.length],
                      fontWeight: 600,
                      paddingRight: 10,
                    }}
                  >
                    {snap.roundName} MOIC
                  </th>
                ))}
                <th
                  className="pb-2 text-right"
                  style={{
                    color: "#9CA3AF",
                    fontWeight: 600,
                    paddingRight: 10,
                  }}
                >
                  Total Inv. $
                </th>
              </tr>
            </thead>
            <tbody>
              {result.exitScenarios.map((scenario) => {
                const isGood =
                  scenario.exitValuation >= result.currentTotalRaised * 3;
                return (
                  <tr
                    key={scenario.exitValuation}
                    style={{ borderBottom: "1px solid #1F2937" }}
                  >
                    <td
                      className="py-2 text-left font-semibold"
                      style={{
                        color: isGood ? "#34D399" : "#D1D5DB",
                        paddingRight: 10,
                      }}
                    >
                      {scenario.label}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: FOUNDER_COLOR, paddingRight: 10 }}
                    >
                      {formatMillions(scenario.founderProceeds)}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#6B7280", paddingRight: 10 }}
                    >
                      {formatMillions(scenario.esopProceeds)}
                    </td>
                    {snapshots.map((snap, idx) => {
                      const inv = scenario.investorsByRound.find(
                        (r) => r.round === snap.roundName,
                      );
                      return (
                        <td
                          key={snap.roundName}
                          className="py-2 text-right"
                          style={{
                            color: ROUND_COLORS[idx % ROUND_COLORS.length],
                            paddingRight: 10,
                          }}
                        >
                          {inv ? formatMillions(inv.proceeds) : "—"}
                        </td>
                      );
                    })}
                    {snapshots.map((snap) => {
                      const inv = scenario.investorsByRound.find(
                        (r) => r.round === snap.roundName,
                      );
                      const moic = inv?.moic ?? 0;
                      return (
                        <td
                          key={`moic-${snap.roundName}`}
                          className="py-2 text-right"
                          style={{
                            color:
                              moic >= 3
                                ? "#34D399"
                                : moic >= 1
                                  ? "#818CF8"
                                  : "#F87171",
                            fontWeight: 600,
                            paddingRight: 10,
                          }}
                        >
                          {moic.toFixed(2)}x
                        </td>
                      );
                    })}
                    <td
                      className="py-2 text-right font-semibold"
                      style={{ color: "#9CA3AF", paddingRight: 10 }}
                    >
                      {formatMillions(scenario.totalInvestorProceeds)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="mt-3 p-3 rounded-lg text-xs"
          style={{
            background: "rgba(167,139,250,0.06)",
            border: "1px solid rgba(167,139,250,0.15)",
          }}
        >
          <strong style={{ color: "#A78BFA" }}>Note:</strong>
          <span style={{ color: "#6B7280" }}>
            {" "}
            Non-participating investors choose max(liquidation preference,
            pro-rata share of total exit). Participating investors receive their
            preference + pro-rata share of remainder.
          </span>
        </div>
      </div>
    </div>
  );
}
