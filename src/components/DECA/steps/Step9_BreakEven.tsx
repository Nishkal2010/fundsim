import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency, formatPercentRaw } from "../utils/decaUtils";

const inputStyle: React.CSSProperties = {
  background: "#1f2937",
  border: "1px solid #374151",
  borderRadius: 6,
  color: "#f9fafb",
  fontFamily: "monospace",
  fontSize: 14,
  padding: "8px 12px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelSt: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  marginBottom: 4,
  display: "block",
};

function StatBadge({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: "12px 18px",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 17,
          fontWeight: 700,
          color: color ?? "#f9fafb",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FormulaBox() {
  return (
    <div
      style={{
        background: "#0d1526",
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: "16px 22px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          marginBottom: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Break-Even Formulas
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 2,
          color: "#9ca3af",
        }}
      >
        <div>
          <span style={{ color: "#60a5fa" }}>Break-Even Point (units)</span>
          {"  =  "}
          <span style={{ color: "#f9fafb" }}>Fixed Costs</span>
          {"  ÷  "}
          <span style={{ color: "#d4af37" }}>
            (Revenue per Unit − Variable Cost per Unit)
          </span>
        </div>
        <div>
          <span style={{ color: "#60a5fa" }}>Break-Even Point ($)</span>
          {"      =  "}
          <span style={{ color: "#f9fafb" }}>Fixed Costs</span>
          {"  ÷  "}
          <span style={{ color: "#d4af37" }}>Gross Margin %</span>
        </div>
      </div>
    </div>
  );
}

export function Step9_BreakEven() {
  const { state, dispatch, computed } = useDECA();
  const { breakEvenOverrides } = state;
  const { breakEven } = computed;

  const revenuePerUnit = breakEvenOverrides.revenuePerUnit;
  const variableCostPerUnit = breakEvenOverrides.variableCostPerUnit;
  const contributionMargin = revenuePerUnit - variableCostPerUnit;

  const annualBreakEvenUnits = breakEven.breakEvenUnits;
  const monthlyBreakEvenUnits = annualBreakEvenUnits / 12;
  const monthlyBreakEvenRevenue = breakEven.breakEvenRevenue / 12;

  // Gross margin from income statement
  const annualRevenue = computed.annual.totalRevenue;
  const grossMarginPct = computed.annual.grossMarginPct;

  // Break-even timeline: find first month cumulative net income >= 0
  const { incomeMonths } = computed;
  let monthsToProfitability = 0;
  let cumulative = 0;
  for (let i = 0; i < incomeMonths.length; i++) {
    cumulative += incomeMonths[i].netIncome;
    if (cumulative >= 0 && monthsToProfitability === 0) {
      monthsToProfitability = i + 1;
    }
  }

  // Chart data: 0 to 2x break-even units
  const maxUnits = Math.max(Math.ceil(monthlyBreakEvenUnits * 2), 20);
  const step = Math.max(1, Math.ceil(maxUnits / 20));
  const chartData: {
    units: number;
    revenue: number;
    fixedCosts: number;
    totalCosts: number;
  }[] = [];
  const monthlyFixedCosts = breakEven.fixedCosts / 12;

  for (let u = 0; u <= maxUnits; u += step) {
    chartData.push({
      units: u,
      revenue: u * revenuePerUnit,
      fixedCosts: monthlyFixedCosts,
      totalCosts: monthlyFixedCosts + u * variableCostPerUnit,
    });
  }

  // Find chart break-even x value
  const beX =
    contributionMargin > 0 ? monthlyFixedCosts / contributionMargin : 0;
  const beY = beX * revenuePerUnit;

  const setOverride = (field: keyof typeof breakEvenOverrides, val: number) =>
    dispatch({ type: "SET_BREAK_EVEN_OVERRIDES", payload: { [field]: val } });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px 0", color: "#f9fafb" }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#f9fafb",
              margin: 0,
            }}
          >
            Break-Even Analysis
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
            Unit economics and profitability threshold
          </p>
        </div>
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
            border: "1px solid #d4af37",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            color: "#d4af37",
            letterSpacing: "0.05em",
          }}
        >
          ICDC Level — Advanced Section
        </div>
      </div>

      <FormulaBox />

      {/* Inputs + Badges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 20,
          marginBottom: 24,
        }}
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
            Unit Economics
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelSt}>Revenue per Unit ($)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={revenuePerUnit}
              onChange={(e) =>
                setOverride("revenuePerUnit", parseFloat(e.target.value) || 0)
              }
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelSt}>Variable Cost per Unit ($)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={variableCostPerUnit}
              onChange={(e) =>
                setOverride(
                  "variableCostPerUnit",
                  parseFloat(e.target.value) || 0,
                )
              }
              style={inputStyle}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid #1f2937",
              paddingTop: 14,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
              Contribution Margin per Unit
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                fontWeight: 700,
                color: contributionMargin > 0 ? "#10b981" : "#ef4444",
              }}
            >
              {formatCurrency(contributionMargin)}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
              {revenuePerUnit > 0
                ? formatPercentRaw(
                    (contributionMargin / revenuePerUnit) * 100,
                  ) + " contribution margin ratio"
                : "—"}
            </div>
          </div>
        </div>

        {/* Auto-calculated badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatBadge
              label="Annual Fixed Costs"
              value={formatCurrency(breakEven.fixedCosts)}
              sub="from assumptions"
              color="#f9fafb"
            />
            <StatBadge
              label="Gross Margin %"
              value={formatPercentRaw(grossMarginPct)}
              sub="from income statement"
              color="#60a5fa"
            />
            <StatBadge
              label="Annual Revenue"
              value={formatCurrency(annualRevenue)}
              sub="Year 1 projected"
              color="#f9fafb"
            />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatBadge
              label="Break-Even Units / Month"
              value={
                contributionMargin > 0
                  ? monthlyBreakEvenUnits.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })
                  : "N/A"
              }
              sub="units per month needed"
              color={contributionMargin > 0 ? "#d4af37" : "#ef4444"}
            />
            <StatBadge
              label="Break-Even Revenue / Month"
              value={
                grossMarginPct > 0
                  ? formatCurrency(monthlyBreakEvenRevenue)
                  : "N/A"
              }
              sub="monthly revenue threshold"
              color={grossMarginPct > 0 ? "#d4af37" : "#ef4444"}
            />
            <StatBadge
              label="Months to Profitability"
              value={
                monthsToProfitability > 0
                  ? `Month ${monthsToProfitability}`
                  : "Not in Year 1"
              }
              sub="cumulative net income ≥ $0"
              color={monthsToProfitability > 0 ? "#10b981" : "#f59e0b"}
            />
          </div>

          {breakEven.breakEvenMonth > 0 && (
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid #10b981",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13,
                color: "#10b981",
                fontWeight: 600,
              }}
            >
              Break-Even Timeline: Month {breakEven.breakEvenMonth} based on
              cumulative income projections
            </div>
          )}
        </div>
      </div>

      {/* Break-Even Chart */}
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
          Break-Even Chart — Revenue vs. Total Costs
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="units"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Units",
                position: "insideBottomRight",
                offset: -8,
                fill: "#6b7280",
                fontSize: 11,
              }}
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
              labelFormatter={(label: unknown) => `${Number(label)} units`}
              formatter={(val: unknown, name: unknown) => [
                formatCurrency(Number(val)),
                String(name),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#9ca3af", paddingTop: 8 }}
            />

            {/* Loss zone */}
            {beX > 0 && (
              <ReferenceArea
                x1={0}
                x2={Math.min(beX, maxUnits)}
                fill="rgba(239,68,68,0.06)"
              />
            )}
            {/* Profit zone */}
            {beX > 0 && beX < maxUnits && (
              <ReferenceArea
                x1={beX}
                x2={maxUnits}
                fill="rgba(16,185,129,0.06)"
              />
            )}

            {/* Break-even vertical line */}
            {beX > 0 && (
              <ReferenceLine
                x={Math.round(beX)}
                stroke="#d4af37"
                strokeDasharray="5 3"
                label={{
                  value: "Break-Even",
                  position: "top",
                  fill: "#d4af37",
                  fontSize: 11,
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="revenue"
              name="Total Revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fixedCosts"
              name="Fixed Costs"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalCosts"
              name="Total Costs (Fixed + Variable)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />

            {/* Break-even dot */}
            {beX > 0 && beY > 0 && (
              <ReferenceDot
                x={Math.round(beX)}
                y={beY}
                r={7}
                fill="#d4af37"
                stroke="#0a0f1e"
                strokeWidth={2}
                label={{
                  value: `BE: ${formatCurrency(beY)}`,
                  position: "right",
                  fill: "#d4af37",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            <div
              style={{
                width: 24,
                height: 2,
                background: "rgba(239,68,68,0.3)",
                borderRadius: 1,
              }}
            />
            Loss zone
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            <div
              style={{
                width: 24,
                height: 2,
                background: "rgba(16,185,129,0.3)",
                borderRadius: 1,
              }}
            />
            Profit zone
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#d4af37",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#d4af37",
              }}
            />
            Break-Even Point
          </div>
        </div>
      </div>
    </motion.div>
  );
}
