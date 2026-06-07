/**
 * Feature-flag resolution order:
 *   1. URL ?ff=name1,name2  (enables named flags for this page load)
 *   2. localStorage 'fundsim_flags'  (JSON {name: boolean})
 *   3. DEFAULTS below
 *
 * Heavier / DB-dependent features default OFF so a cold deploy is always safe.
 */

export type FlagName =
  | "startHere"
  | "stressTest"
  | "clubChallenge"
  | "assignmentMode";

const DEFAULTS: Record<FlagName, boolean> = {
  startHere: true,
  stressTest: true,
  clubChallenge: false, // requires DB schema additions
  assignmentMode: false, // requires DB schema additions
};

function getUrlFlags(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const param = new URLSearchParams(window.location.search).get("ff");
  if (!param) return new Set();
  return new Set(param.split(",").map((s) => s.trim()));
}

function getStorageFlags(): Partial<Record<FlagName, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("fundsim_flags");
    return raw ? (JSON.parse(raw) as Partial<Record<FlagName, boolean>>) : {};
  } catch {
    return {};
  }
}

export function isFlagEnabled(name: FlagName): boolean {
  if (getUrlFlags().has(name)) return true;
  const stored = getStorageFlags();
  if (name in stored) return stored[name]!;
  return DEFAULTS[name];
}
