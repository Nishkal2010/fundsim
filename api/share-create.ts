// Proxies deal_shares inserts from the client.
//
// Why this exists: the deal_shares table previously allowed open anon inserts,
// making it trivially floodable. This endpoint is the only insert path now —
// it enforces per-IP rate limits and validates payload size before writing
// via the service-role key. The client's anon key can still SELECT (read
// shared links), but can no longer INSERT directly.

const ALLOWED_ORIGINS = new Set<string>([
  "https://fundsimulate.com",
  "https://www.fundsimulate.com",
  "http://localhost:5200",
  "http://127.0.0.1:5200",
]);
const ALLOWED_ORIGIN_SUFFIX = ".vercel.app";

const ALLOWED_SIMULATORS = new Set(["pe", "vc", "ib"]);

// Per-field size cap matches the DB check constraint from
// 20260513_security_hardening.sql — validate here before the round-trip.
const MAX_FIELD_BYTES = 32_768; // 32 KB

// Rate limits: tight enough to stop scripted flooding, loose enough that a
// real user sharing multiple tabs in a session isn't blocked.
//   5 per minute  — stops burst abuse within a single warm function instance.
//   20 per hour   — cumulative cap across the rolling hour window.
// These are in-process only (serverless = ephemeral), which is the same
// trade-off accepted in api/chat.ts. Good enough to slow scripted attacks;
// pair with Vercel Edge rate limiting for stronger guarantees.
const LIMIT_PER_MINUTE = 5;
const LIMIT_PER_HOUR = 20;
const WINDOW_MINUTE_MS = 60_000;
const WINDOW_HOUR_MS = 3_600_000;

interface Bucket {
  minuteCount: number;
  minuteResetAt: number;
  hourCount: number;
  hourResetAt: number;
}

const rateBuckets = new Map<string, Bucket>();

function rateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic eviction: sweep expired entries every EVICTION_INTERVAL calls.
  requestCount += 1;
  if (requestCount % EVICTION_INTERVAL === 0) evictBuckets();

  let b = rateBuckets.get(ip);
  if (!b) {
    // If already at cap, evict before inserting a new entry.
    if (rateBuckets.size >= MAX_BUCKETS) evictBuckets();
    b = {
      minuteCount: 0,
      minuteResetAt: now + WINDOW_MINUTE_MS,
      hourCount: 0,
      hourResetAt: now + WINDOW_HOUR_MS,
    };
    rateBuckets.set(ip, b);
  }
  if (b.minuteResetAt < now) {
    b.minuteCount = 0;
    b.minuteResetAt = now + WINDOW_MINUTE_MS;
  }
  if (b.hourResetAt < now) {
    b.hourCount = 0;
    b.hourResetAt = now + WINDOW_HOUR_MS;
  }
  b.minuteCount += 1;
  b.hourCount += 1;
  return b.minuteCount <= LIMIT_PER_MINUTE && b.hourCount <= LIMIT_PER_HOUR;
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return new URL(origin).host.endsWith(ALLOWED_ORIGIN_SUFFIX);
  } catch {
    return false;
  }
}

// Eviction constants for the in-process rate bucket map.
// Every EVICTION_INTERVAL requests we sweep expired entries; if the map is
// still at MAX_BUCKETS after the sweep we drop the oldest entry (simple LRU).
const MAX_BUCKETS = 10_000;
const EVICTION_INTERVAL = 100;
let requestCount = 0;

function evictBuckets(): void {
  const now = Date.now();
  // Delete every entry whose hour window has fully expired.
  for (const [ip, b] of rateBuckets) {
    if (b.hourResetAt < now) rateBuckets.delete(ip);
  }
  // If still at cap, drop the single entry with the smallest hourResetAt
  // (it is closest to expiry and therefore the "oldest" by our definition).
  if (rateBuckets.size >= MAX_BUCKETS) {
    let oldestIp = "";
    let oldestReset = Infinity;
    for (const [ip, b] of rateBuckets) {
      if (b.hourResetAt < oldestReset) {
        oldestReset = b.hourResetAt;
        oldestIp = ip;
      }
    }
    if (oldestIp) rateBuckets.delete(oldestIp);
  }
}

function getClientIp(req: any): string {
  // x-real-ip is set by Vercel to the actual client IP — most reliable.
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();

  // Fallback: take the RIGHTMOST entry in x-forwarded-for. The leftmost value
  // is attacker-controlled (they can prepend arbitrary IPs); the rightmost is
  // the address the Vercel edge actually saw, which cannot be spoofed.
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") {
    const parts = fwd.split(",");
    return parts[parts.length - 1].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function byteLength(s: string): number {
  // TextEncoder is available in both Node 18+ and edge runtimes.
  return new TextEncoder().encode(s).length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  const allowed = isAllowedOrigin(origin);

  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(allowed ? 204 : 403).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowed) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (!rateLimit(getClientIp(req))) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[share-create] Supabase env vars not configured");
    return res.status(500).json({ error: "Service unavailable" });
  }

  const body = req.body ?? {};
  const { simulator, tab, inputs, summary } = body;

  if (typeof simulator !== "string" || !ALLOWED_SIMULATORS.has(simulator)) {
    return res.status(400).json({ error: "Invalid simulator" });
  }
  if (tab !== undefined && typeof tab !== "string") {
    return res.status(400).json({ error: "Invalid tab" });
  }
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    return res.status(400).json({ error: "inputs must be an object" });
  }
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return res.status(400).json({ error: "summary must be an object" });
  }

  // Enforce the same 32 KB per-field cap that the DB constraint checks,
  // so we catch oversized payloads before the round-trip.
  const inputsJson = JSON.stringify(inputs);
  const summaryJson = JSON.stringify(summary);
  if (byteLength(inputsJson) > MAX_FIELD_BYTES) {
    return res.status(400).json({ error: "inputs payload too large" });
  }
  if (byteLength(summaryJson) > MAX_FIELD_BYTES) {
    return res.status(400).json({ error: "summary payload too large" });
  }

  // Insert via the REST API using the service-role key. The service role
  // bypasses RLS, which is the only way to insert now that the anon-insert
  // policy has been dropped in 20260521_deal_shares_throttle.sql.
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/deal_shares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        simulator,
        tab: tab ?? "",
        inputs,
        summary,
      }),
    });

    if (!response.ok) {
      // Parse only to extract a safe error code — never log the raw body,
      // which may echo back request content including auth headers.
      let errCode = "unknown";
      try {
        const errJson = await response.json();
        errCode = errJson?.code ?? errJson?.error ?? "unknown";
      } catch {
        // non-JSON body — errCode stays "unknown"
      }
      console.error("[share-create] supabase error", response.status, errCode);
      return res.status(502).json({ error: "Failed to save share" });
    }

    const rows = await response.json();
    const id: string = Array.isArray(rows) ? rows[0]?.id : rows?.id;
    if (!id) {
      console.error("[share-create] no id returned from supabase", rows);
      return res.status(502).json({ error: "Failed to save share" });
    }

    return res.status(201).json({ id });
  } catch (err: any) {
    // Log only name + message — the full err object can include the request
    // context and expose the Authorization header in logs.
    console.error("[share-create] handler error", err?.name, err?.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
