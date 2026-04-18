import React, { useState, useMemo } from "react";
import { Info, ToggleLeft, ToggleRight } from "lucide-react";
import { Slider } from "../Slider";
import { MetricCard } from "../MetricCard";
import { Tooltip } from "../Tooltip";
import {
  formatMillions,
  formatPercent,
  formatIRR,
} from "../../utils/formatting";

// ── helpers ──────────────────────────────────────────────────────────────────
function calcPreferredReturn(capital: number, rate: number, years: number) {
  return capital * (Math.pow(1 + rate, years) - 1);
}

function calcGrossIRR(moic: number, years: number): number {
  return Math.pow(moic, 1 / years) - 1;
}

function calcNetIRR(
  fundSize: number,
  grossMoic: number,
  holdYears: number,
  mgmtFeePct: number,
  carryPct: number,
  hurdleRate: number,
  european: boolean,
): {
  netMoic: number;
  netIRR: number;
  gpCarry: number;
  gpMgmtFees: number;
  lpNet: number;
} {
  const totalFees = fundSize * mgmtFeePct * holdYears * 0.85; // step-down assumed at harvest
  const netInvested = fundSize - totalFees;
  const grossProceeds = fundSize * grossMoic;
  const netProceeds = grossProceeds - totalFees; // fees already taken from investable cap

  // LP preferred return
  const prefReturn = calcPreferredReturn(fundSize, hurdleRate, holdYears);
  const profit = Math.max(0, netProceeds - fundSize);

  let gpCarry = 0;
  if (european) {
    // European: carry only after all capital + preferred returned
    if (netProceeds > fundSize + prefReturn) {
      const surplusAfterPref = netProceeds - fundSize - prefReturn;
      // GP catch-up to 20% of total profits
      const totalProfit = netProceeds - fundSize;
      const gpCatchUpTarget =
        (carryPct / (1 - carryPct)) *
        (totalProfit * (1 - carryPct) - prefReturn + prefReturn);
      // Simplified: GP gets carryPct of profits above hurdle
      gpCarry = surplusAfterPref * carryPct;
    }
  } else {
    // American: deal-by-deal carry (simplified as % of all profit above hurdle)
    if (profit > prefReturn) {
      gpCarry = (profit - prefReturn) * carryPct;
    }
  }

  const lpNet = netProceeds - gpCarry;
  const lpNetMoic = lpNet / fundSize;
  const lpNetIRR = calcGrossIRR(Math.max(lpNetMoic, 0.01), holdYears);

  return {
    netMoic: lpNetMoic,
    netIRR: lpNetIRR,
    gpCarry,
    gpMgmtFees: totalFees,
    lpNet,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GPLPEconomicsTab() {
  const [fundSize, setFundSize] = useState(500);
  const [grossMoic, setGrossMoic] = useState(2.5);
  const [holdYears, setHoldYears] = useState(5);
  const [mgmtFee, setMgmtFee] = useState(2.0);
  const [carryPct, setCarryPct] = useState(20);
  const [hurdleRate, setHurdleRate] = useState(8);
  const [gpCommitPct, setGpCommitPct] = useState(2);
  const [european, setEuropean] = useState(true);

  const result = useMemo(
    () =>
      calcNetIRR(
        fundSize,
        grossMoic,
        holdYears,
        mgmtFee / 100,
        carryPct / 100,
        hurdleRate / 100,
        european,
      ),
    [fundSize, grossMoic, holdYears, mgmtFee, carryPct, hurdleRate, european],
  );

  const grossIRR = calcGrossIRR(grossMoic, holdYears);
  const gpCommitDollar = fundSize * (gpCommitPct / 100);
  const gpTotalIncome = result.gpCarry + result.gpMgmtFees;
  const gpMgmtFeeROI = gpCommitDollar > 0 ? gpTotalIncome / gpCommitDollar : 0;

  // Fee drag: gross vs net MOIC
  const feeDragMoic = grossMoic - result.netMoic;

  // Carry scenarios
  const carryScenarios = [1.5, 2.0, 2.5, 3.0, 3.5].map((moic) => {
    const r = calcNetIRR(
      fundSize,
      moic,
      holdYears,
      mgmtFee / 100,
      carryPct / 100,
      hurdleRate / 100,
      european,
    );
    return { moic, carry: r.gpCarry, lpNet: r.lpNet, netMoic: r.netMoic };
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Explainer */}
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
          <strong style={{ color: "#818CF8" }}>GP/LP Economics</strong> — The{" "}
          <Tooltip
            term="2 and 20"
            definition="The standard PE/VC fee structure: 2% annual management fee on committed capital + 20% carried interest on profits above the hurdle rate"
          >
            "2 and 20"
          </Tooltip>{" "}
          fee model means the GP earns a <strong>management fee</strong>{" "}
          (typically 2% p.a.) regardless of performance, plus{" "}
          <strong>carried interest</strong> (20% of profits) above the{" "}
          <Tooltip
            term="Hurdle Rate"
            definition="The minimum annualized return (typically 8%) LPs must receive before the GP earns any carry. Also called the preferred return."
          >
            hurdle rate
          </Tooltip>
          . The{" "}
          <Tooltip
            term="European Waterfall"
            definition="The entire fund must return invested capital + preferred return to ALL LPs before any carry is paid. Protects LPs from paying carry on early exits when later deals may fail."
          >
            European waterfall
          </Tooltip>{" "}
          requires the whole fund to clear the hurdle before any carry — the{" "}
          <Tooltip
            term="American Waterfall"
            definition="Carry is calculated deal-by-deal as each investment exits. GPs get paid faster but LPs face clawback risk if later deals underperform."
          >
            American waterfall
          </Tooltip>{" "}
          pays carry deal-by-deal, creating{" "}
          <Tooltip
            term="Clawback"
            definition="If a GP receives carry on early profitable exits but the overall fund underperforms, LPs can 'claw back' overpaid carry. More common with American waterfalls."
          >
            clawback risk
          </Tooltip>
          .
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
            Fund Parameters
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <Slider
              label="Fund Size"
              value={fundSize}
              min={50}
              max={5000}
              step={50}
              format={(v) => formatMillions(v)}
              onChange={setFundSize}
            />
            <Slider
              label="Gross MOIC Target"
              value={grossMoic}
              min={1.0}
              max={5.0}
              step={0.1}
              format={(v) => `${v.toFixed(1)}x`}
              onChange={setGrossMoic}
            />
            <Slider
              label="Hold Period"
              value={holdYears}
              min={3}
              max={12}
              step={1}
              format={(v) => `${v} yr`}
              onChange={setHoldYears}
            />
            <Slider
              label="GP Commit %"
              value={gpCommitPct}
              min={1}
              max={5}
              step={0.5}
              format={(v) => `${v.toFixed(1)}%`}
              onChange={setGpCommitPct}
            />
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
            Fee Structure
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <Slider
              label="Mgmt Fee % / yr"
              value={mgmtFee}
              min={0.5}
              max={3}
              step={0.25}
              format={(v) => `${v.toFixed(2)}%`}
              onChange={setMgmtFee}
            />
            <Slider
              label="Carry %"
              value={carryPct}
              min={10}
              max={30}
              step={5}
              format={(v) => `${v.toFixed(0)}%`}
              onChange={setCarryPct}
            />
            <Slider
              label="Hurdle Rate"
              value={hurdleRate}
              min={5}
              max={12}
              step={0.5}
              format={(v) => `${v.toFixed(1)}%`}
              onChange={setHurdleRate}
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">
                Waterfall Type
              </label>
              <button
                onClick={() => setEuropean(!european)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: european
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(245,158,11,0.15)",
                  color: european ? "#818CF8" : "#F59E0B",
                  border: `1px solid ${european ? "rgba(99,102,241,0.4)" : "rgba(245,158,11,0.4)"}`,
                  cursor: "pointer",
                }}
              >
                {european ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
                {european ? "European" : "American"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gross IRR"
          value={formatIRR(grossIRR)}
          status="positive"
          description={`${grossMoic.toFixed(1)}x over ${holdYears} years`}
        />
        <MetricCard
          label="Net IRR (LP)"
          value={formatIRR(result.netIRR)}
          status={
            result.netIRR > 0.15
              ? "positive"
              : result.netIRR > 0.1
                ? "neutral"
                : "negative"
          }
          description={`After fees & carry`}
        />
        <MetricCard
          label="Net MOIC (LP)"
          value={`${result.netMoic.toFixed(2)}x`}
          status={
            result.netMoic >= 2
              ? "positive"
              : result.netMoic >= 1.5
                ? "neutral"
                : "negative"
          }
          description="Net of all GP economics"
        />
        <MetricCard
          label="Fee Drag"
          value={`${feeDragMoic.toFixed(2)}x`}
          status="negative"
          description="Gross minus net MOIC lost to fees"
        />
      </div>

      {/* GP Income Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
            GP Economics
          </h3>
          <p className="text-xs text-[#6B7280] mb-4">
            How the GP makes money on a {formatMillions(fundSize)} fund
          </p>
          <div className="space-y-3">
            {[
              {
                label: "Management Fees (total)",
                value: result.gpMgmtFees,
                color: "#F59E0B",
                note: `${mgmtFee}% × ${formatMillions(fundSize)} × ${holdYears} yrs (with step-down)`,
              },
              {
                label: "Carried Interest",
                value: result.gpCarry,
                color: "#34D399",
                note: `${carryPct}% of profits above ${hurdleRate}% hurdle (${european ? "European" : "American"})`,
              },
              {
                label: "GP Co-invest Returns",
                value: gpCommitDollar * grossMoic - gpCommitDollar,
                color: "#818CF8",
                note: `${formatMillions(gpCommitDollar)} commit at ${grossMoic.toFixed(1)}x gross`,
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <div>
                    <span style={{ color: item.color, fontWeight: 600 }}>
                      {item.label}
                    </span>
                    <div style={{ color: "#4B5563", marginTop: 1 }}>
                      {item.note}
                    </div>
                  </div>
                  <span style={{ color: item.color, fontWeight: 700 }}>
                    {formatMillions(item.value)}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-1.5"
                  style={{ background: "#1F2937" }}
                >
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (item.value / gpTotalIncome) * 100)}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[#374151] flex justify-between text-sm font-bold">
              <span style={{ color: "#F9FAFB" }}>Total GP Income</span>
              <span style={{ color: "#34D399" }}>
                {formatMillions(gpTotalIncome)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#6B7280" }}>
                GP ROI on {formatMillions(gpCommitDollar)} commit
              </span>
              <span style={{ color: "#818CF8" }}>
                {gpMgmtFeeROI.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
            LP Distribution Waterfall
          </h3>
          <p className="text-xs text-[#6B7280] mb-4">
            {european ? "European (whole-fund)" : "American (deal-by-deal)"}{" "}
            waterfall
          </p>

          {/* Waterfall Steps */}
          {[
            {
              step: "1",
              label: "Return of Capital",
              amount: fundSize,
              color: "#374151",
              note: "LPs get committed capital back first",
              cumulative: fundSize,
            },
            {
              step: "2",
              label: `Preferred Return (${hurdleRate}% p.a.)`,
              amount: calcPreferredReturn(
                fundSize,
                hurdleRate / 100,
                holdYears,
              ),
              color: "#818CF8",
              note: `${hurdleRate}% × ${holdYears} yrs compounded on ${formatMillions(fundSize)}`,
              cumulative: 0,
            },
            {
              step: "3",
              label: "GP Catch-Up (20% of profits)",
              amount: result.gpCarry * 0.25,
              color: "#F59E0B",
              note: "GP receives ~20% of total profits via catch-up",
              cumulative: 0,
            },
            {
              step: "4",
              label: `Residual Split (80% LP / ${carryPct}% GP)`,
              amount: result.gpCarry * 0.75,
              color: "#34D399",
              note: "Remaining profits split per carry agreement",
              cumulative: 0,
            },
          ].map((w) => (
            <div
              key={w.step}
              className="flex items-start gap-3 py-2.5"
              style={{ borderBottom: "1px solid #1F2937" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                style={{ background: w.color, color: "#0A0F1C" }}
              >
                {w.step}
              </div>
              <div className="flex-1">
                <div
                  className="text-xs font-semibold"
                  style={{ color: "#F9FAFB" }}
                >
                  {w.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
                  {w.note}
                </div>
              </div>
              <div className="text-xs font-bold" style={{ color: w.color }}>
                {formatMillions(w.amount)}
              </div>
            </div>
          ))}

          <div
            className="mt-4 p-3 rounded-lg text-xs space-y-1"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <div className="flex justify-between">
              <span style={{ color: "#6B7280" }}>LP Net Proceeds</span>
              <span style={{ color: "#34D399", fontWeight: 700 }}>
                {formatMillions(result.lpNet)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6B7280" }}>LP Net MOIC</span>
              <span style={{ color: "#818CF8", fontWeight: 700 }}>
                {result.netMoic.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6B7280" }}>LP Net IRR</span>
              <span style={{ color: "#818CF8", fontWeight: 700 }}>
                {formatIRR(result.netIRR)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carry Sensitivity */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Carry vs Fund Return — Sensitivity
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          How GP carry and LP net returns change across exit scenarios —{" "}
          {european ? "European waterfall" : "American waterfall"},{" "}
          {formatMillions(fundSize)} fund
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                {[
                  "Gross MOIC",
                  "Gross Proceeds",
                  "GP Mgmt Fees",
                  "GP Carry",
                  "LP Net Proceeds",
                  "LP Net MOIC",
                  "LP Net IRR",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-right first:text-left"
                    style={{
                      color: "#6B7280",
                      fontWeight: 600,
                      paddingRight: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carryScenarios.map((row) => {
                const grossProceeds = fundSize * row.moic;
                const netIRR = calcGrossIRR(
                  Math.max(row.netMoic, 0.001),
                  holdYears,
                );
                const isTarget = Math.abs(row.moic - grossMoic) < 0.01;
                return (
                  <tr
                    key={row.moic}
                    style={{
                      borderBottom: "1px solid #1F2937",
                      background: isTarget
                        ? "rgba(99,102,241,0.06)"
                        : "transparent",
                    }}
                  >
                    <td
                      className="py-2 text-left font-semibold"
                      style={{
                        color: row.moic >= 2.5 ? "#34D399" : "#D1D5DB",
                        paddingRight: 12,
                      }}
                    >
                      {row.moic.toFixed(1)}x {isTarget && "◀"}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#9CA3AF", paddingRight: 12 }}
                    >
                      {formatMillions(grossProceeds)}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#F87171", paddingRight: 12 }}
                    >
                      {formatMillions(result.gpMgmtFees)}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#F59E0B", paddingRight: 12 }}
                    >
                      {formatMillions(row.carry)}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#34D399", paddingRight: 12 }}
                    >
                      {formatMillions(row.lpNet)}
                    </td>
                    <td
                      className="py-2 text-right font-bold"
                      style={{
                        color:
                          row.netMoic >= 2
                            ? "#34D399"
                            : row.netMoic >= 1.5
                              ? "#818CF8"
                              : "#F87171",
                        paddingRight: 12,
                      }}
                    >
                      {row.netMoic.toFixed(2)}x
                    </td>
                    <td
                      className="py-2 text-right font-bold"
                      style={{
                        color:
                          netIRR > 0.15
                            ? "#34D399"
                            : netIRR > 0.1
                              ? "#818CF8"
                              : "#F87171",
                        paddingRight: 12,
                      }}
                    >
                      {formatIRR(netIRR)}
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
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <strong style={{ color: "#818CF8" }}>Industry benchmark:</strong>
          <span style={{ color: "#6B7280" }}>
            {" "}
            Top-quartile PE funds target 2.5–3.5x gross MOIC / 20–25% gross IRR.
            After fees, LPs in top-quartile funds historically earn ~15–18% net
            IRR. Management fees alone typically reduce MOIC by 0.2–0.4x on a
            10-year fund.
          </span>
        </div>
      </div>

      {/* Clawback Section */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Clawback Provision
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Relevant primarily for American waterfall — the GP's obligation to
          return overpaid carry
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "What triggers it?",
              text: "When early investments exit profitably, the GP earns carry. If later investments in the same fund fail, the GP may have been overpaid carry on the whole-fund basis.",
              color: "#F59E0B",
            },
            {
              label: "How is it calculated?",
              text: "At fund liquidation: compare total carry paid vs what the GP would have earned on a whole-fund European waterfall basis. The difference is the clawback amount.",
              color: "#818CF8",
            },
            {
              label: "How do LPs protect themselves?",
              text: "Many LPAs require GPs to escrow 20–30% of carry payments in a segregated account. Others require personal guarantees from GP principals. European waterfall eliminates the issue entirely.",
              color: "#34D399",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-lg"
              style={{
                background: "#0A0F1C",
                border: `1px solid ${item.color}20`,
              }}
            >
              <div
                className="text-xs font-bold mb-2"
                style={{ color: item.color }}
              >
                {item.label}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#9CA3AF" }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
