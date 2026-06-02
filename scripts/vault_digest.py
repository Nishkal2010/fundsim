#!/usr/bin/env python3
"""Collapse a Claude Code transcript (.jsonl) into a compact markdown digest:
real user turns + assistant prose + files touched. Strips tool-result noise so
huge transcripts (10-60MB) become a few hundred KB an agent can actually read."""
import json, sys, os, re

NOISE_PREFIXES = (
    "<system-reminder", "Caveat:", "<command-name", "<local-command",
    "<command-message", "[Request interrupted", "Stop hook feedback",
    "<command-args", "Base directory for this skill", "PreToolUse",
    "PostToolUse", "<command-stdout", "<bash-",
)

def text_of(content):
    """Return concatenated text from a message.content (str or list)."""
    if isinstance(content, str):
        return content
    out = []
    if isinstance(content, list):
        for b in content:
            if isinstance(b, dict) and b.get("type") == "text":
                out.append(b.get("text", ""))
    return "\n".join(out)

def files_touched(content):
    fp = []
    if isinstance(content, list):
        for b in content:
            if isinstance(b, dict) and b.get("type") == "tool_use":
                name = b.get("name", "")
                inp = b.get("input", {}) or {}
                if name in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
                    p = inp.get("file_path")
                    if p:
                        fp.append((name, p))
    return fp

def is_noise(t):
    t = t.strip()
    if not t:
        return True
    return t.startswith(NOISE_PREFIXES)

def main(path, out_path):
    turns = []
    touched = []
    first_ts = last_ts = None
    user_msgs = 0
    with open(path, errors="replace") as f:
        for ln in f:
            try:
                e = json.loads(ln)
            except Exception:
                continue
            et = e.get("type")
            ts = e.get("timestamp")
            if ts:
                first_ts = first_ts or ts
                last_ts = ts
            if et == "user":
                msg = e.get("message", {})
                # skip tool_result-only user events
                c = msg.get("content")
                if isinstance(c, list) and all(
                    isinstance(b, dict) and b.get("type") == "tool_result" for b in c
                ):
                    continue
                t = text_of(c).strip()
                if is_noise(t):
                    continue
                user_msgs += 1
                turns.append(("USER", t[:8000]))
            elif et == "assistant":
                msg = e.get("message", {})
                c = msg.get("content")
                t = text_of(c).strip()
                if t:
                    turns.append(("CLAUDE", t[:6000]))
                for nm, p in files_touched(c):
                    touched.append((nm, p))

    # dedupe touched, preserve order
    seen = set()
    uniq_touched = []
    for nm, p in touched:
        if p not in seen:
            seen.add(p)
            uniq_touched.append((nm, p))

    sid = os.path.basename(path).replace(".jsonl", "")
    with open(out_path, "w") as o:
        o.write(f"# DIGEST {sid}\n")
        o.write(f"range: {first_ts} -> {last_ts}\n")
        o.write(f"user_turns: {user_msgs} | files_touched: {len(uniq_touched)}\n\n")
        o.write("## FILES TOUCHED (Write/Edit)\n")
        for nm, p in uniq_touched:
            o.write(f"- {nm}: {p}\n")
        o.write("\n## TRANSCRIPT (user turns + claude prose, tool noise stripped)\n\n")
        for who, t in turns:
            o.write(f"### {who}\n{t}\n\n")
    print(f"{sid}: {user_msgs} user turns, {len(uniq_touched)} files, "
          f"{os.path.getsize(out_path)//1024}KB digest, {first_ts[:10] if first_ts else '?'}..{last_ts[:10] if last_ts else '?'}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
