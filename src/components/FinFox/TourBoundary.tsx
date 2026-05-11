import React from "react";

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Local error boundary specifically for the FinFox overlay components
 * (GuidedTour, ChatPanel, FinFoxMascot). If any of these throw during
 * render they get caught here and silently unmounted, leaving the rest
 * of the app fully functional instead of producing a blank screen.
 */
export class TourBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("[FinFox tour] crashed:", err, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
