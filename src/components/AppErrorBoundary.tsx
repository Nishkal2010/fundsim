import React from "react";
import { captureError } from "../lib/sentry";

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Top-level error boundary. If any render in the app throws, we show a
 * recovery card instead of letting the browser fall through to a blank
 * page. The user can reload from here without rebuilding the whole app
 * mental model from scratch.
 */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("[FundSim] uncaught render error:", err, info);
    captureError(err, { boundary: "AppErrorBoundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0A0F1C",
            color: "#F9FAFB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: "#111827",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#F87171",
                letterSpacing: "0.18em",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              SOMETHING BROKE
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              The app hit an unexpected error.
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                lineHeight: 1.6,
                marginBottom: 18,
              }}
            >
              You can usually fix this by reloading. If it keeps happening, copy
              the error below and send it over — that will tell us exactly which
              component crashed.
            </p>
            <pre
              style={{
                background: "#0A0F1C",
                border: "1px solid #1F2937",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 11,
                color: "#F87171",
                fontFamily: "ui-monospace, monospace",
                overflow: "auto",
                marginBottom: 18,
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#10B981",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
