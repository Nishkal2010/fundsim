import { useState } from "react";

const STORAGE_KEY = "fundsim_captured_email";

function isAuthenticated(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) ?? "";
    if (k.startsWith("sb-") && k.endsWith("-auth-token")) return true;
  }
  return false;
}

export function useEmailCapture() {
  const [showCapture, setShowCapture] = useState(false);
  const [captureTrigger, setCaptureTrigger] = useState<
    "excel_export" | "deal_memo"
  >("excel_export");

  function triggerCapture(t: "excel_export" | "deal_memo") {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isAuthenticated()) return;
    setCaptureTrigger(t);
    setShowCapture(true);
  }

  return { showCapture, captureTrigger, triggerCapture, setShowCapture };
}
