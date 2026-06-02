import type { Variants } from "framer-motion";

// Shared stagger variants for grids. Kept in a non-component module so the
// component files stay fast-refresh-clean (only-export-components rule).
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};
