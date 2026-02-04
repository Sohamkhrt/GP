"use client";

import { useEffect } from "react";

export function LandingFx() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    let rafId = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.35;

    const commit = () => {
      rafId = 0;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;

      if (rafId) return;
      rafId = window.requestAnimationFrame(commit);
    };

    commit();
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
