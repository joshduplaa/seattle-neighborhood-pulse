import { countFor } from "@/lib/aggregate";
import { daysInRange, formatShortDate } from "@/lib/dates";
import { formatCount, formatDecimal, formatPercent } from "@/lib/format";
import { CHANGE_ARROW, describeChange, type Change } from "@/lib/change";
import type { DashboardData } from "@/lib/types";

import { Skeleton } from "@/components/ui/Panel";

interface Metric {
  label: string;
  value: string;
  /** One short secondary line. */
  detail: string;
  /** Longer explanation, shown as a tooltip. */
  title?: string;
  /** Text values (names) use a smaller face so they can wrap to two lines. */
  text?: boolean;
  /** Change versus the previous equal-length period, with its date range. */
  change?: { change: Change; period: string };
}

export function buildMetrics(data: DashboardData): Metric[] {
  const { filters, totals, facets, comparison } = data;
  const days = daysInRange(filters.start, filters.end);
  const perDay = totals.matching / days;
  const range = `${formatShortDate(filters.start)} – ${formatShortDate(filters.end)}`;

  // Most common type within the current scope (category facet ignores its own filter).
  const categoryScope = facets.category.reduce((a, b) => a + b.count, 0);
  const top = filters.category
    ? { value: filters.category, count: countFor(facets.category, filters.category) }
    : facets.category.find((b) => b.value !== null);

  return [
    {
      label: "Requests",
      value: formatCount(totals.matching),
      change: comparison
        ? (() => {
            const change = describeChange(totals.matching, comparison.matching);
            return change ? { change, period: `${formatShortDate(comparison.start)} – ${formatShortDate(comparison.end)}` } : undefined;
          })()
        : undefined,
      detail: range,
      title: `Requests reported ${range} (${formatCount(days)} ${days === 1 ? "day" : "days"})`,
    },
    {
      label: "Per day",
      value: perDay >= 100 ? formatCount(Math.round(perDay)) : formatDecimal(perDay),
      detail: "daily average",
    },
    {
      label: filters.category ? "Selected type" : "Top type",
      value: top?.value ?? "—",
      text: true,
      detail: top && categoryScope > 0 ? `${formatPercent(top.count / categoryScope)} of requests` : "No requests in scope",
    },
    {
      label: "Mapped",
      value: totals.matching ? formatPercent(totals.geolocated / totals.matching) : "—",
      detail: `${formatCount(Math.max(0, totals.matching - totals.geolocated))} without location`,
      title: "Share of matching requests with usable Seattle coordinates",
    },
  ];
}

export function SummaryMetrics({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const grid = "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4";
  if (!data) {
    return (
      <div className={grid} aria-busy={loading}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface px-4 py-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2.5 h-7 w-20" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className={`${grid} transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
      {buildMetrics(data).map((m) => (
        <div key={m.label} className="flex min-w-0 flex-col bg-surface px-4 py-3 sm:px-5" title={m.title}>
          <dt className="text-xs font-medium text-ink-muted">{m.label}</dt>
          <dd className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span
              className={`min-w-0 font-display font-semibold text-ink ${
                m.text ? "line-clamp-2 text-base leading-5 sm:text-lg sm:leading-6" : "text-2xl leading-8 tabular-nums sm:text-[28px]"
              }`}
              title={m.value}
            >
              {m.value}
            </span>
            {m.change ? (
              <span className="whitespace-nowrap text-xs tabular-nums text-ink-muted" title={`${m.change.change.description} (${m.change.period})`}>
                <span aria-hidden className="mr-0.5 text-[9px]">
                  {CHANGE_ARROW[m.change.change.direction]}
                </span>
                <span aria-hidden>{m.change.change.text}</span>
                <span className="sr-only">
                  , {m.change.change.description} ({m.change.period})
                </span>
              </span>
            ) : null}
          </dd>
          <dd className="mt-auto truncate pt-0.5 text-xs leading-5 text-ink-subtle">{m.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
