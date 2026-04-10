import React from "react"; // kept
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { JCurvePoint } from "../../types/fund";

interface JCurveChartProps {
  points: JCurvePoint[];
  scenarioPoints?: JCurvePoint[];
  breakevenYear: number | null;
  troughYear: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "#1F2937",
          border: "1px solid #374151",
          color: "#F9FAFB",
        }}
      >
        <div className="font-semibold mb-1 text-[#9CA3AF]">Year {label}</div>
        {payload.map((p) => (
          <div
            key={p.name}
            style={{ color: p.color }}
            className="flex justify-between gap-4"
          >
            <span>{p.name}</span>
            <span className="tabular-nums font-medium">
              {p.value?.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function JCurveChart({
  points,
  scenarioPoints,
  breakevenYear,
  troughYear,
}: JCurveChartProps) {
  const allData = points.map((p, i) => ({
    year: p.year,
    "Net Cash Flow": parseFloat(p.netCashFlow.toFixed(2)),
    "NAV + Net": parseFloat(p.nav.toFixed(2)),
    ...(scenarioPoints
      ? {
          "Scenario B": parseFloat(
            (scenarioPoints[i]?.netCashFlow ?? 0).toFixed(2),
          ),
        }
      : {}),
  }));

  const minValue =
    allData.length > 0
      ? Math.min(
          ...allData.map((d) => Math.min(d["Net Cash Flow"], d["NAV + Net"])),
        ) - 5
      : -5;
  const maxValue =
    allData.length > 0
      ? Math.max(
          ...allData.map((d) => Math.max(d["Net Cash Flow"], d["NAV + Net"])),
        ) + 5
      : 5;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "#111827", border: "1px solid #374151" }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">
          J-Curve: Net Cash Flow & NAV
        </h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          As % of committed capital
        </p>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart
          data={allData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Year",
              position: "insideBottomRight",
              offset: -5,
              fill: "#6B7280",
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[minValue, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />

          {/* Shaded zones */}
          <ReferenceArea y1={minValue} y2={0} fill="url(#redGrad)" />
          <ReferenceArea y1={0} y2={maxValue} fill="url(#greenGrad)" />

          {/* Zero line */}
          <ReferenceLine
            y={0}
            stroke="#374151"
            strokeWidth={2}
            label={{
              value: "0%",
              position: "right",
              fill: "#6B7280",
              fontSize: 10,
            }}
          />

          {/* Trough annotation */}
          <ReferenceLine
            x={troughYear}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "Trough",
              position: "top",
              fill: "#EF4444",
              fontSize: 10,
            }}
          />

          {/* Breakeven annotation */}
          {breakevenYear && (
            <ReferenceLine
              x={breakevenYear}
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Breakeven",
                position: "top",
                fill: "#10B981",
                fontSize: 10,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="NAV + Net"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: "#3B82F6" }}
            opacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="Net Cash Flow"
            stroke="#6366F1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#6366F1" }}
          />
          {scenarioPoints && (
            <Line
              type="monotone"
              dataKey="Scenario B"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ r: 4, fill: "#F59E0B" }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
