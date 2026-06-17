/* eslint-disable react-refresh/only-export-components */
// Shared layout primitives + a few quant-wide constants and number formatters.
// These tiny helpers are intentionally co-located with the layout they belong
// to; the fast-refresh rule (components-only exports) is disabled for that.
import React from "react";

export const QUANT_ACCENT = "#5b9dff";
export const QUANT_DIM = "rgba(91,157,255,0.08)";
export const QUANT_BORDER = "rgba(91,157,255,0.25)";
export const PANEL_BG = "#0e1014";
export const PANEL_BORDER = "#2b2d34";

// Two-column tool layout: a sticky controls rail on the left, content right.
// Mirrors the visual language of the PE/VC tabs (dark panels, gold→blue accent).
export function QuantLayout({
  title,
  subtitle,
  controls,
  children,
}: {
  title: string;
  subtitle: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
      <div className="mb-5">
        <h2
          className="font-serif text-2xl"
          style={{ color: "#ece9e2", marginBottom: 4 }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: "#7d808a" }}>
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
        <div
          className="rounded-xl p-4 lg:sticky lg:top-4"
          style={{ background: PANEL_BG, border: `1px solid ${PANEL_BORDER}` }}
        >
          <div className="flex flex-col gap-4">{controls}</div>
        </div>
        <div className="flex flex-col gap-5 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  children,
  right,
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: PANEL_BG, border: `1px solid ${PANEL_BORDER}` }}
    >
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#a6a8b0", letterSpacing: "0.08em" }}
          >
            {title}
          </h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// A formula callout — pairs the math with plain-English intuition. This is the
// "rigorous but legible" device that runs through every quant tab.
export function FormulaNote({
  formula,
  children,
}: {
  formula: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{
        background: QUANT_DIM,
        border: `1px solid ${QUANT_BORDER}`,
        color: "#cfd1d6",
      }}
    >
      <code
        className="block mb-1.5"
        style={{ color: QUANT_ACCENT, fontFamily: "monospace", fontSize: 12 }}
      >
        {formula}
      </code>
      <span style={{ color: "#9a9ca4" }}>{children}</span>
    </div>
  );
}

// Compact labeled number input for the controls rail.
export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "#a6a8b0", letterSpacing: "0.06em" }}
      >
        {label}
        {suffix ? ` (${suffix})` : ""}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="px-2.5 py-1.5 rounded-md text-sm"
        style={{
          background: "#141519",
          border: `1px solid ${PANEL_BORDER}`,
          color: "#ece9e2",
          outline: "none",
        }}
      />
    </label>
  );
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "#a6a8b0", letterSpacing: "0.06em" }}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className="flex-1 px-2 py-1.5 rounded-md text-xs font-semibold"
              style={{
                background: active ? QUANT_DIM : "transparent",
                border: `1px solid ${active ? QUANT_BORDER : PANEL_BORDER}`,
                color: active ? QUANT_ACCENT : "#7d808a",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const fmtUSD = (x: number) =>
  x.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
export const fmtPct = (x: number) => `${(x * 100).toFixed(2)}%`;
export const fmtNum = (x: number, d = 2) => x.toFixed(d);
