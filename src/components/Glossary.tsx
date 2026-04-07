import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { glossaryEntries } from '../data/glossary';

interface GlossaryProps {
  open: boolean;
  onClose: () => void;
}

export function Glossary({ open, onClose }: GlossaryProps) {
  const [query, setQuery] = useState('');
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  const filtered = glossaryEntries.filter(
    e =>
      e.term.toLowerCase().includes(query.toLowerCase()) ||
      e.definition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col"
            style={{ background: '#111827', borderLeft: '1px solid #374151' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #374151' }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#F9FAFB' }}>Glossary</h2>
                <p className="text-xs" style={{ color: '#6B7280' }}>PE/VC terms explained</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg"
                style={{
                  color: '#9CA3AF',
                  background: '#1F2937',
                  border: '1px solid #374151',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#374151';
                  (e.currentTarget as HTMLButtonElement).style.color = '#F9FAFB';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1F2937';
                  (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF';
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-3" style={{ borderBottom: '1px solid #374151' }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    background: '#1F2937',
                    border: '1px solid #374151',
                    color: '#F9FAFB',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#6366F1')}
                  onBlur={e => (e.target.style.borderColor = '#374151')}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {filtered.map(entry => (
                <div
                  key={entry.term}
                  className="rounded-lg p-3"
                  style={{
                    background: hoveredTerm === entry.term ? '#263347' : '#1F2937',
                    border: `1px solid ${hoveredTerm === entry.term ? 'rgba(99,102,241,0.3)' : '#374151'}`,
                    transform: hoveredTerm === entry.term ? 'translateX(3px)' : 'translateX(0)',
                    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                    cursor: 'default',
                  }}
                  onMouseEnter={() => setHoveredTerm(entry.term)}
                  onMouseLeave={() => setHoveredTerm(null)}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: hoveredTerm === entry.term ? '#A5B4FC' : '#818CF8', transition: 'color 0.18s' }}>{entry.term}</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{entry.definition}</div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-sm py-8" style={{ color: '#6B7280' }}>No matching terms</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
