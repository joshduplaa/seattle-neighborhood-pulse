"use client";

import { useState } from "react";

import { EmptyState, Panel, Skeleton } from "@/components/ui/Panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatLocalTimestamp } from "@/lib/dates";
import { formatAreaName, formatCount } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

/** Rows shown at first, and added per "Show more": fewer on phones, where the list sits above the charts. */
const PAGE = { narrow: 5, wide: 15 } as const;

interface RecentRequestsProps {
  data: DashboardData | null;
  loading: boolean;
  selectedId: string | null;
  onChoose: (id: string) => void;
  onClearFilters: () => void;
  canClear: boolean;
}

export function RecentRequests({ data, loading, selectedId, onChoose, onClearFilters, canClear }: RecentRequestsProps) {
  const page = useMediaQuery("(min-width: 1024px)", true) ? PAGE.wide : PAGE.narrow;
  // Reset paging when the result set changes (keyed by the request that heads the list).
  const resetKey = data ? `${data.retrievedAt}|${data.sample.requests[0]?.id ?? ""}` : "";
  const [paging, setPaging] = useState({ key: resetKey, visible: 0 });
  const visible = paging.key === resetKey ? Math.max(paging.visible, page) : page;

  const requests = data?.sample.requests ?? [];
  const shown = requests.slice(0, visible);
  const total = data?.totals.matching ?? 0;

  const description = data
    ? requests.length < total
      ? `Newest ${formatCount(requests.length)} of ${formatCount(total)} matching requests, newest first.`
      : `All ${formatCount(total)} matching requests, newest first.`
    : "Newest matching requests first.";

  return (
    <Panel id="recent" title="Recent requests" description={description} bodyClassName="px-2 pb-2 pt-2 sm:px-3">
      {!data ? (
        <ul className="flex flex-col gap-2 p-2" aria-busy>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-1.5 h-3 w-1/2" />
            </li>
          ))}
        </ul>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests match these filters">
          {canClear ? (
            <button type="button" onClick={onClearFilters} className="font-medium text-sound-strong underline underline-offset-2">
              Clear filters
            </button>
          ) : (
            "Try a longer date range."
          )}
        </EmptyState>
      ) : (
        <>
          <ul className={`flex flex-col transition-opacity ${loading ? "opacity-60" : ""}`}>
            {shown.map((r) => {
              const selected = r.id === selectedId;
              const place = r.area ? formatAreaName(r.area) : (r.address ?? "Location not recorded");
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onChoose(r.id)}
                    aria-current={selected ? "true" : undefined}
                    className={`tap grid w-full grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-muted ${
                      selected ? "bg-ferry-soft hover:bg-ferry-soft" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`size-2 translate-y-[-1px] rounded-full ${
                        selected ? "bg-ferry" : r.coordinates ? "bg-sound" : "border border-ink-subtle bg-transparent"
                      }`}
                    />
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate text-[13px] font-medium leading-5 text-ink">{r.type}</span>
                      <span className="ml-auto max-w-[45%] shrink-0 truncate text-xs leading-5 text-ink-muted" title={place}>
                        {place}
                      </span>
                    </span>
                    <span className="col-start-2 flex min-w-0 items-center gap-1.5 text-xs leading-5 text-ink-subtle">
                      <span className="truncate">{formatLocalTimestamp(r.createdAt)}</span>
                      {r.status ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="shrink-0">{r.status}</span>
                        </>
                      ) : null}
                      {!r.coordinates ? (
                        <span className="ml-auto shrink-0 rounded border border-dashed border-line-strong px-1 text-[11px] leading-4">No map location</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible < requests.length ? (
            <div className="px-2 pt-1">
              <button
                type="button"
                onClick={() => setPaging({ key: resetKey, visible: visible + page })}
                className="tap w-full rounded-lg text-sm font-medium text-sound-strong hover:bg-sound-soft"
              >
                Show {Math.min(page, requests.length - visible)} more
                <span className="text-ink-subtle"> · {formatCount(visible)} of {formatCount(requests.length)} shown</span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}
