import React, { useState } from "react";
import { useProStatus } from "../lib/useProStatus";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function ProGate({ children, feature = "this feature" }: ProGateProps) {
  const { isPro, loading } = useProStatus();
  const [showModal, setShowModal] = useState(false);

  if (loading) return null;
  if (isPro) return <>{children}</>;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        style={{ display: "contents", cursor: "pointer" }}
        title={`Upgrade to FundSim Pro to unlock ${feature}`}
      >
        <span
          style={{
            opacity: 0.5,
            pointerEvents: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {children}
          <span style={{ fontSize: "9px", color: "#F59E0B" }}>PRO</span>
        </span>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 0 40px rgba(245,158,11,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                color: "#F59E0B",
                fontWeight: 700,
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              FundSim Pro
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#F9FAFB",
                marginBottom: "8px",
                fontFamily: "Georgia, serif",
              }}
            >
              Unlock {feature}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              FundSim Pro gives you Excel model downloads, unlimited deal
              scenarios, and the interview question bank — everything you need
              to walk into a PE or IB interview prepared.
            </p>

            <div style={{ marginBottom: "20px" }}>
              {[
                "Excel model download with live formulas",
                "Unlimited saved scenarios",
                "Interview question bank (150+ questions)",
                "Multi-case scenario comparison",
                "Ranked deal completion certificate",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "13px",
                    color: "#D1FAE5",
                  }}
                >
                  <span style={{ color: "#10B981", fontSize: "16px" }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <a
                href="mailto:nishkal.dachepelly@gmail.com?subject=FundSim Pro Access"
                style={{
                  flex: 1,
                  background: "#F59E0B",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                Get Pro Access — $149/yr
              </a>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #374151",
                  color: "#6B7280",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
