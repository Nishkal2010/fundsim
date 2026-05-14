"""
FundSim overnight health agent.

Runs on a GitHub Actions cron. Drives Claude Haiku 4.5 with a small set
of read-only function tools (no raw shell access) and prints a single
JSON report to stdout for the next workflow step to pipe into Slack.

Auth (all via env vars / GitHub Secrets):
  ANTHROPIC_API_KEY  — required
  VERCEL_TOKEN       — optional (Vercel deployment check is skipped if missing)
  VERCEL_PROJECT_ID  — optional (same)
  GH_TOKEN           — required for PR check (Actions provides automatically)

Output: ONE JSON object printed to stdout. See REPORT_SCHEMA in
docs/OVERNIGHT_AGENT.md for the shape.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

import anthropic  # pip install anthropic


MODEL = "claude-haiku-4-5-20251001"
MAX_ITERATIONS = 12  # hard cap on tool-call rounds
HOMEPAGE = "https://fundsimulate.com/"
API_CHAT = "https://fundsimulate.com/api/chat"
API_HEALTH = "https://fundsimulate.com/api/health"


# ─── Tools the agent can call ────────────────────────────────────────────

def tool_fetch_url(url: str, method: str = "GET", body: str | None = None,
                   origin: str | None = None) -> dict[str, Any]:
    """GET or POST a URL. Returns {status, body_excerpt, content_type, error?}."""
    headers = {"User-Agent": "fundsim-overnight-agent/1.0"}
    if origin:
        headers["Origin"] = origin
    if body and method == "POST":
        headers["Content-Type"] = "application/json"

    try:
        req = urllib.request.Request(
            url,
            data=body.encode("utf-8") if body else None,
            method=method,
            headers=headers,
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read(4096).decode("utf-8", errors="replace")
            return {
                "status": resp.status,
                "body_excerpt": data[:2000],
                "content_type": resp.headers.get("Content-Type", ""),
            }
    except urllib.error.HTTPError as e:
        return {"status": e.code, "body_excerpt": e.reason, "error": "HTTPError"}
    except Exception as e:
        return {"status": 0, "error": f"{type(e).__name__}: {e}"}


def tool_recent_vercel_deployments(hours: int = 24) -> dict[str, Any]:
    """List failed Vercel deployments in the last N hours. Skipped if token missing."""
    token = os.environ.get("VERCEL_TOKEN")
    project = os.environ.get("VERCEL_PROJECT_ID")
    if not token or not project:
        return {"skipped": True, "reason": "VERCEL_TOKEN or VERCEL_PROJECT_ID not set"}

    since_ms = int((datetime.now(timezone.utc).timestamp() - hours * 3600) * 1000)
    url = (
        f"https://api.vercel.com/v6/deployments"
        f"?projectId={project}&since={since_ms}&limit=20"
    )
    try:
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        bad = [
            {
                "id": d["uid"],
                "url": d.get("url"),
                "state": d.get("state") or d.get("readyState"),
                "created_at": d.get("created"),
            }
            for d in data.get("deployments", [])
            if (d.get("state") or d.get("readyState")) in {"ERROR", "CANCELED"}
        ]
        return {"checked": len(data.get("deployments", [])), "failures": bad}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


def tool_recent_commits(hours: int = 24) -> dict[str, Any]:
    """Local git log of commits in the last N hours."""
    try:
        out = subprocess.check_output(
            [
                "git",
                "log",
                f"--since={hours} hours ago",
                "--oneline",
                "--no-merges",
            ],
            text=True,
            timeout=10,
        )
        commits = [line for line in out.strip().split("\n") if line]
        return {"count": len(commits), "commits": commits[:30]}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


def tool_stale_open_prs(days: int = 7) -> dict[str, Any]:
    """List open PRs older than N days via `gh pr list`."""
    if not os.environ.get("GH_TOKEN") and not os.environ.get("GITHUB_TOKEN"):
        return {"skipped": True, "reason": "GH_TOKEN not set"}
    try:
        out = subprocess.check_output(
            ["gh", "pr", "list", "--json", "number,title,createdAt", "--limit", "30"],
            text=True,
            timeout=20,
        )
        prs = json.loads(out)
        now = datetime.now(timezone.utc)
        stale = []
        for pr in prs:
            created = datetime.fromisoformat(pr["createdAt"].replace("Z", "+00:00"))
            age = (now - created).days
            if age >= days:
                stale.append({"number": pr["number"], "title": pr["title"], "age_days": age})
        return {"stale_count": len(stale), "stale_prs": stale}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


def tool_finish(report: dict[str, Any]) -> dict[str, Any]:
    """Terminal tool — the agent calls this when the report is complete."""
    return {"acknowledged": True, "report": report}


# ─── Tool dispatch table ─────────────────────────────────────────────────

TOOLS = [
    {
        "name": "fetch_url",
        "description": "HTTP GET or POST to a URL. Returns status, content-type, and a body excerpt. Use this to probe production endpoints.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string"},
                "method": {"type": "string", "enum": ["GET", "POST"], "default": "GET"},
                "body": {"type": "string", "description": "JSON body for POST"},
                "origin": {"type": "string", "description": "Origin header value, for CORS-locked endpoints"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "recent_vercel_deployments",
        "description": "List Vercel deployments in the last N hours that failed (ERROR or CANCELED state).",
        "input_schema": {
            "type": "object",
            "properties": {"hours": {"type": "integer", "default": 24}},
        },
    },
    {
        "name": "recent_commits",
        "description": "List git commits to this repo in the last N hours.",
        "input_schema": {
            "type": "object",
            "properties": {"hours": {"type": "integer", "default": 24}},
        },
    },
    {
        "name": "stale_open_prs",
        "description": "List open GitHub PRs older than N days.",
        "input_schema": {
            "type": "object",
            "properties": {"days": {"type": "integer", "default": 7}},
        },
    },
    {
        "name": "finish",
        "description": "Submit the final report. Call this exactly once when all checks are complete. After calling, do nothing else.",
        "input_schema": {
            "type": "object",
            "properties": {
                "report": {
                    "type": "object",
                    "description": "The structured health report. Must match the schema in the system prompt.",
                }
            },
            "required": ["report"],
        },
    },
]

DISPATCH = {
    "fetch_url": tool_fetch_url,
    "recent_vercel_deployments": tool_recent_vercel_deployments,
    "recent_commits": tool_recent_commits,
    "stale_open_prs": tool_stale_open_prs,
    "finish": tool_finish,
}


SYSTEM_PROMPT = f"""\
You are FundSim's overnight production monitor. Your only job is to produce \
a single structured health report and submit it via the `finish` tool. \
You have read-only function tools. You do NOT have shell access.

Run these checks IN ORDER. Don't repeat a check unnecessarily.

1. GET {HOMEPAGE} via `fetch_url`. Pass: ok if status == 200 AND body excerpt \
   contains "FundSim" or "fundsim" (case-insensitive). Otherwise fail.
2. GET {API_HEALTH} via `fetch_url`. Pass: ok if status == 200 and content-type \
   contains "json". Parse the body and capture the `ok` field if present.
3. POST {API_CHAT} via `fetch_url` with body \
   `{{"mode":"tutor","messages":[{{"role":"user","content":"ping"}}]}}` and \
   origin `https://fundsimulate.com`. Pass: ok if status == 200 and body contains \
   a non-empty `content` field. CORS denials (status 403) count as a failure.
4. Call `recent_vercel_deployments` with hours=24. Capture any failures.
5. Call `recent_commits` with hours=24.
6. Call `stale_open_prs` with days=7.

When all six checks are complete, call `finish` with this exact shape:

{{
  "homepage":       {{"ok": bool, "status": int, "note": str}},
  "api_health":     {{"ok": bool, "status": int, "note": str}},
  "api_chat":       {{"ok": bool, "status": int, "note": str}},
  "vercel":         {{"checked": int, "failures": [object]}},
  "recent_commits": [str],
  "stale_prs":      [{{"number": int, "title": str, "age_days": int}}],
  "timestamp":      str (ISO 8601 UTC)
}}

Be concise. If a check skipped because a secret was missing, set ok=false and \
say so in `note`. Never invent data. Never call `finish` more than once.
"""


def run_agent() -> dict[str, Any]:
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    messages: list[dict[str, Any]] = [
        {"role": "user", "content": "Run the overnight health check now."}
    ]

    for iteration in range(MAX_ITERATIONS):
        resp = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        # Append the assistant turn so the next request has full context.
        messages.append({"role": "assistant", "content": resp.content})

        tool_uses = [b for b in resp.content if b.type == "tool_use"]
        if not tool_uses:
            # Model stopped without calling finish — synthesize a minimal report.
            return {
                "error": "agent stopped without calling finish",
                "stop_reason": resp.stop_reason,
                "iteration": iteration,
            }

        tool_results: list[dict[str, Any]] = []
        for tu in tool_uses:
            fn = DISPATCH.get(tu.name)
            if fn is None:
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": json.dumps({"error": f"unknown tool {tu.name}"}),
                        "is_error": True,
                    }
                )
                continue
            try:
                result = fn(**tu.input)
            except Exception as e:
                result = {"error": f"{type(e).__name__}: {e}"}

            if tu.name == "finish":
                # Stamp timestamp server-side so the model can't fudge it.
                report = result.get("report", {})
                report["timestamp"] = datetime.now(timezone.utc).isoformat()
                return report

            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": tu.id,
                    "content": json.dumps(result),
                }
            )

        messages.append({"role": "user", "content": tool_results})

    return {"error": "max iterations exceeded", "iterations": MAX_ITERATIONS}


def main() -> int:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print(json.dumps({"error": "ANTHROPIC_API_KEY not set"}))
        return 1
    try:
        report = run_agent()
    except Exception as e:
        print(json.dumps({"error": f"agent crashed: {type(e).__name__}: {e}"}))
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
