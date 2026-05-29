// Classic Node serverless function (NOT edge). Only api/og needs the edge
// runtime (for @vercel/og); keeping this one on Node means Vercel can't merge
// it into a shared edge bundle with api/og, which is what flagged @vercel/og
// as an unsupported module and broke every deploy.

// Known crawler user-agent substrings. These bots don't execute JavaScript,
// so the React SPA's <meta> tags are invisible to them. We serve a static HTML
// stub with proper OG tags instead, then JS-redirect humans to the real app.
const CRAWLERS = [
  "Twitterbot",
  "facebookexternalhit",
  "LinkedInBot",
  "Slackbot-LinkExpanding",
  "Slackbot",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "Googlebot",
  "bingbot",
  "Applebot",
  "iMessage",
  "Embedly",
  "SummaryBot",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(req: any, res: any) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const origin = `${proto}://${host}`;

  // req.query is populated by Vercel; fall back to parsing the URL.
  const rawId =
    (req.query && req.query.id) ??
    new URL(req.url, origin).searchParams.get("id") ??
    "";
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id || !UUID_RE.test(id)) {
    res.statusCode = 302;
    res.setHeader("Location", `${origin}/`);
    return res.end();
  }

  const ua = (req.headers["user-agent"] as string) ?? "";
  const isCrawler = CRAWLERS.some((bot) => ua.includes(bot));

  const appUrl = `${origin}/?share=${encodeURIComponent(id)}`;
  const ogImageUrl = `${origin}/api/og?id=${encodeURIComponent(id)}`;

  if (!isCrawler) {
    res.statusCode = 302;
    res.setHeader("Location", appUrl);
    return res.end();
  }

  // Crawler — return minimal HTML with OG tags. The <meta http-equiv="refresh">
  // handles any bots that do execute JS; humans are handled by the redirect above.
  const safeApp = escapeHtml(appUrl);
  const safeImg = escapeHtml(ogImageUrl);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>FundSim Deal Analysis</title>
<meta property="og:type" content="website">
<meta property="og:url" content="${safeApp}">
<meta property="og:title" content="FundSim Deal Analysis">
<meta property="og:description" content="Interactive PE · VC · IB deal simulation — run the model at fundsimulate.com">
<meta property="og:image" content="${safeImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="FundSim">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@fundsim">
<meta name="twitter:title" content="FundSim Deal Analysis">
<meta name="twitter:description" content="Interactive PE · VC · IB deal simulation — run the model at fundsimulate.com">
<meta name="twitter:image" content="${safeImg}">
<meta http-equiv="refresh" content="0;url=${safeApp}">
</head>
<body>
<a href="${safeApp}">View deal analysis on FundSim</a>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  return res.end(html);
}
