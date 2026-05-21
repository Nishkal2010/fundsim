import { track } from "@vercel/analytics/react";

function consentGiven(): boolean {
  try {
    return localStorage.getItem("fundsim_analytics_consent") !== "deny";
  } catch {
    return true;
  }
}

export function setAnalyticsConsent(allow: boolean): void {
  try {
    localStorage.setItem("fundsim_analytics_consent", allow ? "allow" : "deny");
  } catch {
    /* localStorage unavailable */
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
) {
  if (!consentGiven()) return;
  try {
    track(name, props);
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[analytics] track failed:", err);
  }
}
