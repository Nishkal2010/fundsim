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

export async function saveDealShare(payload: DealSharePayload): Promise<string> {
  const { data, error } = await supabase
    .from("deal_shares")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
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
  return `${window.location.origin}?share=${id}`;
}

export function getShareIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("share");
}
