/* eslint-disable @typescript-eslint/no-explicit-any */

// Structured health endpoint for the overnight agent (and uptime monitors).
// Returns 200 with a JSON body whenever the function runs to completion;
// individual checks may report `ok: false` inside the body. Callers should
// treat HTTP 200 + `ok: true` as the only green state.

export const config = { runtime: "edge" };

const ANTHROPIC_PING_URL = "https://api.anthropic.com/v1/messages";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";

async function checkAnthropic(): Promise<{
  ok: boolean;
  note: string;
  latency_ms?: number;
}> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, note: "ANTHROPIC_API_KEY not set" };

  // Cheapest possible call: 1 token in, 1 token out, Haiku.
  const t0 = Date.now();
  try {
    const r = await fetch(ANTHROPIC_PING_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "ok" }],
      }),
    });
    const latency = Date.now() - t0;
    if (!r.ok)
      return { ok: false, note: `upstream ${r.status}`, latency_ms: latency };
    return { ok: true, note: "ok", latency_ms: latency };
  } catch (e: any) {
    return { ok: false, note: `error: ${e.message ?? e}` };
  }
}

async function checkSupabase(): Promise<{
  ok: boolean;
  note: string;
  latency_ms?: number;
}> {
  if (!SUPABASE_URL) return { ok: false, note: "VITE_SUPABASE_URL not set" };
  const t0 = Date.now();
  try {
    // /auth/v1/health is unauth and returns 200 when the Supabase project is up.
    const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: "GET",
      // Supabase requires an apikey header even for /health.
      headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY ?? "" },
    });
    const latency = Date.now() - t0;
    return {
      ok: r.ok,
      note: r.ok ? "ok" : `status ${r.status}`,
      latency_ms: latency,
    };
  } catch (e: any) {
    return { ok: false, note: `error: ${e.message ?? e}` };
  }
}

export default async function handler(req: any) {
  // Same-origin or no-origin (curl, GH Actions) only. Mirrors /api/chat's posture.
  const origin = req.headers?.get?.("origin") ?? "";
  const allowed =
    !origin ||
    origin.endsWith("fundsimulate.com") ||
    origin.endsWith(".vercel.app") ||
    origin.startsWith("http://localhost");
  if (origin && !allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "Origin not allowed" }),
      {
        status: 403,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const [anthropic, supabase] = await Promise.all([
    checkAnthropic(),
    checkSupabase(),
  ]);

  const ok = anthropic.ok && supabase.ok;
  const body = {
    ok,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    region: process.env.VERCEL_REGION ?? "unknown",
    checks: { anthropic, supabase },
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
