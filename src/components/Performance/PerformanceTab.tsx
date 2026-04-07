import React from 'react'; // kept
import { Info } from 'lucide-react';
import { Slider } from '../Slider';
import { Tooltip } from '../Tooltip';
import { useFundModel } from '../../hooks/useFundModel';
import { MetricsGrid } from './MetricsGrid';
import { TVPIChart } from './TVPIChart';
import { QuartileScale } from './QuartileScale';
import { SensitivityTable } from './SensitivityTable';

export function PerformanceTab() {
  const { inputs, setInput } = useFundModel();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Educational callout */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          Performance metrics give LPs a complete picture:{' '}
          <Tooltip term="DPI" definition="Distributions to Paid-In — cash actually returned to LPs divided by cash called">DPI</Tooltip> measures realized returns,{' '}
          <Tooltip term="TVPI" definition="Total Value to Paid-In — total value (cash + unrealized) divided by cash called">TVPI</Tooltip> includes unrealized value,{' '}
          <Tooltip term="IRR" definition="Internal Rate of Return — annualized return accounting for timing of cash flows">IRR</Tooltip> accounts for timing, and{' '}
          <Tooltip term="MOIC" definition="Multiple on Invested Capital — total value divided by capital invested">MOIC</Tooltip> is the raw multiple. PME compares against public markets.
        </div>
      </div>

      {/* S&P benchmark slider */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#111827', border: '1px solid #374151' }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">Benchmark Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Slider
            label="S&P 500 Benchmark Return"
            value={inputs.spReturn * 100}
            min={0}
            max={20}
            step={0.1}
            format={v => `${v.toFixed(1)}%`}
            onChange={v => setInput('spReturn', v / 100)}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <MetricsGrid />

      {/* TVPI chart */}
      <TVPIChart />

      {/* Quartile scale */}
      <QuartileScale />

      {/* Sensitivity table */}
      <SensitivityTable />
    </div>
  );
}
