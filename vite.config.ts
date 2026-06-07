import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
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
  plugins: [
    react(),
    devApiPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "FundSim",
        short_name: "FundSim",
        description: "PE, VC & IB simulators. Free finance education.",
        theme_color: "#0A0F1C",
        background_color: "#0A0F1C",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        globPatterns: [
          "index.html",
          "assets/index-*.{js,css}",
          "assets/vendor-react-*.{js,css}",
          "assets/vendor-motion-*.{js,css}",
          "assets/vendor-supabase-*.{js,css}",
          "**/*.{ico,svg,woff2,webmanifest,json}",
        ],
        globIgnores: ["**/*.map"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.origin === "https://api.anthropic.com",
            handler: "NetworkOnly" as const,
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith("/api/"),
            handler: "NetworkOnly" as const,
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.hostname.endsWith(".supabase.co"),
            handler: "NetworkOnly" as const,
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith("/assets/"),
            handler: "StaleWhileRevalidate" as const,
            options: {
              cacheName: "fundsim-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  define: {
    // Stamped at build time; StatusPage reads this so "Last updated" is never stale
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    ),
  },
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
            id.includes("xlsx-js-style") ||
            id.includes("xlsx") ||
            id.includes("/lib/excelExport")
          )
            return "feature-excel";
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
