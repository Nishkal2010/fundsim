import React from 'react'; // kept
import { Info } from 'lucide-react';
import { useFundModel } from '../../hooks/useFundModel';
import { MetricCard } from '../MetricCard';
import { DeploymentChart } from './DeploymentChart';
import { FeeTable } from './FeeTable';
import { Tooltip } from '../Tooltip';
import { formatMillions, formatPercent } from '../../utils/formatting';

export function FundLifecycleTab() {
  const { lifecycle, inputs } = useFundModel();

  const feeDragPct = lifecycle.totalMgmtFees / inputs.fundSize;
  const netEfficiency = lifecycle.capitalEfficiency;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Educational callout */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          <strong className="text-[#818CF8]">Fee Drag</strong> is the compounding cost of{' '}
          <Tooltip term="Management Fee" definition="Annual fee (usually 2%) charged by the GP to cover operating costs">
            management fees
          </Tooltip>{' '}
          over the fund's life. During the{' '}
          <Tooltip term="Investment Period" definition="Years during which the fund makes new investments (typically 3–5 years)">
            investment period
          </Tooltip>
          , fees are charged on committed capital. During{' '}
          <Tooltip term="Harvest Period" definition="Years after the investment period when the fund exits investments">
            harvest
          </Tooltip>
          , fees step down on remaining invested capital.
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Mgmt Fees"
          value={formatMillions(lifecycle.totalMgmtFees)}
          status="negative"
          description="Total fees paid over fund life"
        />
        <MetricCard
          label="Fee Drag"
          value={formatPercent(feeDragPct)}
          status="negative"
          description="% of committed capital lost to fees"
        />
        <MetricCard
          label="Net Investable Capital"
          value={formatMillions(lifecycle.netInvestableCapital)}
          status="positive"
          description="Capital actually deployed into investments"
        />
        <MetricCard
          label="Capital Efficiency"
          value={formatPercent(netEfficiency)}
          status={netEfficiency > 0.85 ? 'positive' : netEfficiency > 0.75 ? 'neutral' : 'negative'}
          description="Net investable / fund size"
        />
      </div>

      {/* Deployment chart */}
      <DeploymentChart />

      {/* Fee table */}
      <FeeTable />
    </div>
  );
}
