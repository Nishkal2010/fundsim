import React, { useState } from "react";
import { useProStatus } from "../lib/useProStatus";
import { supabase } from "../lib/supabase";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
  description?: string;
}

async function startCheckout(): Promise<{ url?: string; error?: string }> {
  // Need the session JWT — getUser() alone doesn't give us the access token.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { error: "Please sign in first." };

  try {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: session.user.id,
        userEmail: session.user.email,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      return { error: data.error ?? "Could not start checkout." };
    }
    return { url: data.url };
  } catch {
    return { error: "Network error — please try again." };
  }
}

export function ProGate({
  children,
  feature = "this feature",
  description,
}: ProGateProps) {
  const { isPro, loading } = useProStatus();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    const { url, error } = await startCheckout();
    if (url) {
      window.location.href = url;
    } else {
      setCheckoutError(error ?? "Could not start checkout.");
      setCheckoutLoading(false);
    }
  }

  if (loading) return null;
  if (isPro) return <>{children}</>;

  const featureDescription =
    description ??
    "FundSim Pro gives you Excel model downloads, unlimited deal scenarios, and the interview question bank — everything you need to walk into a PE or IB interview prepared.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "rgba(17,24,39,0.8)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "12px",
        textAlign: "center",
        gap: "16px",
      }}
    >
      {/* Lock icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "#F59E0B",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Pro Feature
      </div>

      {/* Feature name */}
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#F9FAFB",
          margin: 0,
          fontFamily: "Georgia, serif",
        }}
      >
        {feature}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: "14px",
          color: "#9CA3AF",
          maxWidth: "360px",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {featureDescription}
      </p>

      {/* What's included */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-start",
          margin: "4px 0",
        }}
      >
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
              fontSize: "13px",
              color: "#D1FAE5",
            }}
          >
            <span style={{ color: "#10B981", fontSize: "16px", lineHeight: 1 }}>
              ✓
            </span>
            {item}
          </div>
        ))}
      </div>

      {/* Error */}
      {checkoutError && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#FCA5A5",
            maxWidth: "360px",
            width: "100%",
          }}
        >
          {checkoutError}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleUpgrade}
        disabled={checkoutLoading}
        style={{
          background: checkoutLoading ? "#92400E" : "#F59E0B",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "12px 28px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: checkoutLoading ? "wait" : "pointer",
          marginTop: "4px",
        }}
      >
        {checkoutLoading
          ? "Redirecting to checkout…"
          : "Upgrade to Pro — $149/yr"}
      </button>
    </div>
  );
}
