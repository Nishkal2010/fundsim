import React from 'react'; // kept
import { motion } from 'framer-motion';
import type { WaterfallData } from '../../types/fund';
import { formatMillions, formatPercent } from '../../utils/formatting';

interface WaterfallDiagramProps {
  data: WaterfallData;
  totalProceeds: number;
}

export function WaterfallDiagram({ data, totalProceeds }: WaterfallDiagramProps) {
  const svgWidth = 700;
  const svgHeight = data.tiers.length * 110 + 80;
  const maxBarWidth = 560;
  const barHeight = 44;
  const tierGap = 110;
  const startX = 70;
  const startY = 50;

  // Scale bar widths relative to totalProceeds
  const scale = (v: number) => (v / totalProceeds) * maxBarWidth;

  const tierColors = [
    { lp: '#10B981', gp: '#6366F1' },
    { lp: '#059669', gp: '#4F46E5' },
    { lp: '#34D399', gp: '#818CF8' },
    { lp: '#6EE7B7', gp: '#A5B4FC' },
  ];

  return (
    <div
      className="rounded-xl p-4 overflow-x-auto"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Waterfall Distribution Cascade</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Total Proceeds: {formatMillions(totalProceeds)}
        </p>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#10B981' }} />
            LP Distributions
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#6366F1' }} />
            GP Distributions
          </span>
        </div>
      </div>

      <svg width={svgWidth} height={svgHeight} className="min-w-full">
        {/* Total proceeds bar at top */}
        <motion.rect
          initial={{ width: 0 }}
          animate={{ width: maxBarWidth }}
          transition={{ duration: 0.6 }}
          x={startX}
          y={10}
          height={24}
          rx={4}
          fill="rgba(99,102,241,0.15)"
          stroke="#6366F1"
          strokeWidth={1}
        />
        <text x={startX + 8} y={26} fill="#818CF8" fontSize={11} fontWeight="600">
          Total Proceeds: {formatMillions(totalProceeds)}
        </text>

        {/* Connector line */}
        <line
          x1={startX + maxBarWidth / 2}
          y1={34}
          x2={startX + maxBarWidth / 2}
          y2={startY}
          stroke="#374151"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {data.tiers.map((tier, i) => {
          const y = startY + i * tierGap;
          const lpWidth = scale(tier.lpAmount);
          const gpWidth = scale(tier.gpAmount);
          const totalWidth = lpWidth + gpWidth;
          const xOffset = startX + (maxBarWidth - totalWidth) / 2;
          const colors = tierColors[i % tierColors.length];

          return (
            <g key={tier.name}>
              {/* Tier label */}
              <text x={startX} y={y - 6} fill="#9CA3AF" fontSize={10} fontWeight="600" textAnchor="start">
                {i + 1}. {tier.name}
              </text>

              {/* LP bar */}
              {tier.lpAmount > 0 && (
                <motion.g
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <rect
                    x={xOffset}
                    y={y}
                    width={Math.max(lpWidth, 1)}
                    height={barHeight}
                    rx={4}
                    fill={colors.lp}
                    fillOpacity={0.85}
                  />
                  {lpWidth > 60 && (
                    <>
                      <text x={xOffset + 6} y={y + 16} fill="#fff" fontSize={10} fontWeight="700">
                        LP
                      </text>
                      <text x={xOffset + 6} y={y + 30} fill="#fff" fontSize={10}>
                        {formatMillions(tier.lpAmount)}
                      </text>
                    </>
                  )}
                </motion.g>
              )}

              {/* GP bar */}
              {tier.gpAmount > 0 && (
                <motion.g
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.05, duration: 0.4 }}
                >
                  <rect
                    x={xOffset + lpWidth}
                    y={y}
                    width={Math.max(gpWidth, 1)}
                    height={barHeight}
                    rx={4}
                    fill={colors.gp}
                    fillOpacity={0.85}
                  />
                  {gpWidth > 60 && (
                    <>
                      <text x={xOffset + lpWidth + 6} y={y + 16} fill="#fff" fontSize={10} fontWeight="700">
                        GP
                      </text>
                      <text x={xOffset + lpWidth + 6} y={y + 30} fill="#fff" fontSize={10}>
                        {formatMillions(tier.gpAmount)}
                      </text>
                    </>
                  )}
                  {gpWidth <= 60 && gpWidth > 5 && (
                    <text
                      x={xOffset + lpWidth + Math.max(gpWidth, 1) + 4}
                      y={y + 26}
                      fill={colors.gp}
                      fontSize={9}
                    >
                      GP: {formatMillions(tier.gpAmount)}
                    </text>
                  )}
                </motion.g>
              )}

              {/* Total label at right */}
              <text
                x={startX + maxBarWidth + 8}
                y={y + 26}
                fill="#6B7280"
                fontSize={9}
              >
                {formatPercent((tier.lpAmount + tier.gpAmount) / totalProceeds, 0)}
              </text>

              {/* Connector to next tier */}
              {i < data.tiers.length - 1 && (
                <line
                  x1={xOffset + totalWidth / 2}
                  y1={y + barHeight}
                  x2={startX + maxBarWidth / 2}
                  y2={y + tierGap}
                  stroke="#374151"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
              )}
            </g>
          );
        })}

        {/* Summary totals */}
        <g transform={`translate(${startX}, ${startY + data.tiers.length * tierGap})`}>
          <text y={8} fill="#6B7280" fontSize={10} fontWeight="600">
            TOTALS
          </text>
          <rect x={0} y={14} width={120} height={32} rx={4} fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth={1} />
          <text x={8} y={28} fill="#10B981" fontSize={9} fontWeight="600">LP Total</text>
          <text x={8} y={40} fill="#10B981" fontSize={10} fontWeight="700">{formatMillions(data.totalLP)}</text>

          <rect x={130} y={14} width={120} height={32} rx={4} fill="rgba(99,102,241,0.12)" stroke="#6366F1" strokeWidth={1} />
          <text x={138} y={28} fill="#818CF8" fontSize={9} fontWeight="600">GP Total</text>
          <text x={138} y={40} fill="#818CF8" fontSize={10} fontWeight="700">{formatMillions(data.totalGP)}</text>

          <rect x={260} y={14} width={140} height={32} rx={4} fill="rgba(99,102,241,0.08)" stroke="#374151" strokeWidth={1} />
          <text x={268} y={28} fill="#9CA3AF" fontSize={9} fontWeight="600">Effective Carry</text>
          <text x={268} y={40} fill="#9CA3AF" fontSize={10} fontWeight="700">
            {formatPercent(data.effectiveCarryPct, 1)}
          </text>
        </g>
      </svg>
    </div>
  );
}
