import { useContext } from "react";
import { FinFoxContext } from "../components/FinFox/FinFoxProvider";
import type { FinFoxContextType } from "../components/FinFox/FinFoxProvider";

export function useFinFox(): FinFoxContextType {
  const ctx = useContext(FinFoxContext);
  if (!ctx) throw new Error("useFinFox must be used inside FinFoxProvider");
  return ctx;
}
