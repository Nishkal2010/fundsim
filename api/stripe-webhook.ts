/* eslint-disable @typescript-eslint/no-explicit-any */

// Stripe webhook handler. Verifies the signature, then on
// `checkout.session.completed` flips profiles.is_pro = true for the
// user_id stored in session metadata.
//
// Required env vars:
//   STRIPE_WEBHOOK_SECRET       — from Stripe dashboard > Webhooks > endpoint
//   VITE_SUPABASE_URL           — same URL used by the client
//   SUPABASE_SERVICE_ROLE_KEY   — server-only key, bypasses RLS to update is_pro
//
// Stripe dashboard config: point the webhook at
//   https://fundsimulate.com/api/stripe-webhook
// and subscribe to `checkout.session.completed` (and optionally
// `customer.subscription.deleted` to downgrade users).

import crypto from "node:crypto";

// Vercel auto-parses JSON bodies, but Stripe requires the raw body for
// signature verification. This config tells Vercel to deliver the raw
// stream so we can read and hash the unmodified bytes.
export const config = { api: { bodyParser: false } };

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function verifySignature(
  rawBody: Buffer,
  sigHeader: string | undefined,
  secret: string,
): boolean {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => {
      const idx = kv.indexOf("=");
      return [kv.slice(0, idx), kv.slice(idx + 1)];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject signatures more than 5 minutes old to prevent replay.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > 300) return false;

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  // Timing-safe comparison (lengths must match for timingSafeEqual).
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function upsertIsPro(userId: string, isPro: boolean): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin credentials not configured");
  }

  // Upsert via PostgREST: insert if missing, update is_pro if present.
  const res = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: userId, is_pro: isPro }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Supabase upsert failed: ${res.status} ${errText}`);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (err) {
    console.error("[webhook] body read failed", err);
    return res.status(400).json({ error: "Cannot read body" });
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!verifySignature(rawBody, sig, secret)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const userId = session?.metadata?.user_id ?? session?.client_reference_id;
      if (typeof userId === "string" && userId.length >= 8) {
        await upsertIsPro(userId, true);
        console.log("[webhook] upgraded user", userId);
      } else {
        console.warn(
          "[webhook] checkout.session.completed without user_id",
          session?.id,
        );
      }
    } else if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.canceled"
    ) {
      // When a subscription ends, drop Pro. user_id comes from the original
      // session metadata; subscription itself doesn't always carry it, so
      // optionally look it up via the customer if you store that. For v1,
      // we only handle downgrades when user_id is on the subscription.
      const sub = event.data?.object;
      const userId = sub?.metadata?.user_id;
      if (typeof userId === "string" && userId.length >= 8) {
        await upsertIsPro(userId, false);
        console.log("[webhook] downgraded user", userId);
      }
    }
  } catch (err: any) {
    console.error("[webhook] handler error", err);
    // Return 500 so Stripe retries — but only on processing failures, not
    // on bad input (handled above with 400).
    return res.status(500).json({ error: "Processing failed" });
  }

  return res.status(200).json({ received: true });
}
