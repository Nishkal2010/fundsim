import React from 'react'; // kept
import { motion } from 'framer-motion';
import { useFundModel } from '../../hooks/useFundModel';

const QUARTILE_CONFIG = {
  'top': { label: 'Top Quartile', color: '#10B981', position: 87.5, tvpiRange: '2.0x+' },
  'upper-mid': { label: 'Upper Mid', color: '#818CF8', position: 62.5, tvpiRange: '1.5–2.0x' },
  'lower-mid': { label: 'Lower Mid', color: '#F59E0B', position: 37.5, tvpiRange: '1.2–1.5x' },
  'bottom': { label: 'Bottom Quartile', color: '#EF4444', position: 12.5, tvpiRange: '<1.2x' },
};

export function QuartileScale() {
  const { performance } = useFundModel();
  const config = QUARTILE_CONFIG[performance.quartile];

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#111827', border: '1px solid #374151' }}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[#F9FAFB]">Quartile Ranking</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Based on TVPI vs industry benchmarks</p>
      </div>

      {/* Scale bar */}
      <div className="relative">
        {/* Gradient bar */}
        <div
          className="h-6 rounded-full w-full"
          style={{
            background: 'linear-gradient(to right, #EF4444, #F59E0B, #818CF8, #10B981)',
          }}
        />

        {/* Quartile dividers */}
        {[25, 50, 75].map(pct => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${pct}%`, background: 'rgba(0,0,0,0.4)' }}
          />
        ))}

        {/* Fund position indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute -top-8"
          style={{ left: `${config.position}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className="px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap"
            style={{ background: config.color, color: '#fff' }}
          >
            Your Fund
          </div>
          <div
            className="w-px h-4 mx-auto"
            style={{ background: config.color }}
          />
        </motion.div>

        {/* Labels below */}
        <div className="flex justify-between mt-3 text-[10px]">
          <div className="text-center" style={{ width: '25%', color: '#EF4444' }}>
            <div className="font-semibold">Bottom</div>
            <div className="text-[#6B7280]">&lt;1.2x</div>
          </div>
          <div className="text-center" style={{ width: '25%', color: '#F59E0B' }}>
            <div className="font-semibold">Lower Mid</div>
            <div className="text-[#6B7280]">1.2–1.5x</div>
          </div>
          <div className="text-center" style={{ width: '25%', color: '#818CF8' }}>
            <div className="font-semibold">Upper Mid</div>
            <div className="text-[#6B7280]">1.5–2.0x</div>
          </div>
          <div className="text-center" style={{ width: '25%', color: '#10B981' }}>
            <div className="font-semibold">Top</div>
            <div className="text-[#6B7280]">2.0x+</div>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-6 flex items-center gap-3">
        <div
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: `${config.color}18`, color: config.color, border: `1px solid ${config.color}30` }}
        >
          {config.label}
        </div>
        <div className="text-sm text-[#9CA3AF]">
          TVPI: {performance.tvpi.toFixed(2)}x · Range: {config.tvpiRange}
        </div>
      </div>
    </div>
  );
}
