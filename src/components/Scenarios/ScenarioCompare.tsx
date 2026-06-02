import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  computeScenario,
  computeTornado,
  SCENARIOS,
  type ScenarioInputs,
  type ScenarioOutputs,
} from "../../lib/ibScenarios";

// LBO-flavored default tuned to ~15% IRR base case so all three scenarios land
// in interpretable territory. Tgt price chosen so post-premium offer EV ≈ 10x
// EBITDA — typical mid-market LBO entry multiple.
const DEFAULT_BASE: ScenarioInputs = {
  tgtRevenue: 600,
  tgtEBITDA: 150,
  tgtShares: 80,
  tgtPrice: 13,
  tgtNetDebt: 200,
  tgtFCF: 100,
  sector: "industrial",
  dealType: "financial",
  offerPremium: 30,
  revenueGrowth: 6,
  terminalGrowth: 2.5,
  ebitdaMarginPct: 24,
  capexPct: 4,
  taxRate: 25,
  wacc: 11,
  seniorLeverage: 4.5,
  mezzLeverage: 1.5,
  seniorRate: 7.0,
  mezzRate: 11.5,
  holdPeriod: 5,
  exitMultipleOverride: 0,
};

const SECTORS = [
  "tech",
  "healthcare",
  "industrial",
  "consumer",
  "energy",
] as const;

// Compact label/input row — single source of design truth for the inputs form
function InputRow({
  label,
  value,
  onChange,
  suffix,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 0",
      }}
    >
      <span style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          style={{
            width: 80,
            background: "#0A0F1C",
            border: "1px solid #1F2937",
            borderRadius: 4,
            padding: "4px 8px",
            color: "#F9FAFB",
            fontSize: 12,
            textAlign: "right",
          }}
        />
        {suffix && (
          <span style={{ color: "#6B7280", fontSize: 11, width: 12 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}
function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}
function fmtMult(n: number): string {
  return `${n.toFixed(2)}x`;
}

// Compares a scenario value to base with directional color
function deltaPill(
  scenarioVal: number,
  baseVal: number,
  isHigherBetter: boolean,
): React.ReactNode {
  if (baseVal === 0 || !Number.isFinite(baseVal)) return null;
  const diff = scenarioVal - baseVal;
  if (Math.abs(diff) < 0.01) return null;
  const pct = (diff / Math.abs(baseVal)) * 100;
  const positive = diff > 0;
  const good = positive === isHigherBetter;
  return (
    <span
      style={{
        fontSize: 10,
        color: good ? "#10B981" : "#F87171",
        marginLeft: 6,
      }}
    >
      {positive ? "+" : ""}
      {pct.toFixed(0)}%
    </span>
  );
}

function ScenarioCard({
  label,
  description,
  accent,
  outputs,
  baseOutputs,
  isBase,
}: {
  label: string;
  description: string;
  accent: string;
  outputs: ScenarioOutputs;
  baseOutputs: ScenarioOutputs;
  isBase: boolean;
}) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1F2937",
        borderTop: `3px solid ${accent}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#F9FAFB", fontWeight: 700, fontSize: 16 }}>
            {label}
          </span>
          {isBase && (
            <span
              style={{
                fontSize: 9,
                color: "#9CA3AF",
                border: "1px solid #374151",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              REFERENCE
            </span>
          )}
        </div>
        <div style={{ color: "#6B7280", fontSize: 11, marginTop: 4 }}>
          {description}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <Metric
          label="IRR"
          primary
          value={fmtPct(outputs.irr)}
          delta={!isBase && deltaPill(outputs.irr, baseOutputs.irr, true)}
        />
        <Metric
          label="MoIC"
          value={fmtMult(outputs.moic)}
          delta={!isBase && deltaPill(outputs.moic, baseOutputs.moic, true)}
        />
        <Metric
          label="DCF EV"
          value={fmtMoney(outputs.dcfEV)}
          delta={!isBase && deltaPill(outputs.dcfEV, baseOutputs.dcfEV, true)}
        />
        <Metric
          label="Exit EV"
          value={fmtMoney(outputs.exitEV)}
          delta={!isBase && deltaPill(outputs.exitEV, baseOutputs.exitEV, true)}
        />
        <Metric
          label="Exit Equity"
          value={fmtMoney(outputs.exitEquity)}
          delta={
            !isBase &&
            deltaPill(outputs.exitEquity, baseOutputs.exitEquity, true)
          }
        />
        <Metric
          label="Sponsor Equity"
          value={fmtMoney(outputs.sponsorEquity)}
        />
        <Metric label="Total Debt" value={fmtMoney(outputs.totalDebt)} />
        <Metric label="Rev Growth" value={fmtPct(outputs.revenueCAGR)} />
        <Metric label="EBITDA Margin" value={fmtPct(outputs.ebitdaMargin)} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  primary,
  delta,
}: {
  label: string;
  value: string;
  primary?: boolean;
  delta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: primary ? "8px 10px" : "4px 0",
        background: primary ? "rgba(99,102,241,0.08)" : undefined,
        borderRadius: primary ? 6 : 0,
      }}
    >
      <span
        style={{
          color: primary ? "#D1D5DB" : "#6B7280",
          fontSize: primary ? 13 : 12,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#F9FAFB",
          fontWeight: primary ? 700 : 500,
          fontSize: primary ? 18 : 13,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {delta}
      </span>
    </div>
  );
}

export function ScenarioCompare() {
  const [base, setBase] = useState<ScenarioInputs>(DEFAULT_BASE);

  const set = <K extends keyof ScenarioInputs>(k: K, v: ScenarioInputs[K]) =>
    setBase((p) => ({ ...p, [k]: v }));

  const results = useMemo(
    () =>
      SCENARIOS.map((s) => ({
        def: s,
        outputs: computeScenario(s.transform(base)),
      })),
    [base],
  );
  const baseOutputs = results.find((r) => r.def.id === "base")!.outputs;

  const tornado = useMemo(() => computeTornado(base, 0.2), [base]);

  // Tornado chart data: positive bar = high IRR delta, negative = low IRR delta
  const tornadoChartData = tornado.map((t) => ({
    label: t.label,
    low: t.lowIRR - t.baseIRR,
    high: t.highIRR - t.baseIRR,
    spread: t.spread,
    baseIRR: t.baseIRR,
    lowIRR: t.lowIRR,
    highIRR: t.highIRR,
  }));

  return (
    <div
      style={{
        background: "#0A0F1C",
        minHeight: "100vh",
        color: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 24px",
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => {
            window.location.hash = "";
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            padding: "6px 10px",
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span style={{ color: "#6B7280" }}>|</span>
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          Scenario Comparison — Bull / Base / Bear
        </span>
      </div>

      <div style={{ padding: 20, display: "grid", gap: 20 }}>
        {/* Base inputs panel */}
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1F2937",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Base Assumptions
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0 24px",
            }}
          >
            <div>
              <InputRow
                label="Target Revenue"
                value={base.tgtRevenue}
                suffix="$M"
                onChange={(n) => set("tgtRevenue", n)}
                step={50}
              />
              <InputRow
                label="Target EBITDA"
                value={base.tgtEBITDA}
                suffix="$M"
                onChange={(n) => set("tgtEBITDA", n)}
                step={10}
              />
              <InputRow
                label="Target FCF"
                value={base.tgtFCF}
                suffix="$M"
                onChange={(n) => set("tgtFCF", n)}
                step={10}
              />
              <InputRow
                label="Net Debt"
                value={base.tgtNetDebt}
                suffix="$M"
                onChange={(n) => set("tgtNetDebt", n)}
                step={25}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <span style={{ color: "#9CA3AF", fontSize: 12 }}>Sector</span>
                <select
                  value={base.sector}
                  onChange={(e) => set("sector", e.target.value)}
                  style={{
                    background: "#0A0F1C",
                    border: "1px solid #1F2937",
                    borderRadius: 4,
                    padding: "4px 8px",
                    color: "#F9FAFB",
                    fontSize: 12,
                  }}
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <InputRow
                label="Revenue Growth"
                value={base.revenueGrowth}
                suffix="%"
                onChange={(n) => set("revenueGrowth", n)}
              />
              <InputRow
                label="EBITDA Margin"
                value={base.ebitdaMarginPct}
                suffix="%"
                onChange={(n) => set("ebitdaMarginPct", n)}
              />
              <InputRow
                label="Terminal Growth"
                value={base.terminalGrowth}
                suffix="%"
                onChange={(n) => set("terminalGrowth", n)}
                step={0.25}
              />
              <InputRow
                label="WACC"
                value={base.wacc}
                suffix="%"
                onChange={(n) => set("wacc", n)}
                step={0.5}
              />
              <InputRow
                label="Tax Rate"
                value={base.taxRate}
                suffix="%"
                onChange={(n) => set("taxRate", n)}
              />
              <InputRow
                label="Capex %"
                value={base.capexPct}
                suffix="%"
                onChange={(n) => set("capexPct", n)}
                step={0.5}
              />
            </div>
            <div>
              <InputRow
                label="Offer Premium"
                value={base.offerPremium}
                suffix="%"
                onChange={(n) => set("offerPremium", n)}
              />
              <InputRow
                label="Senior Leverage"
                value={base.seniorLeverage}
                suffix="x"
                onChange={(n) => set("seniorLeverage", n)}
                step={0.25}
              />
              <InputRow
                label="Mezz Leverage"
                value={base.mezzLeverage}
                suffix="x"
                onChange={(n) => set("mezzLeverage", n)}
                step={0.25}
              />
              <InputRow
                label="Senior Rate"
                value={base.seniorRate}
                suffix="%"
                onChange={(n) => set("seniorRate", n)}
                step={0.25}
              />
              <InputRow
                label="Mezz Rate"
                value={base.mezzRate}
                suffix="%"
                onChange={(n) => set("mezzRate", n)}
                step={0.25}
              />
              <InputRow
                label="Hold Period"
                value={base.holdPeriod}
                suffix="yr"
                onChange={(n) => set("holdPeriod", n)}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Three scenario cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {results.map(({ def, outputs }) => (
            <ScenarioCard
              key={def.id}
              label={def.label}
              description={def.description}
              accent={def.accent}
              outputs={outputs}
              baseOutputs={baseOutputs}
              isBase={def.id === "base"}
            />
          ))}
        </div>

        {/* Tornado chart */}
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1F2937",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Tornado — IRR Sensitivity (±20% on each input)
          </div>
          <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 12 }}>
            Bars show IRR delta vs. base ({fmtPct(baseOutputs.irr)}) when each
            assumption is perturbed independently. Ranked by impact.
          </div>
          <div
            style={{
              width: "100%",
              height: Math.max(220, tornadoChartData.length * 36),
            }}
          >
            <ResponsiveContainer>
              <BarChart
                data={tornadoChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                stackOffset="sign"
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                  domain={["dataMin", "dataMax"]}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: "#D1D5DB", fontSize: 12 }}
                  width={120}
                />
                <ReferenceLine x={0} stroke="#374151" />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 6,
                    color: "#F9FAFB",
                  }}
                  formatter={(value, name) => {
                    const v =
                      typeof value === "number" ? value : Number(value) || 0;
                    const tag = name === "low" ? "−20%" : "+20%";
                    return [`${v.toFixed(2)}% IRR delta`, tag];
                  }}
                />
                <Bar dataKey="low" stackId="a" fill="#F59E0B">
                  {tornadoChartData.map((_, i) => (
                    <Cell key={`l-${i}`} fill="#F59E0B" />
                  ))}
                </Bar>
                <Bar dataKey="high" stackId="a" fill="#10B981">
                  {tornadoChartData.map((_, i) => (
                    <Cell key={`h-${i}`} fill="#10B981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              color: "#6B7280",
              fontSize: 11,
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            {tornadoChartData[0]?.label} drives the most IRR variance (
            {tornadoChartData[0]?.spread.toFixed(1)}% spread).
          </div>
        </div>
      </div>
    </div>
  );
}
