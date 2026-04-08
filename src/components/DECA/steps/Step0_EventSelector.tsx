import React from "react";
import { motion } from "framer-motion";
import { useDECA } from "../DECAFinanceSuite";
import { EVENT_CONFIG } from "../config/eventConfig";
import type { EventCode } from "../types/decaTypes";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function Step0_EventSelector() {
  const { state, dispatch } = useDECA();

  const handleSelect = (code: EventCode) => {
    dispatch({ type: "SET_EVENT", payload: code });
  };

  const events = Object.values(EVENT_CONFIG);

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: "2.5rem", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.35)",
            borderRadius: "999px",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              color: "#60a5fa",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            2025–26 DECA Guidelines
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            color: "#f9fafb",
            margin: "0 0 0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Select Your DECA Event
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "1rem",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          Each event has different financial requirements. Choose your event and
          the Finance Suite will configure the required sections automatically.
        </p>
      </motion.div>

      {/* Event Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {events.map((evt, idx) => {
          const isSelected = state.eventCode === evt.code;
          const isWritten = evt.format === "written";
          const accentColor = isWritten ? "#2563eb" : "#d4af37";
          const accentBg = isWritten
            ? "rgba(37,99,235,0.10)"
            : "rgba(212,175,55,0.08)";
          const accentBorder = isWritten
            ? "rgba(37,99,235,0.35)"
            : "rgba(212,175,55,0.35)";
          const accentGlow = isWritten
            ? "0 0 0 2px #2563eb, 0 0 24px rgba(37,99,235,0.25)"
            : "0 0 0 2px #d4af37, 0 0 24px rgba(212,175,55,0.20)";

          return (
            <motion.div
              key={evt.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: idx * 0.055 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(evt.code)}
              style={{
                background: isSelected
                  ? isWritten
                    ? "rgba(37,99,235,0.10)"
                    : "rgba(212,175,55,0.08)"
                  : "#111827",
                border: isSelected
                  ? `2px solid ${accentColor}`
                  : "2px solid #1f2937",
                borderRadius: "0.875rem",
                padding: "1.5rem",
                cursor: "pointer",
                boxShadow: isSelected
                  ? accentGlow
                  : "0 2px 8px rgba(0,0,0,0.35)",
                transition:
                  "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Top row: code badge + format tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "0.875rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: accentBg,
                    border: `1px solid ${accentBorder}`,
                    color: accentColor,
                    borderRadius: "0.35rem",
                    padding: "0.2rem 0.55rem",
                    letterSpacing: "0.06em",
                  }}
                >
                  {evt.code}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: isWritten ? "#60a5fa" : "#d4af37",
                    background: isWritten
                      ? "rgba(96,165,250,0.08)"
                      : "rgba(212,175,55,0.08)",
                    border: `1px solid ${isWritten ? "rgba(96,165,250,0.2)" : "rgba(212,175,55,0.2)"}`,
                    borderRadius: "999px",
                    padding: "0.18rem 0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {isWritten ? "Written Paper" : "Pitch Deck"}
                </span>
              </div>

              {/* Event name */}
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#f9fafb",
                  margin: "0 0 0.5rem",
                  lineHeight: 1.3,
                  paddingRight: isSelected ? "1.75rem" : 0,
                }}
              >
                {evt.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#9ca3af",
                  margin: "0 0 1rem",
                  lineHeight: 1.55,
                }}
              >
                {evt.description}
              </p>

              {/* Financial points */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid #1f2937",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Written Pts
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: accentColor,
                    }}
                  >
                    {evt.financialPointsWritten}
                  </div>
                </div>
                {evt.financialPointsPresentation > 0 && (
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Pres. Pts
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#9ca3af",
                      }}
                    >
                      {evt.financialPointsPresentation}
                    </div>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Page Limit
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    {evt.pageLimit}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "0.82rem",
          marginTop: "2rem",
        }}
      >
        Selecting an event will automatically advance to Step 1 and configure
        required financial sections.
      </motion.p>
    </div>
  );
}
