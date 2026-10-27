"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long a clicked link stays highlighted while the page scrolls to it. */
const PIN_MS = 1200;

/**
 * The id of the section nearest the top of the viewport, for highlighting the
 * matching nav link. Sections that render later (after data loads) are picked
 * up by re-scanning when the DOM changes. `pin` highlights a clicked link
 * right away, which also disambiguates sections that sit side by side.
 */
export function useActiveSection(ids: readonly string[]): { active: string | null; pin: (id: string) => void } {
  const [active, setActive] = useState<string | null>(null);
  const pinned = useRef<{ id: string; until: number } | null>(null);

  const pin = useCallback((id: string) => {
    pinned.current = { id, until: Date.now() + PIN_MS };
    setActive(id);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observed = new Set<Element>();

    const update = () => {
      if (pinned.current && Date.now() < pinned.current.until) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      // The last section can't reach the band when the page ends below it.
      if (atBottom && visible.size > 0) return setActive(ids[ids.length - 1] ?? null);
      // The first section (in page order) inside the band wins; above the
      // first section (the page top) nothing is highlighted.
      setActive(ids.find((id) => visible.has(id)) ?? null);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        update();
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
    // Only for reaching the page bottom, which the observer can't see.
    const onScrollEnd = () => update();
    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [ids]);

  return { active, pin };
}
