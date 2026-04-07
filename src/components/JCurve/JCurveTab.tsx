import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useFundModel } from '../../hooks/useFundModel';
import { MetricCard } from '../MetricCard';
import { Slider } from '../Slider';
import { Tooltip } from '../Tooltip';
import { JCurveChart } from './JCurveChart';
import { ScenarioComparison } from './ScenarioComparison';
import { formatIRR, formatMultiple } from '../../utils/formatting';
import type { JCurveData, FundInputs } from '../../types/fund';

export function JCurveTab() {
  const { inputs, setInput, jCurve } = useFundModel();
  const [savedScenario, setSavedScenario] = useState<{ data: JCurveData; inputs: FundInputs } | null>(null);

  const handleSaveScenario = () => {
    setSavedScenario({ data: jCurve, inputs: { ...inputs } });
  };

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
          <Tooltip term="J-Curve" definition="The pattern of negative early returns followed by positive later returns in PE/VC funds">
            J-Curve
          </Tooltip>{' '}
          reflects the reality of PE/VC investing: early capital calls for fees and investments create negative returns,
          while exits in later years drive recovery. The depth and duration depend on{' '}
          <Tooltip term="Management Fee" definition="Annual fee (usually 2%) charged by the GP to cover operating costs">
            management fees
          </Tooltip>
          , loss ratio, exit timing, and exit multiples.
        </div>
      </div>

      {/* Module-specific inputs */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#111827', border: '1px solid #374151' }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">J-Curve Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Slider
            label="Avg Hold Period"
            value={inputs.avgHoldPeriod}
            min={2}
            max={8}
            step={1}
            format={v => `${v}yr`}
            onChange={v => setInput('avgHoldPeriod', v)}
          />
          <Slider
            label="Loss Ratio"
            value={inputs.lossRatio * 100}
            min={0}
            max={70}
            step={1}
            format={v => `${v.toFixed(0)}%`}
            onChange={v => setInput('lossRatio', v / 100)}
          />
          <Slider
            label="Avg Exit Multiple"
            value={inputs.avgExitMultiple}
            min={0.5}
            max={10}
            step={0.5}
            format={v => `${v.toFixed(1)}x`}
            onChange={v => setInput('avgExitMultiple', v)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Exit Distribution</label>
            <div className="flex flex-col gap-1.5">
              {(['bell', 'even', 'backloaded'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setInput('exitDistribution', opt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-left"
                  style={{
                    background: inputs.exitDistribution === opt ? 'rgba(99,102,241,0.2)' : '#1F2937',
                    color: inputs.exitDistribution === opt ? '#818CF8' : '#6B7280',
                    border: `1px solid ${inputs.exitDistribution === opt ? 'rgba(99,102,241,0.4)' : '#374151'}`,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    transform: inputs.exitDistribution === opt ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={e => {
                    if (inputs.exitDistribution !== opt) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.2)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (inputs.exitDistribution !== opt) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1F2937';
                      (e.currentTarget as HTMLButtonElement).style.color = '#6B7280';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151';
                    }
                  }}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)} curve
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* J-Curve Chart */}
      <JCurveChart
        points={jCurve.points}
        scenarioPoints={savedScenario?.data.points}
        breakevenYear={jCurve.breakevenYear}
        troughYear={jCurve.troughYear}
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Net IRR"
          value={formatIRR(jCurve.netIRR)}
          status={
            jCurve.netIRR === null ? 'neutral'
              : jCurve.netIRR > inputs.hurdleRate ? 'positive'
              : jCurve.netIRR > 0 ? 'neutral' : 'negative'
          }
          description={`Hurdle: ${(inputs.hurdleRate * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Final Net MOIC"
          value={formatMultiple(jCurve.finalNetMultiple)}
          status={jCurve.finalNetMultiple > 2 ? 'positive' : jCurve.finalNetMultiple > 1 ? 'neutral' : 'negative'}
          description="Total distributions / capital called"
        />
        <MetricCard
          label="Trough Depth"
          value={`${jCurve.troughValue.toFixed(1)}%`}
          status="negative"
          description={`Worst point at Year ${jCurve.troughYear}`}
        />
        <MetricCard
          label="Breakeven Year"
          value={jCurve.breakevenYear !== null ? `Year ${jCurve.breakevenYear}` : 'N/A'}
          status={jCurve.breakevenYear !== null ? 'positive' : 'negative'}
          description="When net cash flow turns positive"
        />
      </div>

      {/* Scenario comparison */}
      <ScenarioComparison
        currentData={jCurve}
        currentInputs={inputs}
        savedData={savedScenario?.data ?? null}
        savedInputs={savedScenario?.inputs ?? null}
        onSave={handleSaveScenario}
        onClear={() => setSavedScenario(null)}
      />
    </div>
  );
}
