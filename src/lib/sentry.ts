import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
} else {
  console.warn("[FundSim] VITE_SENTRY_DSN not set — Sentry disabled");
}

export function captureError(
  error: Error,
  context?: Record<string, string>,
): void {
  if (!dsn) return;
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([k, v]) => scope.setTag(k, v));
    }
    Sentry.captureException(error);
  });
}
