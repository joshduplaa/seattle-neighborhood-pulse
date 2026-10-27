"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { Chevron, Panel } from "@/components/ui/Panel";

import { formatInstantInSeattle, formatLocalTimestamp } from "@/lib/dates";
import { formatCount } from "@/lib/format";
import {
  DATASET_API_DOCS_URL,
  DATASET_ID,
  DATASET_NAME,
  DATASET_PAGE_URL,
  DATASET_PUBLISHER,
  RESOURCE_URL,
} from "@/lib/socrata/config";
import type { DashboardData } from "@/lib/types";

/** "just now", "12m ago", "3h ago", "2d ago". */
export function formatAgo(iso: string, nowMs: number): string {
  const minutes = Math.max(0, Math.floor((nowMs - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// The current minute, as a store so render stays pure; 0 on the server.
const subscribeMinute = (onChange: () => void) => {
  const t = setInterval(onChange, 30_000);
  return () => clearInterval(t);
};
const minuteSnapshot = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => 0;

/** Short freshness line under the page title; full timestamps are in the tooltip and About. */
export function FreshnessLine({ data, unavailable = false }: { data: DashboardData | null; unavailable?: boolean }) {
  const minute = useSyncExternalStore(subscribeMinute, minuteSnapshot, serverMinute);
  const updated = data?.sourceUpdatedAt ?? data?.retrievedAt ?? null;
  const title = data
    ? [
        data.sourceUpdatedAt ? `Source updated ${formatInstantInSeattle(data.sourceUpdatedAt)}` : null,
        `Retrieved ${formatInstantInSeattle(data.retrievedAt)}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <p className="text-[13px] leading-5 text-ink-subtle" title={title}>
      Data:{" "}
      <a href={DATASET_PAGE_URL} className="font-medium text-sound-strong underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
        {DATASET_PUBLISHER}
      </a>
      {updated && minute ? (
        <>
          {" · "}
          {data?.sourceUpdatedAt ? "updated" : "retrieved"} {formatAgo(updated, minute * 60_000)}
          {title ? <span className="sr-only"> ({title})</span> : null}
        </>
      ) : unavailable ? (
        " · currently unavailable"
      ) : data ? null : (
        " · loading…"
      )}
    </p>
  );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-t border-line first:border-t-0" open={defaultOpen}>
      <summary className="tap flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-medium text-ink hover:text-sound-strong [&::-webkit-details-marker]:hidden">
        {title}
        <Chevron className="text-ink-subtle group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-[13px] leading-6 text-ink-muted">{children}</div>
    </details>
  );
}

export function DataProvenance({ data }: { data: DashboardData | null }) {
  return (
    <Panel id="about" title="About this data" description="Where the numbers come from and how to read them.">
      <Section title="Source and freshness">
        <p>
          Every figure on this page comes from the City of Seattle&apos;s{" "}
          <a href={DATASET_PAGE_URL} target="_blank" rel="noreferrer" className="font-medium text-sound-strong underline underline-offset-2">
            {DATASET_NAME}
          </a>{" "}
          dataset (ID <code className="rounded bg-surface-muted px-1 py-0.5 text-[12px]">{DATASET_ID}</code>): requests submitted through the
          Find It, Fix It app, the Customer Service Request web portal, phone, email and other channels, for request types that are or were
          available to the public. It is queried live through the{" "}
          <a href={DATASET_API_DOCS_URL} target="_blank" rel="noreferrer" className="font-medium text-sound-strong underline underline-offset-2">
            Socrata Open Data API
          </a>{" "}
          and cached on this server for up to 15 minutes.
        </p>
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
          <dt className="text-ink-subtle">Endpoint</dt>
          <dd className="break-all font-mono text-[12px]">{RESOURCE_URL}</dd>
          {data?.sourceUpdatedAt ? (
            <>
              <dt className="text-ink-subtle">Source updated</dt>
              <dd>{formatInstantInSeattle(data.sourceUpdatedAt)}</dd>
            </>
          ) : null}
          {data?.newestRecordAt ? (
            <>
              <dt className="text-ink-subtle">Newest request</dt>
              <dd>{formatLocalTimestamp(data.newestRecordAt)} (Seattle time)</dd>
            </>
          ) : null}
          {data ? (
            <>
              <dt className="text-ink-subtle">Retrieved</dt>
              <dd>{formatInstantInSeattle(data.retrievedAt)}</dd>
            </>
          ) : null}
        </dl>
      </Section>
      <Section title="How to read the numbers">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-ink">Counts, trends, breakdowns and the density layer</strong> are aggregates computed by the
            City&apos;s API over <em>every</em> request matching your filters.
          </li>
          <li>
            <strong className="font-medium text-ink">Map markers and the recent list</strong> show only the newest{" "}
            {formatCount(data?.sample.limit ?? 2000)} matching requests, so they are a sample, not the full picture.
          </li>
          <li>
            Dates are when a request was <em>created</em>, in Seattle time. The main dataset has no resolution timestamp, so its status is the
            current status only.
          </li>
          <li>
            A request is one report, not one problem: several residents can report the same issue, and statuses such as &ldquo;Duplicate&rdquo;
            mark some of these.
          </li>
          <li>
            Neighborhoods are the City&apos;s Community Reporting Areas. ZIP codes, council districts and neighborhoods are different
            boundaries and are never mixed. Area counts are not adjusted for population unless you choose per 1,000 residents.
          </li>
          <li>Requests without valid Seattle coordinates are counted but not mapped; no location is ever guessed.</li>
        </ul>
      </Section>
    </Panel>
  );
}
