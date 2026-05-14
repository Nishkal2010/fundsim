/* eslint-disable @typescript-eslint/no-explicit-any */

// Creates a Stripe Checkout session for FundSim Pro and returns the URL.
// Client redirects to the URL; Stripe handles the payment UI; on success
// Stripe calls /api/stripe-webhook which flips profiles.is_pro = true.
//
// Required env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
// Origins allowed: fundsimulate.com + previews + localhost (mirrors /api/chat)

const ALLOWED_ORIGINS = new Set<string>([
  "https://fundsimulate.com",
  "https://www.fundsimulate.com",
  "http://localhost:5200",
  "http://127.0.0.1:5200",
]);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return new URL(origin).host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  const allowed = isAllowedOrigin(origin);
  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(allowed ? 204 : 403).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (!allowed) return res.status(403).json({ error: "Origin not allowed" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripeKey || !priceId) {
    console.error("[checkout] Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID");
    return res.status(500).json({ error: "Billing not configured" });
  }

  const { userId, userEmail } = req.body ?? {};
  if (typeof userId !== "string" || userId.length < 8 || userId.length > 64) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (
    userEmail !== undefined &&
    (typeof userEmail !== "string" || userEmail.length > 255)
  ) {
    return res.status(400).json({ error: "Invalid userEmail" });
  }

  const successUrl = (origin ?? "https://fundsimulate.com") + "/?pro=success";
  const cancelUrl = (origin ?? "https://fundsimulate.com") + "/?pro=cancel";

  // Stripe Checkout Sessions API — form-encoded body, server-to-server only.
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("success_url", successUrl);
  params.append("cancel_url", cancelUrl);
  params.append("client_reference_id", userId);
  params.append("metadata[user_id]", userId);
  if (userEmail) {
    params.append("customer_email", userEmail);
  }
  params.append("allow_promotion_codes", "true");

  try {
    const stripeRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!stripeRes.ok) {
      const errText = await stripeRes.text().catch(() => "");
      console.error("[checkout] Stripe error", stripeRes.status, errText);
      return res.status(502).json({ error: "Checkout failed" });
    }

    const session = (await stripeRes.json()) as { id: string; url: string };
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("[checkout] handler error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
