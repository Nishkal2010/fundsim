import React from 'react'; // kept

export function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{ background: '#111827', borderTop: '1px solid #374151' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-serif text-xl text-[#F9FAFB] mb-2">FundSim</div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            A free, open-source PE/VC fund economics simulator. Explore fund structures,
            fee drag, J-curves, and waterfall distributions interactively.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Learn More</div>
          <ul className="space-y-1.5">
            {['Fund Economics Basics', 'Understanding IRR', 'Waterfall Mechanics', 'LP Due Diligence'].map(item => (
              <li key={item}>
                <span className="text-xs text-[#6B7280] cursor-default hover:text-[#9CA3AF] transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Disclaimer</div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            FundSim is an educational tool for illustrative purposes only. All calculations are
            simplified models and should not be used for actual investment decisions. Past performance
            is not indicative of future results. Always consult a qualified financial professional.
          </p>
        </div>
      </div>
      <div
        className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid #1F2937' }}
      >
        <span className="text-[10px] text-[#4B5563]">
          FundSim — Educational purposes only. Not financial advice.
        </span>
        <span className="text-[10px] text-[#4B5563]">
          Built with React + TypeScript + Recharts
        </span>
      </div>
    </footer>
  );
}
