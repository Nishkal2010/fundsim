import React from "react";

const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #1F2937 25%, #2A3441 50%, #1F2937 75%)",
  backgroundSize: "800px 100%",
  animation: "skeleton-shimmer 1.4s ease-in-out infinite",
};

function Bone({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ borderRadius: 6, ...shimmerStyle, ...style }}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
      style={{
        background: "#0D1220",
        minHeight: "60vh",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header strip */}
      <Bone style={{ height: 32, width: "68%" }} />

      {/* 3 metric cards */}
      <div style={{ display: "flex", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 96,
              borderRadius: 8,
              background: "#111827",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Bone style={{ height: 12, width: "55%" }} />
            <Bone style={{ height: 28, width: "40%" }} />
            <Bone style={{ height: 10, width: "70%" }} />
          </div>
        ))}
      </div>

      {/* Chart area — 180px keeps this neutral across tabs */}
      <div
        style={{
          height: 180,
          borderRadius: 8,
          background: "#111827",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Bone style={{ height: 14, width: "30%" }} />
        <Bone style={{ flex: 1, borderRadius: 4 }} />
      </div>
    </div>
  );
}
