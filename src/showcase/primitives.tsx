import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";

// ── Scroll reveal ────────────────────────────────────────────────
// Fades + lifts children into view once. Respects reduced-motion.
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

// ── Count-up number ──────────────────────────────────────────────
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const reduce = useReducedMotion();
  // Reduced-motion users see the final value immediately (no effect setState).
  const [display, setDisplay] = useState(() => (reduce ? String(to) : "0"));

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, to, duration, mv, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ── FundSim wordmark logo (self-contained SVG) ───────────────────
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="fs-g" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0" stopColor="#818CF8" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="8"
          stroke="url(#fs-g)"
          strokeWidth="1.5"
        />
        <path
          d="M9 21V11h7M9 16h5"
          stroke="url(#fs-g)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 11l4 10 0-10"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-serif tracking-tight"
        style={{ fontSize: size * 0.78, color: "#F9FAFB", lineHeight: 1 }}
      >
        Fund<span style={{ fontStyle: "italic", color: "#818CF8" }}>Sim</span>
      </span>
    </span>
  );
}

// Hairline pill / eyebrow.
export function Eyebrow({
  children,
  accent = "#818CF8",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase"
      style={{
        background: `${accent}14`,
        color: accent,
        border: `1px solid ${accent}33`,
        letterSpacing: "0.12em",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: accent }}
      />
      {children}
    </span>
  );
}
