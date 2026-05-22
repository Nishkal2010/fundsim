export const config = { runtime: "edge" };

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

export default function handler(req: Request): Response {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const origin = url.origin;

  if (!id || !UUID_RE.test(id)) {
    return Response.redirect(`${origin}/`, 302);
  }

  const ua = req.headers.get("user-agent") ?? "";
  const isCrawler = CRAWLERS.some((bot) => ua.includes(bot));

  const appUrl = `${origin}/?share=${encodeURIComponent(id)}`;
  const ogImageUrl = `${origin}/api/og?id=${encodeURIComponent(id)}`;

  if (!isCrawler) {
    return Response.redirect(appUrl, 302);
  }

  // Crawler — return minimal HTML with OG tags. The <meta http-equiv="refresh">
  // handles any bots that do execute JS; humans are handled by the redirect above.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>FundSim Deal Analysis</title>
<meta property="og:type" content="website">
<meta property="og:url" content="${appUrl}">
<meta property="og:title" content="FundSim Deal Analysis">
<meta property="og:description" content="Interactive PE · VC · IB deal simulation — run the model at fundsimulate.com">
<meta property="og:image" content="${ogImageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="FundSim">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@fundsim">
<meta name="twitter:title" content="FundSim Deal Analysis">
<meta name="twitter:description" content="Interactive PE · VC · IB deal simulation — run the model at fundsimulate.com">
<meta name="twitter:image" content="${ogImageUrl}">
<meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body>
<a href="${appUrl}">View deal analysis on FundSim</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
