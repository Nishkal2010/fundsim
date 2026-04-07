import React from 'react'; // kept
import { Bookmark, RotateCcw } from 'lucide-react';
import type { JCurveData, FundInputs } from '../../types/fund';
import { formatPercent, formatIRR, formatMultiple } from '../../utils/formatting';

interface ScenarioComparisonProps {
  currentData: JCurveData;
  currentInputs: FundInputs;
  savedData: JCurveData | null;
  savedInputs: FundInputs | null;
  onSave: () => void;
  onClear: () => void;
}

export function ScenarioComparison({
  currentData,
  currentInputs,
  savedData,
  savedInputs,
  onSave,
  onClear,
}: ScenarioComparisonProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F9FAFB]">Scenario Comparison</h3>
          <p className="text-xs text-[#6B7280]">Save current parameters as Scenario A to compare</p>
        </div>
        <div className="flex gap-2">
          {savedData ? (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <RotateCcw size={12} />
              Clear
            </button>
          ) : (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: 'rgba(99,102,241,0.1)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <Bookmark size={12} />
              Save as Scenario A
            </button>
          )}
        </div>
      </div>

      {savedData && savedInputs ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th className="pb-2 text-left text-[#6B7280] font-medium">Metric</th>
                <th className="pb-2 text-right text-[#818CF8] font-medium">
                  Scenario A (saved)
                </th>
                <th className="pb-2 text-right text-[#F59E0B] font-medium">
                  Scenario B (current)
                </th>
                <th className="pb-2 text-right text-[#6B7280] font-medium">Delta</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {[
                {
                  label: 'Net IRR',
                  a: formatIRR(savedData.netIRR),
                  b: formatIRR(currentData.netIRR),
                  delta: savedData.netIRR !== null && currentData.netIRR !== null
                    ? `${((currentData.netIRR - savedData.netIRR) * 100).toFixed(1)}pp`
                    : 'N/A',
                  positive: (savedData.netIRR ?? 0) <= (currentData.netIRR ?? 0),
                },
                {
                  label: 'Final MOIC',
                  a: formatMultiple(savedData.finalNetMultiple),
                  b: formatMultiple(currentData.finalNetMultiple),
                  delta: `${(currentData.finalNetMultiple - savedData.finalNetMultiple).toFixed(2)}x`,
                  positive: currentData.finalNetMultiple >= savedData.finalNetMultiple,
                },
                {
                  label: 'Trough Depth',
                  a: `${savedData.troughValue.toFixed(1)}%`,
                  b: `${currentData.troughValue.toFixed(1)}%`,
                  delta: `${(currentData.troughValue - savedData.troughValue).toFixed(1)}%`,
                  positive: currentData.troughValue > savedData.troughValue,
                },
                {
                  label: 'Breakeven Year',
                  a: savedData.breakevenYear !== null ? `Yr ${savedData.breakevenYear}` : 'Never',
                  b: currentData.breakevenYear !== null ? `Yr ${currentData.breakevenYear}` : 'Never',
                  delta: savedData.breakevenYear !== null && currentData.breakevenYear !== null
                    ? `${currentData.breakevenYear - savedData.breakevenYear}yr`
                    : 'N/A',
                  positive: (currentData.breakevenYear ?? 99) <= (savedData.breakevenYear ?? 99),
                },
                {
                  label: 'Loss Ratio',
                  a: formatPercent(savedInputs.lossRatio),
                  b: formatPercent(currentInputs.lossRatio),
                  delta: `${((currentInputs.lossRatio - savedInputs.lossRatio) * 100).toFixed(1)}pp`,
                  positive: currentInputs.lossRatio <= savedInputs.lossRatio,
                },
                {
                  label: 'Avg Exit Multiple',
                  a: formatMultiple(savedInputs.avgExitMultiple),
                  b: formatMultiple(currentInputs.avgExitMultiple),
                  delta: `${(currentInputs.avgExitMultiple - savedInputs.avgExitMultiple).toFixed(2)}x`,
                  positive: currentInputs.avgExitMultiple >= savedInputs.avgExitMultiple,
                },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td className="py-2 text-[#9CA3AF]">{row.label}</td>
                  <td className="py-2 text-right tabular-nums text-[#818CF8]">{row.a}</td>
                  <td className="py-2 text-right tabular-nums text-[#F59E0B]">{row.b}</td>
                  <td
                    className="py-2 text-right tabular-nums font-medium"
                    style={{ color: row.positive ? '#10B981' : '#EF4444' }}
                  >
                    {row.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="text-center py-8 rounded-lg"
          style={{ background: '#1F2937', border: '1px dashed #374151' }}
        >
          <p className="text-sm text-[#6B7280]">
            Adjust parameters and save to compare two scenarios side-by-side
          </p>
        </div>
      )}
    </div>
  );
}
