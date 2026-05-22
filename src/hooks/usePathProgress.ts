import { useState, useCallback } from "react";
import { safeStorageGet, safeStorageSet } from "../lib/storage";

const STORAGE_KEY = "fundsim_path_progress";

export type PathTrack = "pe" | "vc" | "ib";

interface Progress {
  pe: string[];
  vc: string[];
  ib: string[];
}

function readProgress(): Progress {
  try {
    const raw = safeStorageGet(STORAGE_KEY);
    if (!raw) return { pe: [], vc: [], ib: [] };
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      pe: Array.isArray(p.pe)
        ? p.pe.filter((v): v is string => typeof v === "string")
        : [],
      vc: Array.isArray(p.vc)
        ? p.vc.filter((v): v is string => typeof v === "string")
        : [],
      ib: Array.isArray(p.ib)
        ? p.ib.filter((v): v is string => typeof v === "string")
        : [],
    };
  } catch {
    return { pe: [], vc: [], ib: [] };
  }
}

export function usePathProgress() {
  const [progress, setProgress] = useState<Progress>(readProgress);

  const markVisited = useCallback((track: PathTrack, nodeId: string) => {
    setProgress((prev) => {
      if (prev[track].includes(nodeId)) return prev;
      const next = { ...prev, [track]: [...prev[track], nodeId] };
      safeStorageSet(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isVisited = useCallback(
    (track: PathTrack, nodeId: string): boolean =>
      progress[track].includes(nodeId),
    [progress],
  );

  const resetProgress = useCallback(() => {
    const empty: Progress = { pe: [], vc: [], ib: [] };
    safeStorageSet(STORAGE_KEY, JSON.stringify(empty));
    setProgress(empty);
  }, []);

  return { markVisited, isVisited, resetProgress, progress };
}
