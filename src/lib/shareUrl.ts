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

// ~8 KB is well above any legitimate encoded FundInputs payload (~500 bytes).
// Rejects oversized params before decoding to prevent a main-thread hang.
const MAX_ENCODED_BYTES = 8192;

// Allowed keys and their expected primitive types. Any key not listed here
// is silently dropped, preventing prototype pollution and unknown-field injection.
const FUND_INPUTS_SCHEMA: Record<
  string,
  "number" | "boolean" | "string" | "number[]"
> = {
  fundSize: "number",
  fundLife: "number",
  investmentPeriod: "number",
  managementFee: "number",
  carryPercentage: "number",
  hurdleRate: "number",
  gpCommitment: "number",
  avgHoldPeriod: "number",
  lossRatio: "number",
  avgExitMultiple: "number",
  exitDistribution: "string",
  totalProceeds: "number",
  waterfallType: "string",
  catchUpRate: "number",
  clawback: "boolean",
  dealMultiples: "number[]",
  spReturn: "number",
  numDeals: "number",
  followOnReservePercent: "number",
  fundStrategy: "string",
  vintageYear: "number",
};

/**
 * Decodes a base64url string back into a partial FundInputs object.
 * Returns null if the string is malformed or unsafe.
 */
export function decodeScenario(encoded: string): Partial<FundInputs> | null {
  // Guard against DoS via oversized param
  if (encoded.length > MAX_ENCODED_BYTES) return null;

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

    // Allowlist fields and validate types — drops __proto__, constructor, and
    // any key not in FundInputs to prevent prototype pollution and type confusion.
    const safe: Partial<FundInputs> = {};
    for (const [key, expectedType] of Object.entries(FUND_INPUTS_SCHEMA)) {
      if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
      const value = parsed[key];
      if (expectedType === "number[]") {
        if (
          Array.isArray(value) &&
          value.every((v: unknown) => typeof v === "number" && isFinite(v))
        ) {
          (safe as Record<string, unknown>)[key] = value;
        }
      } else if (expectedType === "number") {
        if (typeof value === "number" && isFinite(value)) {
          (safe as Record<string, unknown>)[key] = value;
        }
      } else if (typeof value === expectedType) {
        (safe as Record<string, unknown>)[key] = value;
      }
    }
    return safe;
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
