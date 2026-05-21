import { useEffect, useState } from "react";

/**
 * Tracks window.location.hash and re-renders on changes.
 * Returns the hash string without the leading "#".
 * Use navigate(hash) to push a new hash (pass "" for home).
 */
export function useHash(): [string, (hash: string) => void] {
  const [hash, setHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "",
  );

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash.replace(/^#/, ""));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(newHash: string) {
    window.location.hash = newHash;
  }

  return [hash, navigate];
}
