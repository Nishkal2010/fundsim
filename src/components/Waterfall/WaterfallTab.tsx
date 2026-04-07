import React from 'react'; // kept
import { Info } from 'lucide-react';
import { useFundModel } from '../../hooks/useFundModel';
import { Tooltip } from '../Tooltip';
import { Slider } from '../Slider';
import { MetricCard } from '../MetricCard';
import { WaterfallDiagram } from './WaterfallDiagram';
import { WaterfallBarChart } from './WaterfallBarChart';
import { DistributionTable } from './DistributionTable';
import { DealSliders } from './DealSliders';
import { formatMillions, formatMultiple, formatIRR, formatPercent } from '../../utils/formatting';

export function WaterfallTab() {
  const { inputs, setInput, waterfall } = useFundModel();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Educational callout */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          The{' '}
          <Tooltip term="Distribution Waterfall" definition="The rules governing how profits are split between LPs and GPs">
            distribution waterfall
          </Tooltip>{' '}
          determines how proceeds flow through four tiers: return of capital, preferred return (
          <Tooltip term="Hurdle Rate / Preferred Return" definition="Minimum annual return LPs must earn before GP gets carry">
            hurdle
          </Tooltip>
          ),{' '}
          <Tooltip term="Catch-Up" definition="Period where GP receives outsized share of distributions to reach their carry target">
            GP catch-up
          </Tooltip>
          , and finally{' '}
          <Tooltip term="Carried Interest (Carry)" definition="The GP's share of profits (usually 20%), earned only after returning LP capital + hurdle">
            carried interest
          </Tooltip>{' '}
          split.{' '}
          <Tooltip term="European Waterfall" definition="Carry calculated on the entire fund's performance">
            European waterfall
          </Tooltip>{' '}
          distributes carry at the fund level;{' '}
          <Tooltip term="American Waterfall" definition="Carry calculated deal-by-deal">
            American waterfall
          </Tooltip>{' '}
          does it deal-by-deal.
        </div>
      </div>

      {/* Module inputs */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#111827', border: '1px solid #374151' }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">Waterfall Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Slider
            label="Total Proceeds"
            value={inputs.totalProceeds}
            min={50}
            max={1000}
            step={10}
            format={v => formatMillions(v)}
            onChange={v => setInput('totalProceeds', v)}
          />
          <Slider
            label="Catch-Up Rate"
            value={inputs.catchUpRate * 100}
            min={0}
            max={100}
            step={10}
            format={v => `${v.toFixed(0)}%`}
            onChange={v => setInput('catchUpRate', v / 100)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Waterfall Type</label>
            <div className="flex gap-2">
              {(['european', 'american'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setInput('waterfallType', type)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors capitalize"
                  style={{
                    background: inputs.waterfallType === type ? 'rgba(99,102,241,0.2)' : '#1F2937',
                    color: inputs.waterfallType === type ? '#818CF8' : '#6B7280',
                    border: `1px solid ${inputs.waterfallType === type ? 'rgba(99,102,241,0.4)' : '#374151'}`,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Clawback</label>
            <button
              onClick={() => setInput('clawback', !inputs.clawback)}
              className="py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: inputs.clawback ? 'rgba(16,185,129,0.15)' : '#1F2937',
                color: inputs.clawback ? '#10B981' : '#6B7280',
                border: `1px solid ${inputs.clawback ? 'rgba(16,185,129,0.3)' : '#374151'}`,
              }}
            >
              {inputs.clawback ? 'Clawback: ON' : 'Clawback: OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="LP Net Multiple"
          value={formatMultiple(waterfall.lpNetMultiple)}
          status={waterfall.lpNetMultiple >= 1.5 ? 'positive' : waterfall.lpNetMultiple >= 1 ? 'neutral' : 'negative'}
          description="Total LP distributions / LP capital"
        />
        <MetricCard
          label="GP Net Multiple"
          value={formatMultiple(waterfall.gpNetMultiple)}
          status="neutral"
          description="Total GP distributions / GP capital"
        />
        <MetricCard
          label="LP IRR"
          value={formatIRR(waterfall.lpIRR)}
          status={waterfall.lpIRR !== null && waterfall.lpIRR > inputs.hurdleRate ? 'positive' : 'neutral'}
          description="Approximate LP annualized return"
        />
        <MetricCard
          label="Effective Carry"
          value={formatPercent(waterfall.effectiveCarryPct)}
          status="neutral"
          description="GP carry / total profits"
        />
      </div>

      {/* Waterfall diagram - hero visual */}
      <WaterfallDiagram data={waterfall} totalProceeds={inputs.totalProceeds} />

      {/* Charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterfallBarChart data={waterfall} />
        <DistributionTable data={waterfall} inputs={inputs} />
      </div>

      {/* Deal sliders for American waterfall */}
      {inputs.waterfallType === 'american' && <DealSliders />}
    </div>
  );
}
