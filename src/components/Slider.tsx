import React, { useRef, useEffect, useCallback } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  tooltip?: string;
}

export function Slider({ label, value, min, max, step = 1, format, onChange }: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const progress = ((value - min) / (max - min)) * 100;

  // Keep the CSS custom property in sync so the filled track updates
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.setProperty('--range-progress', `${progress}%`);
    }
  }, [progress]);

  // Allow clicking anywhere on the track wrapper to jump the thumb there
  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      // Snap to nearest step
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, parseFloat(stepped.toFixed(10))));
      onChange(clamped);
    },
    [min, max, step, onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label + value badge */}
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: '#9CA3AF', letterSpacing: '0.06em' }}
        >
          {label}
        </label>
        <span
          className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded transition-colors duration-150"
          style={{
            background: '#1F2937',
            color: '#818CF8',
            border: '1px solid #374151',
            minWidth: '44px',
            textAlign: 'center',
          }}
        >
          {format(value)}
        </span>
      </div>

      {/* Clickable track wrapper — large hit area so any click on the bar works */}
      <div
        className="relative select-none"
        style={{ height: '18px', cursor: 'pointer' }}
        onClick={handleTrackClick}
      >
        {/* Visual track background */}
        <div
          className="absolute left-0 right-0 rounded-full pointer-events-none"
          style={{
            height: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#1F2937',
          }}
        />
        {/* Filled portion */}
        <div
          className="absolute left-0 rounded-full pointer-events-none transition-all duration-75"
          style={{
            height: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
          }}
        />
        {/* Native range input — sits on top, transparent, handles drag */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0"
          style={{
            height: '18px',
            cursor: 'pointer',
            zIndex: 2,
          }}
          onClick={e => e.stopPropagation()} // let the wrapper handle clicks
        />
        {/* Custom visible thumb */}
        <div
          className="absolute pointer-events-none transition-transform duration-75"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#6366F1',
            border: '2.5px solid #0A0F1C',
            boxShadow: '0 0 0 2px #6366F1, 0 2px 8px rgba(99,102,241,0.4)',
            top: '50%',
            left: `calc(${progress}% - 9px)`,
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Min / max labels */}
      <div className="flex justify-between" style={{ fontSize: '10px', color: '#6B7280' }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
