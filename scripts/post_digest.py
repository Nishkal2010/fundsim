"""
Forwards the overnight agent's JSON report (on stdin) to Slack via an
incoming webhook. Renders as Slack Block Kit so red days are scannable
at a glance.

Env:
  SLACK_WEBHOOK_URL — required
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


WEBHOOK_VAR = "SLACK_WEBHOOK_URL"


def main() -> int:
    raw = sys.stdin.read().strip()
    if not raw:
        return _post_text("⚠️ Overnight agent produced no output.")

    try:
        report = json.loads(raw)
    except json.JSONDecodeError:
        return _post_text(
            f"⚠️ Overnight agent returned non-JSON output:\n```\n{raw[:1500]}\n```"
        )

    if "error" in report:
        return _post_text(f"⚠️ Overnight agent error: `{report['error']}`")

    blocks = _build_blocks(report)
    return _post_blocks(blocks)


def _build_blocks(r: dict) -> list[dict]:
    green = _all_green(r)
    header = "✅ FundSim overnight: all green" if green else "⚠️ FundSim overnight: issues"
    blocks: list[dict] = [
        {"type": "header", "text": {"type": "plain_text", "text": header}},
        {
            "type": "context",
            "elements": [
                {"type": "mrkdwn", "text": f"_{r.get('timestamp', 'no timestamp')}_"}
            ],
        },
        {"type": "divider"},
    ]

    blocks.append(_status_section(r))

    if r.get("vercel", {}).get("failures"):
        lines = ["*Vercel failures (last 24h):*"]
        for f in r["vercel"]["failures"][:5]:
            url = f.get("url") or ""
            lines.append(f"• `{f.get('state', '?')}` <https://{url}|{url or f.get('id')}>")
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": "\n".join(lines)}})

    commits = r.get("recent_commits") or []
    if commits:
        lines = ["*Commits in last 24h:*"]
        for c in commits[:10]:
            lines.append(f"• `{c}`")
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": "\n".join(lines)}})
    elif "recent_commits" in r:
        blocks.append(
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": "_No commits in last 24h._"},
            }
        )

    stale = r.get("stale_prs") or []
    if stale:
        lines = ["*Stale PRs (>7 days):*"]
        for pr in stale[:10]:
            lines.append(f"• #{pr.get('number')} — {pr.get('title')} ({pr.get('age_days')}d)")
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": "\n".join(lines)}})

    return blocks


def _status_section(r: dict) -> dict:
    """Three-line status with green/red dots."""
    items = [
        ("Homepage", r.get("homepage", {})),
        ("API /health", r.get("api_health", {})),
        ("API /chat", r.get("api_chat", {})),
    ]
    lines = []
    for label, data in items:
        dot = "🟢" if data.get("ok") else "🔴"
        status = data.get("status", "?")
        note = data.get("note", "")
        line = f"{dot} *{label}* — {status}"
        if note:
            line += f" · _{note}_"
        lines.append(line)
    return {"type": "section", "text": {"type": "mrkdwn", "text": "\n".join(lines)}}


def _all_green(r: dict) -> bool:
    for key in ("homepage", "api_health", "api_chat"):
        if not r.get(key, {}).get("ok"):
            return False
    if r.get("vercel", {}).get("failures"):
        return False
    return True


def _post_text(text: str) -> int:
    return _post({"text": text})


def _post_blocks(blocks: list[dict]) -> int:
    return _post({"blocks": blocks, "text": "FundSim overnight report"})


def _post(payload: dict) -> int:
    url = os.environ.get(WEBHOOK_VAR)
    if not url:
        sys.stderr.write(f"{WEBHOOK_VAR} not set; skipping Slack post\n")
        sys.stderr.write(json.dumps(payload, indent=2) + "\n")
        return 1
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
        return 0
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"Slack POST failed: {e.code} {e.reason}\n")
        return 1
    except Exception as e:
        sys.stderr.write(f"Slack POST failed: {type(e).__name__}: {e}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
