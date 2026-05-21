import type { FundInputs } from "../types/fund";

/**
 * Encodes fund inputs into a compact base64url string suitable for a URL param.
 * Only includes fields that differ from the default to keep URLs short.
 */
export function encodeScenario(inputs: FundInputs): string {
  const compact = JSON.stringify(inputs);
  // btoa requires latin1; encodeURIComponent handles the full unicode range
  return btoa(unescape(encodeURIComponent(compact)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes a base64url string back into a partial FundInputs object.
 * Returns null if the string is malformed or unsafe.
 */
export function decodeScenario(encoded: string): Partial<FundInputs> | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return parsed as Partial<FundInputs>;
  } catch {
    return null;
  }
}

/** Builds the full shareable URL for the current model state. */
export function buildShareUrl(inputs: FundInputs): string {
  const encoded = encodeScenario(inputs);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("model", encoded);
  return url.toString();
}

/** Reads the ?model= param from the current URL, if present. */
export function getSharedScenario(): Partial<FundInputs> | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("model");
    if (!encoded) return null;
    return decodeScenario(encoded);
  } catch {
    return null;
  }
}
