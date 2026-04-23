import { useEffect, useCallback } from "react";

export interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  modifiers?: { meta?: boolean; ctrl?: boolean; shift?: boolean };
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't fire when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch =
          e.key === shortcut.key ||
          e.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatch = shortcut.modifiers?.meta
          ? e.metaKey || e.ctrlKey
          : true;
        const ctrlMatch = shortcut.modifiers?.ctrl ? e.ctrlKey : true;
        const shiftMatch = shortcut.modifiers?.shift ? e.shiftKey : true;
        // Don't match plain keys when meta/ctrl are pressed (let browser handle them)
        const noUnwantedMeta =
          !shortcut.modifiers?.meta && !shortcut.modifiers?.ctrl
            ? !e.metaKey && !e.ctrlKey
            : true;

        if (
          keyMatch &&
          metaMatch &&
          ctrlMatch &&
          shiftMatch &&
          noUnwantedMeta
        ) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUT_DEFINITIONS = [
  { key: "1", description: "Switch to Fund Lifecycle tab" },
  { key: "2", description: "Switch to J-Curve tab" },
  { key: "3", description: "Switch to Waterfall tab" },
  { key: "4", description: "Switch to Performance tab" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "g", description: "Open glossary" },
  { key: "Escape", description: "Close modal / drawer" },
];
