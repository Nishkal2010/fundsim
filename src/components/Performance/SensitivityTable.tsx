import React from 'react'; // kept
import { useFundModel } from '../../hooks/useFundModel';

function irrToColor(irr: number | null): string {
  if (irr === null) return '#1F2937';
  if (irr < 0) {
    const intensity = Math.min(1, Math.abs(irr) / 0.3);
    const r = Math.round(239 * intensity + 31 * (1 - intensity));
    const g = Math.round(68 * intensity + 41 * (1 - intensity));
    const b = Math.round(68 * intensity + 55 * (1 - intensity));
    return `rgb(${r},${g},${b})`;
  }
  if (irr >= 0.25) return '#065F46';
  const intensity = irr / 0.25;
  const r = Math.round(31 * (1 - intensity) + 6 * intensity);
  const g = Math.round(41 * (1 - intensity) + 95 * intensity);
  const b = Math.round(55 * (1 - intensity) + 70 * intensity);
  return `rgb(${r},${g},${b})`;
}

function irrToTextColor(irr: number | null): string {
  if (irr === null) return '#6B7280';
  if (irr < -0.1) return '#FCA5A5';
  if (irr < 0) return '#FECACA';
  if (irr > 0.15) return '#6EE7B7';
  if (irr > 0.05) return '#A7F3D0';
  return '#F9FAFB';
}

export function SensitivityTable() {
  const { performance, inputs } = useFundModel();

  const lossRatioLabels = ['10%', '20%', '30%', '40%', '50%'];
  const exitMultipleLabels = ['1.5x', '2.0x', '2.5x', '3.0x', '4.0x', '5.0x'];
  const exitMultiples = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  const lossRatios = [0.1, 0.2, 0.3, 0.4, 0.5];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #374151' }}
    >
      <div
        className="px-5 py-3"
        style={{ background: '#1F2937', borderBottom: '1px solid #374151' }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Sensitivity Analysis: Net IRR</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Impact of exit multiple (rows) and loss ratio (columns) on net IRR. Current params highlighted.
        </p>
      </div>
      <div style={{ background: '#111827' }} className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th
                className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: '#6B7280', minWidth: '80px' }}
              >
                Exit × \ Loss %
              </th>
              {lossRatioLabels.map((l, i) => {
                const isCurrentLoss = Math.abs(lossRatios[i] - inputs.lossRatio) < 0.05;
                return (
                  <th
                    key={l}
                    className="px-3 py-3 text-center text-[10px] uppercase tracking-wider font-semibold"
                    style={{
                      color: isCurrentLoss ? '#818CF8' : '#6B7280',
                      background: isCurrentLoss ? 'rgba(99,102,241,0.08)' : 'transparent',
                    }}
                  >
                    {l}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {performance.sensitivityMatrix.map((row, ri) => {
              const isCurrentMultiple = Math.abs(exitMultiples[ri] - inputs.avgExitMultiple) < 0.3;
              return (
                <tr
                  key={exitMultipleLabels[ri]}
                  style={{ borderBottom: '1px solid #1F2937' }}
                >
                  <td
                    className="px-4 py-2 font-semibold"
                    style={{
                      color: isCurrentMultiple ? '#818CF8' : '#9CA3AF',
                      background: isCurrentMultiple ? 'rgba(99,102,241,0.08)' : 'transparent',
                    }}
                  >
                    {exitMultipleLabels[ri]}
                  </td>
                  {row.map((cell, ci) => {
                    const isCurrentCell =
                      Math.abs(exitMultiples[ri] - inputs.avgExitMultiple) < 0.3 &&
                      Math.abs(lossRatios[ci] - inputs.lossRatio) < 0.05;
                    return (
                      <td
                        key={ci}
                        className="px-3 py-2 text-center tabular-nums font-medium"
                        style={{
                          background: irrToColor(cell.irr),
                          color: irrToTextColor(cell.irr),
                          border: isCurrentCell ? '2px solid #818CF8' : 'none',
                          fontSize: '11px',
                        }}
                      >
                        {cell.irr === null ? 'N/A' : `${(cell.irr * 100).toFixed(1)}%`}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        className="px-5 py-3 flex items-center gap-6"
        style={{ background: '#1F2937', borderTop: '1px solid #374151' }}
      >
        <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
          <div className="flex gap-1">
            {['#7F1D1D', '#DC2626', '#374151', '#065F46', '#064E3B'].map(c => (
              <div key={c} className="w-4 h-3 rounded-sm" style={{ background: c }} />
            ))}
          </div>
          <span>Low IRR → High IRR</span>
        </div>
        <div className="text-[10px]" style={{ color: '#818CF8' }}>
          ■ = Current parameters
        </div>
      </div>
    </div>
  );
}
