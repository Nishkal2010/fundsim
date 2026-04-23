import React, { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Slider } from "../Slider";
import { MetricCard } from "../MetricCard";
import { Tooltip } from "../Tooltip";
import { formatMillions } from "../../utils/formatting";

interface Tranche {
  id: string;
  name: string;
  abbrev: string;
  color: string;
  sizeMult: number; // x EBITDA
  rate: number; // % per year
  maturity: number; // years
  amortPct: number; // % mandatory amort per year
  seniority: number; // 1 = most senior
  description: string;
  typical: string;
}

const DEFAULT_TRANCHES: Tranche[] = [
  {
    id: "rcf",
    name: "Revolving Credit Facility",
    abbrev: "RCF",
    color: "#374151",
    sizeMult: 0.5,
    rate: 6.5,
    maturity: 5,
    amortPct: 0,
    seniority: 0,
    description: "Undrawn liquidity buffer — typically undrawn at close",
    typical: "SOFR + 250-350bps, 5-year",
  },
  {
    id: "tla",
    name: "Term Loan A (Institutional)",
    abbrev: "TLA",
    color: "#818CF8",
    sizeMult: 3.0,
    rate: 7.0,
    maturity: 7,
    amortPct: 5,
    seniority: 1,
    description:
      "Senior secured first-lien term loan — most common PE debt tranche",
    typical: "SOFR + 300-450bps, 7-year, 1% amort",
  },
  {
    id: "sl",
    name: "Second Lien / Unitranche",
    abbrev: "2L",
    color: "#A78BFA",
    sizeMult: 1.5,
    rate: 10.5,
    maturity: 8,
    amortPct: 0,
    seniority: 2,
    description:
      "Junior secured — takes second priority in bankruptcy, higher spread",
    typical: "SOFR + 600-800bps, 8-year",
  },
  {
    id: "mezz",
    name: "Mezzanine / Subordinated",
    abbrev: "MEZZ",
    color: "#F59E0B",
    sizeMult: 1.0,
    rate: 13.0,
    maturity: 10,
    amortPct: 0,
    seniority: 3,
    description:
      "Subordinated debt with equity-like returns — often PIK toggle or warrants",
    typical: "12-15% cash/PIK, 10-year",
  },
];

function calcDSCR(
  ebitda: number,
  totalDebt: number,
  avgRate: number,
  amortPct: number,
): number {
  const annualInterest = totalDebt * avgRate;
  const annualAmort = totalDebt * amortPct;
  return ebitda / (annualInterest + annualAmort);
}

function calcInterestCoverage(ebitda: number, totalInterest: number): number {
  return ebitda / totalInterest;
}

export function DebtStructureTab() {
  const [ebitda, setEbitda] = useState(100);
  const [entryMultiple, setEntryMultiple] = useState(12);
  const [equityPct, setEquityPct] = useState(40);
  const [tranches, setTranches] = useState<Tranche[]>(DEFAULT_TRANCHES);
  const setTranche = <K extends keyof Tranche>(
    id: string,
    key: K,
    val: Tranche[K],
  ) => {
    setTranches((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: val } : t)),
    );
  };

  const enterpriseValue = ebitda * entryMultiple;
  const equityValue = enterpriseValue * (equityPct / 100);
  const totalDebt = enterpriseValue - equityValue;

  const result = useMemo(() => {
    const activeTranches = tranches.filter((t) => t.id !== "rcf");

    const sized = activeTranches.map((t) => ({
      ...t,
      dollars: t.sizeMult * ebitda,
      leverageMult: t.sizeMult,
    }));

    const totalInterest = sized.reduce(
      (sum, t) => sum + t.dollars * (t.rate / 100),
      0,
    );
    const totalAmort = sized.reduce(
      (sum, t) => sum + t.dollars * (t.amortPct / 100),
      0,
    );
    const weightedRate = totalDebt > 0 ? totalInterest / totalDebt : 0;
    const dscr = calcDSCR(
      ebitda,
      totalDebt,
      weightedRate,
      totalAmort / totalDebt,
    );
    const coverage = calcInterestCoverage(ebitda, totalInterest);

    return { sized, totalInterest, totalAmort, weightedRate, dscr, coverage };
  }, [tranches, ebitda, totalDebt]);

  const leverageMultiple = totalDebt / ebitda;

  // Debt capacity by leverage multiple
  const debtCapacityScenarios = [4, 5, 6, 7, 8].map((mult) => {
    const debt = mult * ebitda;
    const interest = debt * result.weightedRate;
    const dscr = ebitda / (interest + result.totalAmort);
    const coverage = ebitda / interest;
    return { mult, debt, interest, dscr, coverage };
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Explainer */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
        }}
      >
        <Info
          size={16}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "#F59E0B" }}
        />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          <strong style={{ color: "#F59E0B" }}>Debt Structure</strong> — PE
          firms use a{" "}
          <Tooltip
            term="Capital Stack"
            definition="The layered structure of financing: equity at the bottom (most risk, most upside), then mezz, second lien, and senior secured debt at the top (least risk, first paid in bankruptcy)."
          >
            capital stack
          </Tooltip>{" "}
          with multiple debt tranches. Each tranche has different{" "}
          <Tooltip
            term="Seniority"
            definition="Priority of repayment in bankruptcy. Senior secured lenders get paid first from asset proceeds, subordinated lenders get the remainder."
          >
            seniority
          </Tooltip>
          , spread, and structure. The{" "}
          <Tooltip
            term="DSCR"
            definition="Debt Service Coverage Ratio: EBITDA / (annual interest + mandatory principal payments). Lenders typically require DSCR ≥ 1.1–1.2x at close."
          >
            DSCR
          </Tooltip>{" "}
          and{" "}
          <Tooltip
            term="Interest Coverage Ratio"
            definition="EBITDA / annual interest expense. Lenders typically require 1.5–2.0x minimum coverage. Below 1.0x means the company cannot service its interest from operations."
          >
            interest coverage
          </Tooltip>{" "}
          determine whether lenders will lend, and covenants police ongoing
          health. Higher leverage = higher equity IRR but higher default risk.
        </div>
      </div>

      {/* Top Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">
            Transaction Parameters
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <Slider
              label="EBITDA"
              value={ebitda}
              min={10}
              max={1000}
              step={5}
              format={(v) => formatMillions(v)}
              onChange={setEbitda}
            />
            <Slider
              label="Entry EV/EBITDA"
              value={entryMultiple}
              min={5}
              max={25}
              step={0.5}
              format={(v) => `${v.toFixed(1)}x`}
              onChange={setEntryMultiple}
            />
            <Slider
              label="Equity Contribution"
              value={equityPct}
              min={20}
              max={60}
              step={5}
              format={(v) => `${v.toFixed(0)}%`}
              onChange={setEquityPct}
            />
            <div className="flex flex-col gap-1">
              <div className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">
                Enterprise Value
              </div>
              <div className="text-lg font-bold" style={{ color: "#818CF8" }}>
                {formatMillions(enterpriseValue)}
              </div>
              <div className="text-xs" style={{ color: "#4B5563" }}>
                {entryMultiple.toFixed(1)}x × {formatMillions(ebitda)}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-3">
            Sources & Uses
          </h3>
          <div className="space-y-2 text-xs">
            <div className="font-bold text-[#9CA3AF] uppercase tracking-wide pb-1 border-b border-[#374151]">
              USES
            </div>
            {[
              {
                label: "Purchase Price (EV)",
                value: enterpriseValue,
                color: "#F9FAFB",
              },
              {
                label: "Transaction Fees (~1.5%)",
                value: enterpriseValue * 0.015,
                color: "#F87171",
              },
              {
                label: "OID & Financing Fees (~1%)",
                value: totalDebt * 0.01,
                color: "#F87171",
              },
              {
                label: "Total Uses",
                value:
                  enterpriseValue + enterpriseValue * 0.015 + totalDebt * 0.01,
                color: "#34D399",
                bold: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-0.5"
                style={{ borderBottom: "1px solid #1F2937" }}
              >
                <span style={{ color: "#6B7280" }}>{row.label}</span>
                <span
                  style={{
                    color: row.color,
                    fontWeight: (row as { bold?: boolean }).bold ? 700 : 500,
                  }}
                >
                  {formatMillions(row.value)}
                </span>
              </div>
            ))}
            <div className="font-bold text-[#9CA3AF] uppercase tracking-wide pt-2 pb-1 border-b border-[#374151]">
              SOURCES
            </div>
            {[
              { label: "Sponsor Equity", value: equityValue, color: "#818CF8" },
              {
                label: "Senior Debt (TLA)",
                value: tranches.find((t) => t.id === "tla")!.sizeMult * ebitda,
                color: "#818CF8",
              },
              {
                label: "Second Lien",
                value: tranches.find((t) => t.id === "sl")!.sizeMult * ebitda,
                color: "#A78BFA",
              },
              {
                label: "Mezzanine",
                value: tranches.find((t) => t.id === "mezz")!.sizeMult * ebitda,
                color: "#F59E0B",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-0.5"
                style={{ borderBottom: "1px solid #1F2937" }}
              >
                <span style={{ color: "#6B7280" }}>{row.label}</span>
                <span style={{ color: row.color }}>
                  {formatMillions(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Leverage"
          value={`${leverageMultiple.toFixed(1)}x`}
          status={
            leverageMultiple <= 5
              ? "positive"
              : leverageMultiple <= 7
                ? "neutral"
                : "negative"
          }
          description="Total Debt / EBITDA"
        />
        <MetricCard
          label="DSCR"
          value={result.dscr.toFixed(2) + "x"}
          status={
            result.dscr >= 1.2
              ? "positive"
              : result.dscr >= 1.0
                ? "neutral"
                : "negative"
          }
          description="EBITDA / (Interest + Amort)"
        />
        <MetricCard
          label="Interest Coverage"
          value={result.coverage.toFixed(1) + "x"}
          status={
            result.coverage >= 2.0
              ? "positive"
              : result.coverage >= 1.5
                ? "neutral"
                : "negative"
          }
          description="EBITDA / Interest Expense"
        />
        <MetricCard
          label="Weighted Avg Rate"
          value={`${(result.weightedRate * 100).toFixed(2)}%`}
          status="neutral"
          description="Blended interest rate on debt"
        />
      </div>

      {/* Tranche Configuration */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Debt Tranche Configuration
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Adjust sizing and pricing for each tranche in the capital stack
        </p>

        {/* Visual stack */}
        <div className="flex items-end gap-2 mb-6 h-32">
          <div className="text-xs text-[#4B5563] mr-2 flex flex-col justify-between h-full py-1">
            <span>Senior</span>
            <span>Junior</span>
          </div>
          {[
            {
              label: "Equity",
              value: equityValue,
              color: "#34D399",
              pct: equityValue / enterpriseValue,
            },
            ...result.sized.map((t) => ({
              label: t.abbrev,
              value: t.dollars,
              color: t.color,
              pct: t.dollars / enterpriseValue,
            })),
          ]
            .reverse()
            .map((item) => (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center justify-end gap-1"
              >
                <div
                  className="w-full rounded-t-md text-center text-xs font-bold flex items-center justify-center"
                  style={{
                    height: `${Math.max(item.pct * 120, 20)}px`,
                    background: item.color,
                    color: "#0A0F1C",
                    opacity: 0.85,
                  }}
                >
                  {item.label}
                </div>
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {formatMillions(item.value)}
                </span>
              </div>
            ))}
        </div>

        {/* Tranche table */}
        {tranches
          .filter((t) => t.id !== "rcf")
          .map((t) => (
            <div
              key={t.id}
              className="rounded-lg p-4 mb-3"
              style={{
                background: "#0A0F1C",
                border: `1px solid ${t.color}30`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded mr-2"
                    style={{ background: t.color + "20", color: t.color }}
                  >
                    {t.abbrev}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#F9FAFB" }}
                  >
                    {t.name}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>
                  {formatMillions(t.sizeMult * ebitda)} ·{" "}
                  {t.sizeMult.toFixed(1)}x EBITDA
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-2">
                <Slider
                  label="Size (x EBITDA)"
                  value={t.sizeMult}
                  min={0.5}
                  max={5}
                  step={0.25}
                  format={(v) => `${v.toFixed(2)}x`}
                  onChange={(v) => setTranche(t.id, "sizeMult", v)}
                />
                <Slider
                  label="Interest Rate"
                  value={t.rate}
                  min={3}
                  max={20}
                  step={0.25}
                  format={(v) => `${v.toFixed(2)}%`}
                  onChange={(v) => setTranche(t.id, "rate", v)}
                />
                <Slider
                  label="Mandatory Amort"
                  value={t.amortPct}
                  min={0}
                  max={15}
                  step={1}
                  format={(v) => `${v.toFixed(0)}%/yr`}
                  onChange={(v) => setTranche(t.id, "amortPct", v)}
                />
              </div>
              <div className="flex gap-4 text-xs" style={{ color: "#4B5563" }}>
                <span>Maturity: {t.maturity}yr</span>
                <span>
                  Annual Interest:{" "}
                  {formatMillions((t.sizeMult * ebitda * t.rate) / 100)}
                </span>
                <span>Typical: {t.typical}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Debt Capacity Analysis */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Debt Capacity Analysis
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Maximum leverage lenders will underwrite — DSCR and coverage
          requirements at different debt loads
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                {[
                  "Leverage",
                  "Total Debt",
                  "Annual Interest",
                  "DSCR",
                  "Coverage",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-right first:text-left"
                    style={{
                      color: "#6B7280",
                      fontWeight: 600,
                      paddingRight: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {debtCapacityScenarios.map((row) => {
                const isTarget = Math.abs(row.mult - leverageMultiple) < 0.5;
                const status =
                  row.dscr >= 1.2 && row.coverage >= 2.0
                    ? "Bankable"
                    : row.dscr >= 1.0 && row.coverage >= 1.5
                      ? "Tight"
                      : "Distressed";
                return (
                  <tr
                    key={row.mult}
                    style={{
                      borderBottom: "1px solid #1F2937",
                      background: isTarget
                        ? "rgba(99,102,241,0.06)"
                        : "transparent",
                    }}
                  >
                    <td
                      className="py-2 text-left font-semibold"
                      style={{ color: "#D1D5DB", paddingRight: 12 }}
                    >
                      {row.mult.toFixed(0)}x {isTarget && "◀"}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#9CA3AF", paddingRight: 12 }}
                    >
                      {formatMillions(row.debt)}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{ color: "#F87171", paddingRight: 12 }}
                    >
                      {formatMillions(row.interest)}
                    </td>
                    <td
                      className="py-2 text-right font-bold"
                      style={{
                        color:
                          row.dscr >= 1.2
                            ? "#34D399"
                            : row.dscr >= 1.0
                              ? "#F59E0B"
                              : "#F87171",
                        paddingRight: 12,
                      }}
                    >
                      {row.dscr.toFixed(2)}x
                    </td>
                    <td
                      className="py-2 text-right font-bold"
                      style={{
                        color:
                          row.coverage >= 2.0
                            ? "#34D399"
                            : row.coverage >= 1.5
                              ? "#F59E0B"
                              : "#F87171",
                        paddingRight: 12,
                      }}
                    >
                      {row.coverage.toFixed(1)}x
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{
                        color:
                          status === "Bankable"
                            ? "#34D399"
                            : status === "Tight"
                              ? "#F59E0B"
                              : "#F87171",
                        paddingRight: 12,
                        fontWeight: 600,
                      }}
                    >
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          {[
            {
              label: "Lender Covenants",
              items: [
                "Net Leverage ≤ agreed maximum (typically 5.5–6.5x)",
                "Interest Coverage ≥ 1.5–2.0x EBITDA",
                "Minimum Liquidity (cash + revolver availability)",
                "Capex limitations in tight periods",
              ],
            },
            {
              label: "Covenant-Lite vs Cov-Heavy",
              items: [
                "Cov-lite: Incurrence test only — breach only on new actions",
                "Cov-heavy: Maintenance tests quarterly — more lender protection",
                "Most PE TLBs post-2015 are cov-lite (lender of record protection)",
                "Second lien / mezz often have tighter covenants",
              ],
            },
            {
              label: "Credit Metrics by Sector",
              items: [
                "Technology: 5–7x leverage, lower spread (covenant lite)",
                "Healthcare: 5–6x leverage, stable cash flows preferred",
                "Consumer: 4–5x leverage, cyclicality risk watched",
                "Industrial: 4–6x leverage, capex intensity matters",
              ],
            },
          ].map((box) => (
            <div
              key={box.label}
              className="p-3 rounded-lg"
              style={{ background: "#0A0F1C", border: "1px solid #1F2937" }}
            >
              <div className="font-bold mb-2" style={{ color: "#F59E0B" }}>
                {box.label}
              </div>
              {box.items.map((item) => (
                <div key={item} className="flex items-start gap-1.5 py-0.5">
                  <span style={{ color: "#374151" }}>·</span>
                  <span style={{ color: "#6B7280" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
