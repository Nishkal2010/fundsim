import posthog from "posthog-js";
import { safeStorageGet } from "./storage";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = "https://us.i.posthog.com";

function consentGiven(): boolean {
  return safeStorageGet("fundsim_analytics_consent") !== "deny";
}

function init(): void {
  if (!POSTHOG_KEY) return;
  // posthog.__loaded is set by the library after init — guard against double-init
  if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
  });
}

init();

export function captureEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (!POSTHOG_KEY || !consentGiven()) return;
  try {
    posthog.capture(name, props);
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[posthog] capture failed:", err);
  }
}

export function identifyUser(
  userId: string,
  traits?: Record<string, string>,
): void {
  if (!POSTHOG_KEY || !consentGiven()) return;
  try {
    posthog.identify(userId, traits);
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[posthog] identify failed:", err);
  }
}

export function resetUser(): void {
  if (!POSTHOG_KEY) return;
  try {
    posthog.reset();
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[posthog] reset failed:", err);
  }
}
