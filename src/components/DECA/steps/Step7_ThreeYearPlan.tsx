import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency, formatPercentRaw } from "../utils/decaUtils";

const inputStyle: React.CSSProperties = {
  background: "#1f2937",
  border: "1px solid #374151",
  borderRadius: 6,
  color: "#f9fafb",
  fontFamily: "monospace",
  fontSize: 13,
  padding: "6px 10px",
  width: "100%",
  outline: "none",
};

const labelSt: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  marginBottom: 4,
  display: "block",
};

function InputField({
  label,
  value,
  onChange,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelSt}>{label}</label>
      <input
        type="number"
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={inputStyle}
      />
      {hint && (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function GrowthBadge({ pct }: { pct: number }) {
  const color = pct >= 0 ? "#10b981" : "#ef4444";
  const symbol = pct >= 0 ? "▲" : "▼";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        background: pct >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
        color,
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      {symbol} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

const TABLE_ROWS: {
  key: keyof ReturnType<typeof useProjections>[0];
  label: string;
  format: "currency" | "percent";
}[] = [
  { key: "revenue", label: "Revenue", format: "currency" },
  { key: "grossProfit", label: "Gross Profit", format: "currency" },
  { key: "grossMarginPct", label: "Gross Margin %", format: "percent" },
  { key: "totalOpEx", label: "Operating Expenses", format: "currency" },
  { key: "netIncome", label: "Net Income", format: "currency" },
  { key: "netMarginPct", label: "Net Margin %", format: "percent" },
];

export function Step7_ThreeYearPlan() {
  const { state, dispatch, computed } = useDECA();
  const { threeYearPlan: plan } = state;
  const projections = computed.threeYearProjections;

  const set = (field: keyof typeof plan) => (val: number | string) =>
    dispatch({ type: "SET_THREE_YEAR_PLAN", payload: { [field]: val } });

  const chartData = [
    {
      year: "Year 1",
      revenue: projections[0]?.revenue ?? 0,
      netIncome: projections[0]?.netIncome ?? 0,
    },
    {
      year: "Year 2",
      revenue: projections[1]?.revenue ?? 0,
      netIncome: projections[1]?.netIncome ?? 0,
    },
    {
      year: "Year 3",
      revenue: projections[2]?.revenue ?? 0,
      netIncome: projections[2]?.netIncome ?? 0,
    },
  ];

  const growthPct = (a: number, b: number) =>
    a === 0 ? 0 : ((b - a) / Math.abs(a)) * 100;

  const formatVal = (val: number, fmt: "currency" | "percent") =>
    fmt === "currency" ? formatCurrency(val) : formatPercentRaw(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px 0", color: "#f9fafb" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 }}
        >
          Three-Year Financial Plan
        </h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
          Project revenue and profitability through Year 3
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}
      >
        {/* Inputs */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 10,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#60a5fa",
              marginBottom: 16,
            }}
          >
            Growth Assumptions
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#374151",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Year 2
          </div>
          <InputField
            label="Revenue Growth Rate (%)"
            value={plan.year2RevenueGrowthRate}
            onChange={set("year2RevenueGrowthRate")}
            step={0.5}
          />
          <InputField
            label="COGS % Change (e.g. -2 = COGS drops 2%)"
            value={plan.year2CogsChange}
            onChange={set("year2CogsChange")}
            step={0.5}
            hint="Negative = efficiency gain"
          />
          <InputField
            label="Headcount Additions"
            value={plan.year2HeadcountAdditions}
            onChange={set("year2HeadcountAdditions")}
          />

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#374151",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: "16px 0 8px",
            }}
          >
            Year 3
          </div>
          <InputField
            label="Revenue Growth Rate (%)"
            value={plan.year3RevenueGrowthRate}
            onChange={set("year3RevenueGrowthRate")}
            step={0.5}
          />
          <InputField
            label="COGS % Change"
            value={plan.year3CogsChange}
            onChange={set("year3CogsChange")}
            step={0.5}
            hint="Negative = efficiency gain"
          />
          <InputField
            label="Headcount Additions"
            value={plan.year3HeadcountAdditions}
            onChange={set("year3HeadcountAdditions")}
          />

          <div style={{ marginTop: 20 }}>
            <label style={labelSt}>
              Growth Narrative <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={plan.growthNarrative}
              onChange={(e) =>
                dispatch({
                  type: "SET_THREE_YEAR_PLAN",
                  payload: { growthNarrative: e.target.value },
                })
              }
              placeholder="In 1–3 sentences, describe your growth strategy from Year 1 to Year 3..."
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />
            {plan.growthNarrative.trim().length === 0 && (
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 3 }}>
                Required by DECA rubric
              </div>
            )}
          </div>
        </div>

        {/* Table + Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Summary Table */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#0d1526",
                    borderBottom: "2px solid #2563eb",
                  }}
                >
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      color: "#60a5fa",
                      fontWeight: 700,
                    }}
                  >
                    Metric
                  </th>
                  {["Year 1", "Year 2", "Year 3"].map((y) => (
                    <th
                      key={y}
                      style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        fontSize: 12,
                        color: "#60a5fa",
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => {
                  const v1 = projections[0]?.[row.key] ?? 0;
                  const v2 = projections[1]?.[row.key] ?? 0;
                  const v3 = projections[2]?.[row.key] ?? 0;
                  const g12 = growthPct(v1 as number, v2 as number);
                  const g23 = growthPct(v2 as number, v3 as number);
                  return (
                    <tr
                      key={row.key}
                      style={{ borderBottom: "1px solid #1f2937" }}
                    >
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 13,
                          color: "#9ca3af",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          padding: "8px 16px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#f9fafb",
                        }}
                      >
                        {formatVal(v1 as number, row.format)}
                      </td>
                      <td
                        style={{
                          padding: "8px 16px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#f9fafb",
                        }}
                      >
                        <div>{formatVal(v2 as number, row.format)}</div>
                        <GrowthBadge pct={g12} />
                      </td>
                      <td
                        style={{
                          padding: "8px 16px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#f9fafb",
                        }}
                      >
                        <div>{formatVal(v3 as number, row.format)}</div>
                        <GrowthBadge pct={g23} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bar Chart */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 10,
              padding: "20px 16px 8px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#f9fafb",
                marginBottom: 16,
              }}
            >
              Revenue vs. Net Income — 3-Year Outlook
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 6,
                  }}
                  labelStyle={{ color: "#9ca3af", fontSize: 12 }}
                  formatter={(val: unknown, name: unknown) => [
                    formatCurrency(Number(val)),
                    String(name),
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: "#9ca3af",
                    paddingTop: 8,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2563eb"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="netIncome"
                  name="Net Income"
                  radius={[3, 3, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`ni-${index}`}
                      fill={entry.netIncome >= 0 ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
