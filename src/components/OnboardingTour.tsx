import { useEffect, useRef, useState } from "react";
import {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
} from "../lib/storage";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "fundsim_tour_done";

const DARK_POPOVER_STYLE = `
  .driver-popover.fundsim-tour {
    background: #111827 !important;
    border: 1px solid rgba(129,140,248,0.3) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(129,140,248,0.1) !important;
    padding: 20px 22px !important;
    max-width: 320px !important;
  }
  .driver-popover.fundsim-tour .driver-popover-title {
    color: #F9FAFB !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    margin-bottom: 6px !important;
    font-family: inherit !important;
  }
  .driver-popover.fundsim-tour .driver-popover-description {
    color: #9CA3AF !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
  }
  .driver-popover.fundsim-tour .driver-popover-progress-text {
    color: #818CF8 !important;
    font-size: 12px !important;
    font-weight: 500 !important;
  }
  .driver-popover.fundsim-tour .driver-popover-navigation-btns button {
    background: #818CF8 !important;
    color: #fff !important;
    border: none !important;
    border-radius: 7px !important;
    padding: 6px 14px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    text-shadow: none !important;
  }
  .driver-popover.fundsim-tour .driver-popover-navigation-btns button.driver-popover-prev-btn {
    background: #1F2937 !important;
    border: 1px solid #374151 !important;
    color: #9CA3AF !important;
  }
  .driver-popover.fundsim-tour .driver-popover-close-btn {
    color: #6B7280 !important;
    font-size: 18px !important;
  }
  .driver-popover.fundsim-tour .driver-popover-close-btn:hover {
    color: #F9FAFB !important;
  }
  .driver-popover.fundsim-tour .driver-popover-arrow-side-left.driver-popover-arrow {
    border-right-color: #111827 !important;
  }
  .driver-popover.fundsim-tour .driver-popover-arrow-side-right.driver-popover-arrow {
    border-left-color: #111827 !important;
  }
  .driver-popover.fundsim-tour .driver-popover-arrow-side-top.driver-popover-arrow {
    border-bottom-color: #111827 !important;
  }
  .driver-popover.fundsim-tour .driver-popover-arrow-side-bottom.driver-popover-arrow {
    border-top-color: #111827 !important;
  }
  .driver-overlay {
    background: rgba(0,0,0,0.7) !important;
  }
`;

/** Call this from devtools to reset the tour: resetOnboardingTour() */
// eslint-disable-next-line react-refresh/only-export-components
export function resetOnboardingTour() {
  safeStorageRemove(TOUR_KEY);
}

// Only expose on window in dev — avoids polluting production global scope
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).resetOnboardingTour =
    resetOnboardingTour;
}

// tour-1: poll for all required selectors instead of racing a fixed 1500ms delay
const REQUIRED_SELECTORS = [
  "#simulator-selector .grid",
  '[data-tour="finfox"]',
  '[data-tour="glossary"]',
  '[data-tour="hero-cta"]',
];

function waitForElements(
  selectors: string[],
  intervalMs = 100,
  timeoutMs = 5000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const allFound = selectors.every(
        (s) => document.querySelector(s) !== null,
      );
      if (allFound) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}

export function OnboardingTour() {
  // tour-5: hold driver instance in a ref so cleanup can destroy it
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  // Incremented by the fundsim:start-tour event to re-trigger the main effect
  const [retrigger, setRetrigger] = useState(0);

  useEffect(() => {
    function handleStartTour() {
      // Reset persistent TOUR_KEY so the tour actually runs on retrigger
      resetOnboardingTour();
      setRetrigger((n) => n + 1);
    }
    window.addEventListener("fundsim:start-tour", handleStartTour);
    return () =>
      window.removeEventListener("fundsim:start-tour", handleStartTour);
  }, []);

  useEffect(() => {
    const alreadySeen = !!safeStorageGet(TOUR_KEY);
    // bug3: explicit Tour button click sets a sessionStorage flag; if set, proceed
    // regardless of alreadySeen. Natural first-visit (no TOUR_KEY) also proceeds.
    let consumed = false;
    try {
      consumed = sessionStorage.getItem("fundsim_tour_consumed") === "1";
    } catch {
      // private mode — swallow
    }
    if (alreadySeen && !consumed) return;

    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.id = "fundsim-tour-styles";
    styleEl.textContent = DARK_POPOVER_STYLE;
    document.head.appendChild(styleEl);

    let cancelled = false;
    let localDriver: ReturnType<typeof driver> | null = null;

    function tagElements() {
      // Glossary button — find by text in header
      const headerBtns = Array.from(document.querySelectorAll("header button"));
      const glossaryBtn = headerBtns.find((b) =>
        b.textContent?.trim().includes("Glossary"),
      );
      if (glossaryBtn) glossaryBtn.setAttribute("data-tour", "glossary");

      // tour-3: tag FinFox mascot button by class/aria-label instead of fragile title selector
      const finFoxBtn =
        document.querySelector<HTMLElement>('button[aria-label*="FinFox"]') ??
        document.querySelector<HTMLElement>(".finfox-trigger") ??
        document.querySelector<HTMLElement>('button[title*="FinFox"]');
      if (finFoxBtn) finFoxBtn.setAttribute("data-tour", "finfox");

      // tour-4: scope CTA search to #simulator-selector first, fall back to section
      const scope =
        document.querySelector("#simulator-selector") ??
        document.querySelector("section") ??
        document;
      const heroCta = Array.from(scope.querySelectorAll("button")).find((b) =>
        b.textContent?.trim().includes("Pick your simulator"),
      );
      if (heroCta) heroCta.setAttribute("data-tour", "hero-cta");
    }

    async function startTour() {
      tagElements();

      // tour-1: wait until all targets are in the DOM; skip silently if they never appear
      const ready = await waitForElements(REQUIRED_SELECTORS);
      if (!ready || cancelled) {
        document.getElementById("fundsim-tour-styles")?.remove();
        return;
      }

      // bug2: destroy any prior driver only AFTER we know we're going to run,
      // and inside the async body so concurrent effect runs don't race.
      driverRef.current?.destroy();
      driverRef.current = null;

      const obj = driver({
        popoverClass: "fundsim-tour",
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.7,
        onDestroyStarted: () => {
          // tour-7: only mark done if user saw at least step 2 (index >= 1)
          const activeIndex = driverRef.current?.getActiveIndex() ?? 0;

          // tour-8: remove style BEFORE setItem so cleanup always runs
          document.getElementById("fundsim-tour-styles")?.remove();

          // bug3: clear the consumed flag now that the tour has run/closed
          // so a Suspense remount doesn't auto-fire it again.
          try {
            sessionStorage.removeItem("fundsim_tour_consumed");
          } catch {
            // private mode — swallow
          }

          if (activeIndex >= 1) {
            safeStorageSet(TOUR_KEY, "1");
          }
        },
        steps: [
          {
            element: "#simulator-selector .grid",
            popover: {
              title: "Pick your career track",
              description:
                "PE, VC, or IB — each simulator covers the full deal lifecycle. Click any card to dive in. You can always come back.",
              side: "top",
              align: "center",
            },
          },
          {
            // tour-3: stable data-tour attribute set by tagElements()
            element: '[data-tour="finfox"]',
            popover: {
              title: "Stuck? Ask FinFox anything",
              description:
                "FinFox is your AI finance tutor. Ask about any term, formula, or concept — it knows the context of whatever tab you're on.",
              side: "left",
              align: "end",
            },
          },
          {
            element: '[data-tour="glossary"]',
            popover: {
              title: "Quick term lookups",
              description:
                "The Glossary covers every finance term you'll encounter across PE, VC, and IB. Also opens with the G shortcut.",
              side: "bottom",
              align: "end",
            },
          },
          {
            element: '[data-tour="hero-cta"]',
            popover: {
              title: "Ready to start?",
              description:
                "Click here anytime to scroll back to the simulator selector. Or just click directly on a card above.",
              side: "top",
              align: "center",
            },
          },
        ],
      });

      localDriver = obj;
      driverRef.current = obj;
      if (cancelled) {
        localDriver?.destroy();
        if (driverRef.current === localDriver) driverRef.current = null;
        return;
      }
      obj.drive();
    }

    startTour();

    return () => {
      cancelled = true;
      // tour-5: destroy driver instance to remove DOM overlay
      localDriver?.destroy();
      if (driverRef.current === localDriver) driverRef.current = null;
      document.getElementById("fundsim-tour-styles")?.remove();
    };
  }, [retrigger]);

  return null;
}
