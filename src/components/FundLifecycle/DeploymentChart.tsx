import React from 'react'; // kept
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useFundModel } from '../../hooks/useFundModel';
import { formatMillions } from '../../utils/formatting';

export function DeploymentChart() {
  const { lifecycle } = useFundModel();

  const data = lifecycle.years.map(y => ({
    year: `Yr ${y.year}`,
    'Mgmt Fees': parseFloat(y.mgmtFee.toFixed(2)),
    'Capital Deployed': parseFloat(y.capitalDeployed.toFixed(2)),
    'Remaining Commitment': parseFloat(y.remainingCommitment.toFixed(2)),
  }));

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Capital Deployment Over Time</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Annual breakdown of capital called, fees, and deployment</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorDeployed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#374151" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#374151" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => formatMillions(v)}
          />
          <Tooltip
            contentStyle={{
              background: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
            formatter={(value: unknown) => [formatMillions(value as number)]}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
          />
          <Area
            type="monotone"
            dataKey="Remaining Commitment"
            stroke="#374151"
            fill="url(#colorRemaining)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="Capital Deployed"
            stroke="#6366F1"
            fill="url(#colorDeployed)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Mgmt Fees"
            stroke="#EF4444"
            fill="url(#colorFees)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
