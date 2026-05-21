import React from "react";
import { captureError } from "../lib/sentry";

interface State {
  error: Error | null;
}

export class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; tabId: string },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[TabErrorBoundary] tab crash:", error, info);
    captureError(error, { boundary: "TabErrorBoundary", tabId: this.props.tabId });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "#9CA3AF",
          }}
        >
          <div style={{ fontSize: 13 }}>
            Something went wrong loading this tab.
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              background: "#1F2937",
              border: "1px solid #374151",
              borderRadius: 8,
              padding: "8px 18px",
              color: "#F9FAFB",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
