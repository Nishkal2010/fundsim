import React from 'react'; // kept
import { useFundModel } from '../../hooks/useFundModel';
import { Slider } from '../Slider';
import { formatMillions, formatMultiple } from '../../utils/formatting';

export function DealSliders() {
  const { inputs, setInput } = useFundModel();
  const capitalPerDeal = (inputs.fundSize * 0.85) / inputs.dealMultiples.length;

  const updateDeal = (index: number, value: number) => {
    const newMultiples = [...inputs.dealMultiples];
    newMultiples[index] = value;
    setInput('dealMultiples', newMultiples);
  };

  const getDealStatus = (multiple: number) => {
    if (multiple >= 3.0) return 'positive';
    if (multiple >= 1.0) return 'neutral';
    return 'negative';
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Deal-by-Deal Multiples</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Individual deal multiples for American waterfall calculation. Each deal: {formatMillions(capitalPerDeal)}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {inputs.dealMultiples.map((multiple, i) => {
          const proceeds = capitalPerDeal * multiple;
          const status = getDealStatus(multiple);
          return (
            <div key={i} className="flex flex-col gap-3">
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: status === 'positive' ? 'rgba(16,185,129,0.08)' : status === 'negative' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                  border: `1px solid ${status === 'positive' ? 'rgba(16,185,129,0.2)' : status === 'negative' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
                }}
              >
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Deal {i + 1}</div>
                <div
                  className="text-xl font-bold tabular-nums"
                  style={{
                    color: status === 'positive' ? '#10B981' : status === 'negative' ? '#EF4444' : '#818CF8',
                  }}
                >
                  {formatMultiple(multiple)}
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-1">
                  {formatMillions(proceeds)} proceeds
                </div>
              </div>
              <Slider
                label=""
                value={multiple}
                min={0}
                max={15}
                step={0.5}
                format={v => `${v.toFixed(1)}x`}
                onChange={v => updateDeal(i, v)}
              />
            </div>
          );
        })}
      </div>
      <div
        className="mt-4 pt-4 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid #374151' }}
      >
        <span className="text-[#6B7280]">
          Portfolio avg: {formatMultiple(inputs.dealMultiples.reduce((a, b) => a + b, 0) / inputs.dealMultiples.length)}
        </span>
        <span className="text-[#6B7280]">
          Total proceeds: {formatMillions(inputs.dealMultiples.reduce((s, m) => s + capitalPerDeal * m, 0))}
        </span>
        <span style={{ color: inputs.dealMultiples.filter(m => m < 1).length > 0 ? '#EF4444' : '#10B981' }}>
          {inputs.dealMultiples.filter(m => m < 1).length} loss(es)
        </span>
      </div>
    </div>
  );
}
