import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Share2, Check, Loader2, Copy } from "lucide-react";
import { saveDealShare, buildShareUrl } from "../lib/dealShare";
import type { DealSharePayload } from "../lib/dealShare";
import { captureEvent } from "../lib/posthog";
import { PressureTestGate } from "./PressureTestGate";
import { DefenseGate } from "./Assignment/DefenseGate";

interface ShareButtonProps {
  data: DealSharePayload;
  label?: string;
  /** When set, fires DefenseGate instead of PressureTestGate before generating the link */
  assignmentGate?: { prompt: string };
}

export function ShareButton({
  data,
  label = "Share Deal",
  assignmentGate,
}: ShareButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "confirming" | "saving" | "done" | "error"
  >("idle");
  const [url, setUrl] = useState<string | null>(null);

  function handleShare() {
    setStatus("confirming");
  }

  async function doShare(defense?: string) {
    setStatus("saving");
    // If a defense was provided (from DefenseGate), merge it into the assignment field
    const payload =
      defense && data.assignment
        ? { ...data, assignment: { ...data.assignment, defense } }
        : data;
    try {
      const id = await saveDealShare(payload);
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

  const isBusy = status === "saving" || status === "confirming";

  return (
    <div className="flex items-center gap-2">
      {status === "confirming" &&
        ReactDOM.createPortal(
          assignmentGate ? (
            <DefenseGate
              prompt={assignmentGate.prompt}
              onSubmit={(defense) => doShare(defense)}
              onDismiss={() => setStatus("idle")}
            />
          ) : (
            <PressureTestGate
              onGenerate={() => doShare()}
              onDismiss={() => setStatus("idle")}
            />
          ),
          document.body,
        )}
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
        disabled={isBusy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
        style={{
          background: bg,
          color: "#fff",
          opacity: isBusy ? 0.75 : 1,
        }}
      >
        {status === "saving" && <Loader2 size={14} className="animate-spin" />}
        {status === "done" && <Check size={14} />}
        {(status === "idle" ||
          status === "error" ||
          status === "confirming") && <Share2 size={14} />}
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
