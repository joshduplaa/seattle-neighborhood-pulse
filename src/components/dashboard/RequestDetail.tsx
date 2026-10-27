"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatLocalTimestamp } from "@/lib/dates";
import { formatAreaName, formatDepartment, formatDistrict, formatPrecinct } from "@/lib/format";
import type { ServiceRequest } from "@/lib/types";

interface RequestDetailProps {
  request: ServiceRequest;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 py-1.5 text-[13px] leading-5">
      <dt className="text-ink-subtle">{label}</dt>
      <dd className={value ? "text-ink" : "text-ink-subtle italic"}>{value ?? "Not recorded"}</dd>
    </div>
  );
}

/**
 * Details of the selected request. Rendered only while something is selected:
 * a card beside the map on desktop, a sheet over the bottom of the screen on
 * phones and tablets (Escape or Close dismisses it).
 */
export const RequestDetail = forwardRef<HTMLElement, RequestDetailProps>(function RequestDetail({ request, onClose }, ref) {
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const local = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => local.current as HTMLElement);

  // As a sheet, take focus when a request is chosen and close on Escape.
  useEffect(() => {
    if (wide) return;
    local.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wide, request.id, onClose]);

  return (
    <section
      ref={local}
      role={wide ? "region" : "dialog"}
      aria-modal={wide ? undefined : false}
      aria-labelledby="request-detail-heading"
      aria-live="polite"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[45dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-ferry/40 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(19_34_44/0.18)] lg:static lg:z-auto lg:max-h-none lg:scroll-mt-40 lg:overflow-visible lg:rounded-2xl lg:border lg:pb-0 lg:shadow-none"
    >
      <span aria-hidden className="mx-auto mt-2 block h-1 w-10 rounded-full bg-line-strong lg:hidden" />
      <header className="sticky top-0 flex items-start justify-between gap-3 bg-surface px-4 pb-2 pt-2 lg:static lg:rounded-t-2xl lg:pt-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ferry">Selected request</p>
          <h2 id="request-detail-heading" className="mt-0.5 text-[15px] font-semibold leading-6 text-ink">
            {request.type}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tap -mr-1 shrink-0 rounded-md px-3 text-[13px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
          aria-label="Close selected request"
        >
          Close
        </button>
      </header>
      <dl className="divide-y divide-line/70 px-4 pb-3">
        <Row label="Reported" value={`${formatLocalTimestamp(request.createdAt)} (Seattle time)`} />
        <Row label="Current status" value={request.status} />
        <Row label="Address" value={request.address} />
        <Row label="Neighborhood" value={request.area ? formatAreaName(request.area) : null} />
        <Row label="Council district" value={request.councilDistrict ? formatDistrict(request.councilDistrict) : null} />
        <Row label="ZIP code" value={request.zip} />
        <Row label="Police precinct" value={formatPrecinct(request.precinct)} />
        <Row label="Department" value={formatDepartment(request.department)} />
        <Row label="Received via" value={request.method} />
        <Row label="Request number" value={request.id} />
        {!request.coordinates ? (
          <p className="py-2 text-[13px] text-ink-subtle">This request has no usable coordinates, so it is not shown on the map.</p>
        ) : null}
      </dl>
    </section>
  );
});
