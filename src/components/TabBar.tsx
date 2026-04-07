import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, BarChart3, Layers, Activity } from 'lucide-react';

export type TabId = 'lifecycle' | 'jcurve' | 'waterfall' | 'performance';

const tabs: { id: TabId; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'lifecycle',    label: 'Fund Lifecycle',       icon: Layers },
  { id: 'jcurve',      label: 'J-Curve',               icon: TrendingDown },
  { id: 'waterfall',   label: 'Waterfall',             icon: BarChart3 },
  { id: 'performance', label: 'Performance Dashboard', icon: Activity },
];

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  return (
    <div
      className="w-full px-6"
      style={{ background: '#111827', borderBottom: '1px solid #374151' }}
    >
      <div className="max-w-7xl mx-auto flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          const isHovered = hoveredTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium"
              style={{
                color: isActive ? '#818CF8' : isHovered ? '#D1D5DB' : '#6B7280',
                background: isHovered && !isActive ? 'rgba(99,102,241,0.05)' : 'transparent',
                transition: 'color 0.18s ease, background 0.18s ease',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.18s ease',
              }}>
                <Icon size={15} />
              </span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366F1, #818CF8)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
