import React from 'react'; // kept
import { useFundModel } from '../../hooks/useFundModel';
import { MetricCard } from '../MetricCard';
import { formatIRR, formatMultiple } from '../../utils/formatting';

export function MetricsGrid() {
  const { performance, inputs } = useFundModel();

  const dpiStatus: 'positive' | 'neutral' | 'negative' =
    performance.dpi >= 1.5 ? 'positive' : performance.dpi >= 1.0 ? 'neutral' : 'negative';
  const tvpiStatus: 'positive' | 'neutral' | 'negative' =
    performance.tvpi >= 2.0 ? 'positive' : performance.tvpi >= 1.2 ? 'neutral' : 'negative';
  const irrStatus: 'positive' | 'neutral' | 'negative' =
    performance.netIRR === null ? 'neutral' : performance.netIRR > inputs.hurdleRate ? 'positive' : performance.netIRR > 0 ? 'neutral' : 'negative';
  const pmeStatus: 'positive' | 'neutral' | 'negative' =
    performance.pme >= 1.2 ? 'positive' : performance.pme >= 1.0 ? 'neutral' : 'negative';

  const getDPILabel = (v: number) => {
    if (v >= 2.0) return 'Excellent — fully returned + strong gains';
    if (v >= 1.5) return 'Good — 50%+ above cost returned';
    if (v >= 1.0) return 'At par — capital returned';
    return 'Below par — capital not yet returned';
  };

  const getTVPILabel = (v: number) => {
    if (v >= 2.5) return 'Top quartile performance';
    if (v >= 2.0) return 'Upper mid — solid fund';
    if (v >= 1.5) return 'Lower mid — acceptable';
    return 'Below expectations';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard
        label="DPI"
        value={formatMultiple(performance.dpi)}
        status={dpiStatus}
        description={getDPILabel(performance.dpi)}
        subtitle="Distributions to Paid-In"
      />
      <MetricCard
        label="RVPI"
        value={formatMultiple(performance.rvpi)}
        status="neutral"
        description="Unrealized NAV / capital called"
        subtitle="Residual Value to Paid-In"
      />
      <MetricCard
        label="TVPI"
        value={formatMultiple(performance.tvpi)}
        status={tvpiStatus}
        description={getTVPILabel(performance.tvpi)}
        subtitle="Total Value to Paid-In"
      />
      <MetricCard
        label="Net IRR"
        value={formatIRR(performance.netIRR)}
        status={irrStatus}
        description={`Hurdle: ${(inputs.hurdleRate * 100).toFixed(1)}%`}
        subtitle="Time-weighted annualized return"
      />
      <MetricCard
        label="Gross MOIC"
        value={formatMultiple(performance.grossMOIC)}
        status={performance.grossMOIC >= 2.5 ? 'positive' : 'neutral'}
        description="Before fees and carry deduction"
        subtitle="Multiple on Invested Capital"
      />
      <MetricCard
        label="PME"
        value={formatMultiple(performance.pme)}
        status={pmeStatus}
        description={`vs S&P ${(inputs.spReturn * 100).toFixed(0)}% benchmark`}
        subtitle={performance.pme >= 1.0 ? 'Outperforming public markets' : 'Underperforming public markets'}
      />
    </div>
  );
}
