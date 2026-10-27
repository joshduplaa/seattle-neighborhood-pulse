"use client";

import { useEffect, useState } from "react";

/**
 * The id of the section nearest the top of the viewport, for highlighting the
 * matching nav link. Sections that render later (after data loads) are picked
 * up by re-scanning when the DOM changes.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const observed = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        // The first section (in page order) inside the band wins.
        const next = ids.find((id) => visible.has(id)) ?? null;
        if (next) setActive(next);
      },
      // A band across the upper part of the screen, below the sticky bars.
      { rootMargin: "-20% 0px -60% 0px" },
    );

    const scan = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ids]);

  return active;
}
