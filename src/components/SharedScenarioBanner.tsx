import { useEffect } from "react";

interface SharedScenarioBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SharedScenarioBanner({
  visible,
  onDismiss,
}: SharedScenarioBannerProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#065F46",
        color: "#fff",
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }}
    >
      <span>Shared scenario loaded — inputs applied</span>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          opacity: 0.8,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
