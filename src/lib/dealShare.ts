import { supabase } from "./supabase";

export interface DealShareSummary {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string; highlight?: boolean }>;
}

export interface AssignmentField {
  /** Field keys the student cannot change, e.g. ["carryPercentage","avgExitMultiple"] */
  locked: string[];
  /** Instructor's written question, max 500 chars */
  prompt: string;
  /** Student's written response, 80–120 words, present on submission rows only */
  defense?: string;
  /** ID of the originating assignment row — links submission back to assignment */
  sourceId?: string;
}

export interface DealSharePayload {
  simulator: "pe" | "vc" | "ib";
  tab: string;
  inputs: Record<string, unknown>;
  summary: DealShareSummary;
  /** Club identifier for club-scoped challenge submissions. Max 64 chars, alphanumeric/dash/underscore. */
  clubTag?: string;
  /** Assignment mode payload — present when this row is an instructor assignment or student submission */
  assignment?: AssignmentField;
}

export interface DealShare extends DealSharePayload {
  id: string;
  created_at: string;
}

export async function saveDealShare(
  payload: DealSharePayload,
): Promise<string> {
  // Direct anon insert is no longer allowed — the RLS policy was locked down
  // in migration 20260521_deal_shares_throttle.sql. All inserts go through
  // /api/share-create, which holds the service-role key and enforces per-IP
  // rate limits before writing to the DB.
  const res = await fetch("/api/share-create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const err = new Error("Rate limit exceeded — try again in a minute.");
      (err as Error & { status?: number }).status = 429;
      throw err;
    }
    throw new Error(body.error ?? `share-create returned ${res.status}`);
  }
  const { id } = await res.json();
  return id as string;
}

export async function getDealShare(id: string): Promise<DealShare | null> {
  const { data, error } = await supabase
    .from("deal_shares")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DealShare;
}

export function buildShareUrl(id: string): string {
  return `${window.location.origin}/?share=${encodeURIComponent(id)}`;
}

export function buildChallengeUrl(club?: string): string {
  const params = new URLSearchParams({ challenge: "1" });
  if (club)
    params.set("club", club.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, ""));
  return `${window.location.origin}/?${params.toString()}`;
}

export function getShareIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("share");
}
