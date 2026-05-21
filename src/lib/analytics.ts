import { track } from "@vercel/analytics/react";
import { safeStorageGet, safeStorageSet } from "./storage";

function consentGiven(): boolean {
  return safeStorageGet("fundsim_analytics_consent") !== "deny";
}

export function setAnalyticsConsent(allow: boolean): void {
  safeStorageSet("fundsim_analytics_consent", allow ? "allow" : "deny");
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
