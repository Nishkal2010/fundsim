import { useEffect, useState } from "react";

const STORAGE_KEY = "fundsim_dark_mode";

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "light";
  } catch {
    return true;
  }
}

export function useDarkMode(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState<boolean>(readInitial);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
        } catch {
          // private mode — swallow
        }
      }
      return next;
    });
  };

  return { dark, toggle };
}
