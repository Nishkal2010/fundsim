import { supabase } from "./supabase";

export interface DealShareSummary {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string; highlight?: boolean }>;
}

export interface DealSharePayload {
  simulator: "pe" | "vc" | "ib";
  tab: string;
  inputs: Record<string, unknown>;
  summary: DealShareSummary;
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
  return `${window.location.origin}/s/${encodeURIComponent(id)}`;
}

export function getShareIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("share");
}
