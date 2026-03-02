"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when user scrolls down (hide), false when scrolling up (show).
 */
export function useHideOnScroll(opts?: { threshold?: number; topAlwaysVisible?: boolean }) {
  const threshold = opts?.threshold ?? 12;
  const topAlwaysVisible = opts?.topAlwaysVisible ?? true;

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        if (topAlwaysVisible && y < 8) {
          setHidden(false);
        } else if (Math.abs(delta) >= threshold) {
          setHidden(delta > 0);
          lastY = y;
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topAlwaysVisible]);

  return hidden;
}
