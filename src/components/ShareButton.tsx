import React, { useState } from "react";
import { Share2, Check, Loader2, Copy } from "lucide-react";
import { saveDealShare, buildShareUrl } from "../lib/dealShare";
import type { DealSharePayload } from "../lib/dealShare";
import { captureEvent } from "../lib/posthog";

interface ShareButtonProps {
  data: DealSharePayload;
  label?: string;
}

export function ShareButton({ data, label = "Share Deal" }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [url, setUrl] = useState<string | null>(null);

  async function handleShare() {
    setStatus("saving");
    try {
      const id = await saveDealShare(data);
      const shareUrl = buildShareUrl(id);
      setUrl(shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      captureEvent("share_link_copied", {
        simulator: data.simulator,
        tab: data.tab,
      });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  async function copyAgain() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    captureEvent("share_link_copied", {
      simulator: data.simulator,
      tab: data.tab,
      copy_again: true,
    });
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2000);
  }

  const bg =
    status === "done"
      ? "#10B981"
      : status === "error"
        ? "#EF4444"
        : "linear-gradient(135deg,#6366F1,#8B5CF6)";

  return (
    <div className="flex items-center gap-2">
      {url && status === "idle" && (
        <button
          onClick={copyAgain}
          title="Copy share link"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 transition-colors"
        >
          <Copy size={12} />
          Copy link
        </button>
      )}
      <button
        onClick={handleShare}
        disabled={status === "saving"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
        style={{
          background: bg,
          color: "#fff",
          opacity: status === "saving" ? 0.75 : 1,
        }}
      >
        {status === "saving" && <Loader2 size={14} className="animate-spin" />}
        {status === "done" && <Check size={14} />}
        {(status === "idle" || status === "error") && <Share2 size={14} />}
        {status === "saving"
          ? "Saving…"
          : status === "done"
            ? "Link copied!"
            : status === "error"
              ? "Error — retry"
              : label}
      </button>
    </div>
  );
}
