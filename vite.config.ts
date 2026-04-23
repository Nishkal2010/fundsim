import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
  server: {
    port: 5200,
    headers: securityHeaders,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
    },
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
