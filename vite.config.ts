import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// Loads ./api/*.ts handlers as middleware in dev so that `npm run dev`
// can serve the same serverless endpoints Vercel runs in production —
// without needing `vercel dev` or a second process on port 3002.
function devApiPlugin(): PluginOption {
  return {
    name: "fundsim-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const endpoint = req.url.split("?")[0].replace(/^\/api\//, "");
        try {
          const mod = await server.ssrLoadModule(`/api/${endpoint}.ts`);
          const handler = mod.default;
          if (typeof handler !== "function") return next();

          // Buffer request body and parse JSON, mirroring Vercel's behavior.
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const raw = Buffer.concat(chunks).toString("utf8");
          (req as unknown as { body: unknown }).body = raw
            ? JSON.parse(raw)
            : {};

          // Adapt Node's ServerResponse to the minimal Vercel res shape.
          const vercelRes = res as unknown as {
            status: (c: number) => typeof vercelRes;
            json: (b: unknown) => void;
            setHeader: (n: string, v: string) => void;
            end: (b?: string) => void;
          };
          vercelRes.status = (code: number) => {
            res.statusCode = code;
            return vercelRes;
          };
          vercelRes.json = (body: unknown) => {
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(body));
          };

          await handler(req, vercelRes);
        } catch (err) {
          console.error("[dev-api] handler error:", err);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com",
    "font-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5200,
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          )
            return "vendor-react";
          if (id.includes("node_modules/recharts")) return "vendor-charts";
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/@supabase")) return "vendor-supabase";
        },
      },
    },
  },
});
