import { motion, useReducedMotion } from "framer-motion";

// Cinematic high-finance backdrop: deep navy, slow-drifting aurora glows,
// and a faint engineering grid. Fixed behind all content, pointer-events off.
export function Background() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background:
          "radial-gradient(1200px 800px at 80% -10%, rgba(99,102,241,0.10), transparent 60%)," +
          "radial-gradient(1000px 700px at 0% 10%, rgba(16,185,129,0.06), transparent 55%)," +
          "linear-gradient(180deg, #07090F 0%, #0A0F1C 40%, #090D17 100%)",
      }}
    >
      {/* Engineering grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 100% 70% at 50% 0%, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 70% at 50% 0%, black 40%, transparent 85%)",
        }}
      />
      {/* Drifting aurora orbs */}
      {!reduce && (
        <>
          <motion.div
            style={orb("rgba(99,102,241,0.18)", 620)}
            initial={{ x: "55%", y: "-10%" }}
            animate={{
              x: ["55%", "62%", "50%", "55%"],
              y: ["-10%", "0%", "-6%", "-10%"],
            }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={orb("rgba(16,185,129,0.12)", 520)}
            initial={{ x: "-5%", y: "30%" }}
            animate={{
              x: ["-5%", "4%", "-8%", "-5%"],
              y: ["30%", "22%", "34%", "30%"],
            }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={orb("rgba(245,158,11,0.08)", 460)}
            initial={{ x: "70%", y: "60%" }}
            animate={{
              x: ["70%", "64%", "74%", "70%"],
              y: ["60%", "66%", "56%", "60%"],
            }}
            transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}

function orb(color: string, size: number): React.CSSProperties {
  return {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    filter: "blur(120px)",
  };
}
