import React from "react";
import { motion } from "framer-motion";
import { A } from "./theme";

export function TabLoadingFallback() {
  return <div style={{ color: "#6B7280", padding: "2rem" }}>Loading...</div>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: "#111827", border: "1px solid #1F2937", ...style }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif mb-1"
      style={{ fontSize: "22px", color: "#F9FAFB" }}
    >
      {children}
    </h2>
  );
}

export function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
      {children}
    </p>
  );
}

export function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="text-xs mb-1 font-medium"
        style={{ color: "#6B7280", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      <div
        className="text-xl font-bold font-serif"
        style={{ color: color ?? A.light }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm" style={{ color: "#9CA3AF" }}>
          {label}
        </label>
        <span className="text-sm font-bold" style={{ color: A.light }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: A.primary }}
      />
    </div>
  );
}

export function ScoreBar({
  label,
  score,
  max,
  color,
}: {
  label: string;
  score: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm" style={{ color: "#D1D5DB" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {Math.round(score)} / {max} pts
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "#1F2937" }}>
        <motion.div
          className="h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
