"use client";

import { useEffect, useRef } from "react";

import { useActiveSection } from "@/hooks/useActiveSection";

const NAV = [
  { id: "map", label: "Map" },
  { id: "recent", label: "Recent" },
  { id: "trends", label: "Trends" },
  { id: "categories", label: "Types" },
  { id: "neighborhoods", label: "Areas" },
  { id: "response", label: "Response times" },
  { id: "equity", label: "Equity" },
  { id: "about", label: "About" },
] as const;

const IDS = NAV.map((n) => n.id);

/**
 * Section links. On phones a single scrollable row with faded edges; the
 * link for the section on screen is highlighted and kept in view.
 */
export function SiteNav() {
  const { active, pin } = useActiveSection(IDS);
  const scroller = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = scroller.current;
    const link = active ? list?.querySelector<HTMLElement>(`[data-section="${active}"]`) : null;
    if (!list || !link) return;
    // Scroll only the row (scrollIntoView could also scroll the page).
    const left = link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Sections" className="-mx-4 min-w-0 sm:-mx-6 lg:mx-0">
      <ul ref={scroller} className="fade-x flex gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm sm:px-6 lg:px-1">
        {NAV.map((item) => {
          const current = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-section={item.id}
                onClick={() => pin(item.id)}
                aria-current={current ? "location" : undefined}
                className={`tap flex items-center rounded-full px-3 transition-colors ${
                  current ? "bg-sound-soft font-medium text-sound-deep" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
