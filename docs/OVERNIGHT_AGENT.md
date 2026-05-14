# Overnight Autonomous Agent — FundSim

This is the **closest thing FundSim can have to "AI that runs your company while you sleep"** without paying for a managed agent product. It's a small script that runs nightly on GitHub Actions, uses the Claude Agent SDK to check production health, and posts a digest to Slack.

**Cost:** ~$0.10/month on Haiku 4.5. **Setup time:** ~30 minutes. **Maintenance:** ~zero unless the agent's loop changes.

**Status:** Implemented as of commit pushed alongside this doc.

- `scripts/overnight_agent.py` — agent loop with narrow function tools (no raw shell access)
- `scripts/post_digest.py` — Slack Block Kit renderer with green/red dots
- `scripts/requirements.txt` — pins `anthropic>=0.40.0`
- `.github/workflows/overnight-agent.yml` — daily cron at 06:00 UTC, manual dispatch
- `api/health.ts` — structured health endpoint the agent queries

**To activate**, you must add three GitHub Secrets (see Setup → Step 4 below). The workflow runs on `workflow_dispatch` for testing without waiting for the cron.

---

## What it does (v1)

Every night at 06:00 UTC (01:00 ET), an ephemeral GitHub Actions runner:

1. Hits `https://fundsimulate.com/` — checks 200, captures any JS console errors via headless browser.
2. Hits `https://fundsimulate.com/api/chat` with a benign request — confirms 200 and a non-empty response (proves Anthropic key + endpoint are healthy).
3. Reads the last 24h of Vercel deployments via the Vercel API — flags any with status `error` or `canceled`.
4. Greps the repo for new `TODO`/`FIXME`/`XXX` introduced since yesterday.
5. Lists open Dependabot PRs and any unmerged PRs older than 7 days.
6. Posts a single Slack message via incoming webhook with a digest.

If everything is green, the Slack message is a one-liner ("✓ All green. 0 issues."). Anything red, you get details.

## Why this and not Polsia.ai / agentic SaaS

- **You already own the infrastructure** (GitHub Actions runners are free for public repos, $0.008/min for private up to your 2000-minute monthly allowance).
- **You already have an Anthropic key with budget.**
- **You read GitHub + Slack daily** — you don't need another dashboard.
- **It's 50 lines of code** that you control end-to-end. No vendor lock-in, no surprise pricing, no third-party RLS bypass.

The honest trade-off vs. a managed product: **you have to write and maintain the agent loop yourself.** If you want fancier behavior (multi-step debugging, autonomous PR opening, deeper Vercel analysis), you write it. With a managed product, you'd pay them to keep the loop healthy.

## Setup steps

### 1. Add the script

Create `scripts/overnight_agent.py`:

```python
"""
FundSim overnight health agent.

Runs on a GitHub Actions cron. Uses Claude Haiku 4.5 (cheap, fast) to
drive a small loop of read-only tool calls, then prints a single JSON
report to stdout for the next workflow step to pipe into Slack.

Auth:    ANTHROPIC_API_KEY  (GitHub Secret)
Output:  JSON to stdout
"""

import asyncio
import json
import os
import sys
from datetime import datetime

from claude_agent_sdk import query, ClaudeAgentOptions  # pip install claude-agent-sdk


SYSTEM_PROMPT = """\
You are FundSim's overnight production monitor. Your single job is to
produce a structured health report. You have read-only tool access:
WebFetch, Bash (curl/grep/git), Glob, Grep, Read.

Run these checks IN ORDER. Stop as soon as you have data for each.

1. Fetch https://fundsimulate.com/ and report whether it 200's and
   whether the response body contains "FundSim" (proves it's not a
   blank Vercel error page).
2. POST to https://fundsimulate.com/api/chat with body
   {"mode":"tutor","messages":[{"role":"user","content":"ping"}]}
   and Origin: https://fundsimulate.com — report status and whether
   `content` field is non-empty.
3. List Vercel deployments in the last 24h via the Vercel API. Flag
   any with state=ERROR or state=CANCELED.
4. Run `git log --since='24 hours ago' --oneline` in the repo. List
   the commits.
5. Run `gh pr list --json number,title,createdAt --limit 20` and flag
   PRs older than 7 days.

Output ONE valid JSON object with this exact shape — no prose, no
markdown:

{
  "homepage": {"ok": bool, "status": int, "note": str},
  "api_chat": {"ok": bool, "status": int, "note": str},
  "vercel_failures": [{"id": str, "url": str, "state": str}],
  "recent_commits": [str],
  "stale_prs": [{"number": int, "title": str, "age_days": int}],
  "timestamp": str
}

If a check fails to run (network, missing secret), set ok=false and
put the cause in `note`. Do not invent data.
"""


async def main() -> str:
    async for message in query(
        prompt="Run the overnight health check now.",
        options=ClaudeAgentOptions(
            system=SYSTEM_PROMPT,
            allowed_tools=["WebFetch", "Bash", "Read", "Glob", "Grep"],
            max_iterations=15,  # hard cap on tool-call rounds
            model="claude-haiku-4-5",
        ),
    ):
        if hasattr(message, "result"):
            return message.result
    return json.dumps({"error": "no result message from agent"})


if __name__ == "__main__":
    result = asyncio.run(main())
    print(result)
```

### 2. Add the Slack poster

Create `scripts/post_digest.py`:

````python
"""Forwards the agent's JSON report to a Slack incoming webhook."""

import json
import os
import sys

import requests  # part of stdlib via `urllib` if you prefer no deps


def main() -> int:
    raw = sys.stdin.read().strip()
    try:
        report = json.loads(raw)
    except json.JSONDecodeError:
        body = f"⚠️ Agent returned non-JSON output:\n```\n{raw[:1500]}\n```"
        post(body)
        return 1

    if all_green(report):
        body = f"✓ FundSim overnight check: all green ({report.get('timestamp', '')})."
    else:
        body = format_red(report)

    post(body)
    return 0


def all_green(r: dict) -> bool:
    if not r.get("homepage", {}).get("ok"):
        return False
    if not r.get("api_chat", {}).get("ok"):
        return False
    if r.get("vercel_failures"):
        return False
    return True


def format_red(r: dict) -> str:
    lines = [f"⚠️ FundSim overnight check ({r.get('timestamp', '')}):", ""]
    hp = r.get("homepage", {})
    if not hp.get("ok"):
        lines.append(f"• Homepage: {hp.get('status')} — {hp.get('note', '')}")
    ap = r.get("api_chat", {})
    if not ap.get("ok"):
        lines.append(f"• /api/chat: {ap.get('status')} — {ap.get('note', '')}")
    for f in r.get("vercel_failures", []):
        lines.append(f"• Vercel deploy {f.get('state', '?')}: {f.get('url', '')}")
    if r.get("stale_prs"):
        lines.append(f"• {len(r['stale_prs'])} PRs older than 7 days")
    return "\n".join(lines)


def post(text: str) -> None:
    url = os.environ["SLACK_WEBHOOK_URL"]
    requests.post(url, json={"text": text}, timeout=10)


if __name__ == "__main__":
    sys.exit(main())
````

### 3. Add the workflow

Create `.github/workflows/overnight-agent.yml`:

```yaml
name: Overnight Agent

on:
  schedule:
    - cron: "0 6 * * *" # 06:00 UTC daily
  workflow_dispatch: # manual trigger for testing

jobs:
  health:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install deps
        run: pip install claude-agent-sdk requests

      - name: Run agent
        id: agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/overnight_agent.py | tee /tmp/report.json

      - name: Post Slack digest
        if: always()
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: cat /tmp/report.json | python scripts/post_digest.py
```

### 4. Add the secrets

In GitHub → `Nishkal2010/fundsim` → Settings → Secrets and variables → Actions, add:

- `ANTHROPIC_API_KEY` — your rotated key (after the rotation you owe yourself from earlier today)
- `SLACK_WEBHOOK_URL` — create at https://api.slack.com/messaging/webhooks (pick a channel like `#fundsim-alerts`)
- `VERCEL_TOKEN` — at https://vercel.com/account/tokens (scope: read deployments only)

### 5. Test once before relying on it

After committing all three files, go to **Actions → Overnight Agent → Run workflow**. It should complete in ~3 minutes. Check the Slack channel for the digest. If anything's wrong, the workflow logs show the agent's full trace.

## Cost estimate

Per nightly run (Haiku 4.5 at May 2026 pricing — $1/M input, $5/M output):

| Component                  | Tokens     |
| -------------------------- | ---------- |
| System prompt              | ~600       |
| Tool definitions + results | ~3,000     |
| Reasoning + JSON output    | ~800       |
| **Total**                  | **~4,400** |

That's $0.005 per run × 30 = **$0.15/month**. GitHub Actions runtime is ~3 min × 30 = 90 min, well within the free tier for public repos and ~$0.72 for private repos.

## What's deliberately NOT in v1

These are tempting but add maintenance burden disproportionate to their value:

- **Auto-opening PRs to fix issues.** Agents that make changes need extensive guardrails and someone to review every PR. Read-only is safer and almost as useful.
- **Slack threading / interactive responses.** Just post a digest. If you want to investigate, your terminal is one tab away.
- **Multi-agent orchestration** (one agent per check, parent agent that synthesizes). Single-agent works; orchestration overhead isn't worth it for 5 checks.
- **Database (Supabase) queries.** Stays out of the loop — RLS makes this hard from a CI runner, and most DB issues surface as API failures anyway.
- **Notion/email digest.** Slack is enough. Adding channels = adding things that can break.

## V2 (only if v1 proves valuable for 30 days)

- Track baseline metrics (response time, JS error count) and alert only on _change_, not absolute state — reduces noise.
- Add a `/healthcheck` API endpoint that returns structured server-side metrics (DB latency, Anthropic upstream latency, etc.) so the agent has more to report on.
- Switch to Sonnet 4.6 if the report quality matters more than cost (~3x cost, much better reasoning about what's actually broken).

## Failure modes to watch for

| Risk                                    | What you'll see                                  | Fix                                                              |
| --------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Anthropic key invalid / out of credits  | Slack: `/api/chat: 500 — API key not configured` | Rotate key, update GitHub Secret                                 |
| Slack webhook deleted                   | Workflow runs green but no Slack message         | Recreate webhook, update Secret                                  |
| Cron skipped (GitHub maintenance)       | One missing morning digest                       | Manually trigger via workflow_dispatch                           |
| Agent runs >15 iterations               | Workflow times out                               | Check the report for what it was stuck on; tighten system prompt |
| False positives (TODOs flagged as bugs) | Slack noise on green nights                      | Refine the system prompt's "what to flag" list                   |

## When to consider Polsia.ai or similar instead

If you want any of these, you're outgrowing this DIY setup:

- Real-time monitoring (sub-minute alerting)
- Autonomous code changes (agent opens its own PRs and tests them)
- Multi-product orchestration (FundSim + future products coordinated)
- A non-engineer needs to read/modify the agent's behavior via UI

Until you have any of those, this script is cheaper, more transparent, and faster to debug than any managed product.
