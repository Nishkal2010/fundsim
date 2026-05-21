# Environment Variables — Vercel Setup Checklist

Two `VITE_` public env vars need to be added to Vercel for PostHog analytics and Sentry error tracking. These are already committed to the codebase as references; the actual values must be set in Vercel so they are injected at build time.

---

## Variables to add

```
VITE_POSTHOG_KEY=phc_mGMh4eSzriYEc5sSWAbjk53U9LBgJXdG6b42KY4AjN6x
VITE_SENTRY_DSN=https://5ef01499fd99f9f68950276d923fc3ae@o4511425912766464.ingest.us.sentry.io/4511425953136640
```

**Note:** `VITE_` prefix means these are embedded into the client bundle at build time. They are not secret — PostHog project keys and Sentry DSNs are designed to be public. Do not put them in the `VITE_` prefix if they were meant to be server-only.

---

## Steps to add in Vercel dashboard

- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard) and open the **fundsim** project
- [ ] Click **Settings** → **Environment Variables**
- [ ] Add `VITE_POSTHOG_KEY`:
  - Name: `VITE_POSTHOG_KEY`
  - Value: `phc_mGMh4eSzriYEc5sSWAbjk53U9LBgJXdG6b42KY4AjN6x`
  - Environments: check **Production**, **Preview**, and **Development**
  - Click **Save**
- [ ] Add `VITE_SENTRY_DSN`:
  - Name: `VITE_SENTRY_DSN`
  - Value: `https://5ef01499fd99f9f68950276d923fc3ae@o4511425912766464.ingest.us.sentry.io/4511425953136640`
  - Environments: check **Production**, **Preview**, and **Development**
  - Click **Save**
- [ ] Trigger a new deployment (push a commit or click **Redeploy** on the latest deployment) so the build picks up the new vars
- [ ] Verify: after deploy, open the browser console on fundsimulate.com — PostHog should fire a `$pageview` event and Sentry should initialize without a "DSN not configured" warning

---

## Why these are needed

| Variable           | Service | Purpose                                                                  |
| ------------------ | ------- | ------------------------------------------------------------------------ |
| `VITE_POSTHOG_KEY` | PostHog | Tracks pageviews, feature usage, and funnel events for product analytics |
| `VITE_SENTRY_DSN`  | Sentry  | Captures JavaScript errors and performance traces in production          |

Both services have free tiers that cover FundSim's current traffic.
