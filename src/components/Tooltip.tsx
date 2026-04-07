import React, { useState, useRef } from 'react';

interface TooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function Tooltip({ term, definition, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dashed border-[#6366F1] cursor-help">{children}</span>
      {visible && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{ background: '#1F2937', border: '1px solid #374151' }}
        >
          <div className="text-xs font-semibold text-[#818CF8] mb-1">{term}</div>
          <div className="text-xs text-[#9CA3AF] leading-relaxed">{definition}</div>
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #374151',
            }}
          />
        </div>
      )}
    </span>
  );
}
