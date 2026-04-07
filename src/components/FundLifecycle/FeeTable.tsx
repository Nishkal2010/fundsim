import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFundModel } from '../../hooks/useFundModel';
import { formatMillions } from '../../utils/formatting';

export function FeeTable() {
  const { lifecycle } = useFundModel();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #374151' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors"
        style={{ background: '#111827' }}
      >
        <span className="text-sm font-semibold text-[#F9FAFB]">Year-by-Year Detail Table</span>
        {open ? (
          <ChevronUp size={16} style={{ color: '#6B7280' }} />
        ) : (
          <ChevronDown size={16} style={{ color: '#6B7280' }} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: '#111827', borderTop: '1px solid #374151' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#1F2937' }}>
                      {['Year', 'Capital Called', 'Mgmt Fee', 'Capital Deployed', 'Cumulative Deployed', 'Remaining Commitment'].map(h => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                          style={{ color: '#6B7280', fontSize: '10px' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycle.years.map((y, i) => (
                      <tr
                        key={y.year}
                        style={{
                          background: i % 2 === 0 ? '#111827' : '#0D1420',
                          borderBottom: '1px solid #1F2937',
                        }}
                      >
                        <td className="px-4 py-2 font-medium text-[#9CA3AF]">Year {y.year}</td>
                        <td className="px-4 py-2 tabular-nums text-[#F9FAFB]">{formatMillions(y.capitalCalled)}</td>
                        <td className="px-4 py-2 tabular-nums" style={{ color: '#EF4444' }}>{formatMillions(y.mgmtFee)}</td>
                        <td className="px-4 py-2 tabular-nums text-[#818CF8]">{formatMillions(y.capitalDeployed)}</td>
                        <td className="px-4 py-2 tabular-nums text-[#F9FAFB]">{formatMillions(y.cumulativeDeployed)}</td>
                        <td className="px-4 py-2 tabular-nums text-[#6B7280]">{formatMillions(y.remainingCommitment)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#1F2937', borderTop: '2px solid #374151' }}>
                      <td className="px-4 py-2 font-bold text-[#F9FAFB]">Total</td>
                      <td className="px-4 py-2 tabular-nums font-bold text-[#F9FAFB]">
                        {formatMillions(lifecycle.years.reduce((s, y) => s + y.capitalCalled, 0))}
                      </td>
                      <td className="px-4 py-2 tabular-nums font-bold" style={{ color: '#EF4444' }}>
                        {formatMillions(lifecycle.totalMgmtFees)}
                      </td>
                      <td className="px-4 py-2 tabular-nums font-bold text-[#818CF8]">
                        {formatMillions(lifecycle.netInvestableCapital)}
                      </td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
