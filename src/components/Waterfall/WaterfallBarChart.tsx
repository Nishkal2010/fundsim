import React from 'react'; // kept
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { WaterfallData } from '../../types/fund';
import { formatMillions } from '../../utils/formatting';

interface WaterfallBarChartProps {
  data: WaterfallData;
}

const LP_COLOR = '#10B981';
const GP_COLOR = '#6366F1';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
      >
        <div className="font-semibold mb-2 text-[#9CA3AF]">{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.fill }} className="flex justify-between gap-4">
            <span>{p.name}</span>
            <span className="tabular-nums font-medium">{formatMillions(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WaterfallBarChart({ data }: WaterfallBarChartProps) {
  const chartData = data.tiers.map(tier => ({
    name: tier.name,
    LP: parseFloat(tier.lpAmount.toFixed(2)),
    GP: parseFloat(tier.gpAmount.toFixed(2)),
  }));

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Distribution by Tier</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">LP vs GP allocations per waterfall tier</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            angle={-25}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => formatMillions(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
          />
          <Bar dataKey="LP" stackId="a" fill={LP_COLOR} radius={[0, 0, 0, 0]} />
          <Bar dataKey="GP" stackId="a" fill={GP_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
