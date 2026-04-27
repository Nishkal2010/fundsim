/* eslint-disable @typescript-eslint/no-explicit-any */
const MAX_TOKENS: Record<string, number> = {
  tutor: 200,
  founder: 150,
  pe_seller: 150,
  ib_client: 150,
  breakdown: 600,
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const { mode, messages, systemPrompt } = req.body ?? {};
  if (!mode || !messages)
    return res.status(400).json({ error: "Missing mode or messages" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: MAX_TOKENS[mode] ?? 200,
        system: systemPrompt ?? "",
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content?.[0]?.text ?? "" });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message ?? "Internal server error" });
  }
}
