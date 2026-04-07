import React from 'react'; // kept
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { useFundModel } from '../../hooks/useFundModel';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
      >
        <div className="font-semibold mb-1 text-[#9CA3AF]">Year {label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}</span>
            <span className="tabular-nums font-medium">{p.value?.toFixed(2)}x</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TVPIChart() {
  const { performance } = useFundModel();

  const data = performance.dpiOverTime.map(p => ({
    year: p.year,
    DPI: parseFloat(p.dpi.toFixed(3)),
    RVPI: parseFloat(p.rvpi.toFixed(3)),
    TVPI: parseFloat(p.tvpi.toFixed(3)),
  }));

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">DPI / RVPI / TVPI Over Time</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Multiple progression through fund life</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5, fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v.toFixed(1)}x`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
          <ReferenceLine
            y={1}
            stroke="#374151"
            strokeWidth={2}
            label={{ value: '1.0x', position: 'right', fill: '#6B7280', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="DPI"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
          <Line
            type="monotone"
            dataKey="RVPI"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#3B82F6' }}
          />
          <Line
            type="monotone"
            dataKey="TVPI"
            stroke="#6366F1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#6366F1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
