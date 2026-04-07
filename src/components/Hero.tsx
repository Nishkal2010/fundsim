import React from 'react'; // kept
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Code } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const sampleJCurveData = [
  { year: 0, value: 0 },
  { year: 1, value: -15 },
  { year: 2, value: -28 },
  { year: 3, value: -35 },
  { year: 4, value: -30 },
  { year: 5, value: -18 },
  { year: 6, value: 5 },
  { year: 7, value: 32 },
  { year: 8, value: 58 },
  { year: 9, value: 80 },
  { year: 10, value: 95 },
];

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <div
      className="w-full px-6 py-16 flex flex-col items-center text-center"
      style={{ background: 'linear-gradient(180deg, #0A0F1C 0%, #111827 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <div className="flex justify-center gap-2 mb-6">
          {[
            { icon: Shield, text: 'No signup required' },
            { icon: Zap, text: '100% client-side' },
            { icon: Code, text: 'Open source' },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(99,102,241,0.1)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <Icon size={11} />
              {text}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-5xl md:text-6xl text-[#F9FAFB] leading-tight mb-4">
          Understand Fund Economics
          <br />
          <span style={{ color: '#818CF8', fontStyle: 'italic' }}>Before You Invest</span>
        </h1>

        <p className="text-lg text-[#9CA3AF] mb-8 max-w-xl mx-auto leading-relaxed">
          Simulate PE/VC fund structures interactively. Explore fee drag, J-curves, waterfall distributions,
          and performance metrics — all in real-time.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            color: '#fff',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
        >
          Start Exploring
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-12 w-full max-w-2xl"
      >
        <div
          className="rounded-2xl p-4 relative"
          style={{
            background: '#111827',
            border: '1px solid #374151',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#9CA3AF]">J-Curve Preview — $100M Fund</span>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#6366F1' }} />
                <span className="text-[#6B7280]">Net Cash Flow</span>
              </span>
            </div>
          </div>
          <div className="h-40 relative">
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div
              className="absolute left-0 top-1/2 text-[10px] text-[#6B7280] -translate-y-3 px-1"
            >
              0%
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleJCurveData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                    fontSize: '12px',
                  }}
                  formatter={(v: unknown) => [`${v}%`, 'Net Cash Flow']}
                  labelFormatter={(l: unknown) => `Year ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366F1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[10px] text-[#6B7280] mt-1">
            Year 1–10 → Early fee drag creates J-curve, exits drive recovery
          </div>
        </div>
      </motion.div>
    </div>
  );
}
