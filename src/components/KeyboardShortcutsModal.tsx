import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { SHORTCUT_DEFINITIONS } from "../hooks/useKeyboardShortcuts";

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  onClose,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-2">
          {SHORTCUT_DEFINITIONS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{s.description}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-300 min-w-[28px] text-center">
                {s.key === "Escape" ? "Esc" : s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center">
            Shortcuts are disabled when typing in inputs
          </p>
        </div>
      </div>
    </div>
  );
}
