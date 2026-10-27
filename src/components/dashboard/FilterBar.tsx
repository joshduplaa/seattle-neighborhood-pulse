"use client";

import { useId, useState } from "react";

import { ActiveFilterChips, activeChips } from "@/components/dashboard/ActiveFilterChips";
import { FilterSheet } from "@/components/dashboard/FilterSheet";
import { NeighborhoodSearch } from "@/components/dashboard/NeighborhoodSearch";
import { Segmented } from "@/components/ui/Segmented";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DATASET_START_DATE } from "@/lib/socrata/config";
import { DATE_PRESETS, matchPreset, presetRange, type DashboardFilters, type DatePresetId } from "@/lib/filters";
import { formatCount, formatDistrict } from "@/lib/format";
import type { FacetBucket } from "@/lib/types";

type Facets = Record<"category" | "status" | "area" | "district", FacetBucket[]> | null;

interface FilterBarProps {
  filters: DashboardFilters;
  today: string;
  facets: Facets;
  /** Requests matching the current filters, for the sheet's done button. */
  matching: number | null;
  onChange: (update: Partial<DashboardFilters>) => void;
  onClear: () => void;
  isDefault: boolean;
  busy: boolean;
}

interface Option {
  value: string;
  label: string;
}

/**
 * Build select options from facet counts. Counts reflect every *other* active
 * filter, so they preview how many requests each choice would show. The
 * current selection is kept even if it has no matches.
 */
function facetOptions(buckets: FacetBucket[] | undefined, selected: string | null, label: (v: string) => string): Option[] {
  const options = (buckets ?? [])
    .filter((b): b is FacetBucket & { value: string } => b.value !== null)
    .map((b) => ({ value: b.value, label: `${label(b.value)} (${formatCount(b.count)})`, sort: label(b.value) }));
  if (selected !== null && !options.some((o) => o.value === selected)) {
    options.push({ value: selected, label: `${label(selected)} (0)`, sort: label(selected) });
  }
  return options
    .sort((a, b) => a.sort.localeCompare(b.sort, "en", { numeric: true }))
    .map(({ value, label: l }) => ({ value, label: l }));
}

const fieldClass =
  "tap w-full min-w-0 rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink hover:border-ink-subtle disabled:cursor-not-allowed disabled:opacity-60";

function SelectField(props: {
  label: string;
  value: string | null;
  allLabel: string;
  options: Option[];
  onChange: (value: string | null) => void;
  disabled: boolean;
  hideLabel: boolean;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className={props.hideLabel ? "sr-only" : "text-xs font-medium text-ink-muted"}>
        {props.label}
      </label>
      <select
        id={id}
        className={fieldClass}
        value={props.value ?? ""}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value === "" ? null : e.target.value)}
      >
        <option value="">{props.allLabel}</option>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRange({ filters, today, onChange, hideLabel }: Pick<FilterBarProps, "filters" | "today" | "onChange"> & { hideLabel: boolean }) {
  const startId = useId();
  const endId = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-1">
      <legend className={hideLabel ? "sr-only" : "mb-1 text-xs font-medium text-ink-muted"}>Custom dates</legend>
      <div className="flex items-center gap-1.5">
        <label htmlFor={startId} className="sr-only">
          Start date
        </label>
        <input
          id={startId}
          type="date"
          className={`${fieldClass} lg:w-[9.25rem]`}
          value={filters.start}
          min={DATASET_START_DATE}
          max={filters.end}
          onChange={(e) => e.target.value && onChange({ start: e.target.value })}
        />
        <span className="text-sm text-ink-subtle" aria-hidden>
          –
        </span>
        <label htmlFor={endId} className="sr-only">
          End date
        </label>
        <input
          id={endId}
          type="date"
          className={`${fieldClass} lg:w-[9.25rem]`}
          value={filters.end}
          min={filters.start}
          max={today}
          onChange={(e) => e.target.value && onChange({ end: e.target.value })}
        />
      </div>
    </fieldset>
  );
}

/** Request type, status, neighborhood and district. */
function FacetFields({ filters, facets, onChange, hideLabels }: Pick<FilterBarProps, "filters" | "facets" | "onChange"> & { hideLabels: boolean }) {
  const noOptions = facets === null;
  return (
    <>
      <SelectField
        label="Request type"
        value={filters.category}
        allLabel="All request types"
        options={facetOptions(facets?.category, filters.category, (v) => v)}
        onChange={(category) => onChange({ category })}
        disabled={noOptions}
        hideLabel={hideLabels}
      />
      <SelectField
        label="Current status"
        value={filters.status}
        allLabel="Any status"
        options={facetOptions(facets?.status, filters.status, (v) => v)}
        onChange={(status) => onChange({ status })}
        disabled={noOptions}
        hideLabel={hideLabels}
      />
      <NeighborhoodSearch
        value={filters.area}
        counts={facets?.area ?? null}
        onChange={(area) => onChange({ area })}
        disabled={noOptions}
        hideLabel={hideLabels}
      />
      <SelectField
        label="Council district"
        value={filters.district}
        allLabel="All districts"
        options={facetOptions(facets?.district, filters.district, formatDistrict)}
        onChange={(district) => onChange({ district })}
        disabled={noOptions}
        hideLabel={hideLabels}
      />
    </>
  );
}

const SHORT_PRESET: Record<DatePresetId, string> = { "7d": "7d", "30d": "30d", "90d": "90d", "365d": "12m" };

function PresetToggle({ filters, today, onChange, short }: Pick<FilterBarProps, "filters" | "today" | "onChange"> & { short: boolean }) {
  return (
    <Segmented
      label="Date range presets"
      value={matchPreset(filters, today)}
      onChange={(id) => onChange(presetRange(id, today))}
      className={short ? "min-w-0 flex-1" : ""}
      options={DATE_PRESETS.map((p) => ({
        id: p.id,
        label: short ? SHORT_PRESET[p.id] : p.label,
        ariaLabel: short ? `Last ${p.label}` : undefined,
      }))}
    />
  );
}

/**
 * Desktop: one dense inline row. Phones and tablets: date presets plus a
 * "Filters" button that opens the rest in a bottom sheet, with the active
 * filters shown as removable chips.
 */
export function FilterBar(props: FilterBarProps) {
  const { filters, today, onChange, onClear, isDefault, busy, matching } = props;
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const status = (
    <span aria-live="polite" className="text-xs text-ink-subtle">
      {busy ? "Updating…" : ""}
    </span>
  );

  if (wide) {
    return (
      <form
        aria-label="Filter service requests"
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-2"
      >
        <PresetToggle filters={filters} today={today} onChange={onChange} short={false} />
        <DateRange filters={filters} today={today} onChange={onChange} hideLabel />
        <div className="grid min-w-0 flex-1 basis-[38rem] grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] gap-2">
          <FacetFields filters={filters} facets={props.facets} onChange={onChange} hideLabels />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={isDefault}
            className="tap rounded-md px-3 text-sm font-medium text-sound-strong hover:bg-sound-soft disabled:cursor-not-allowed disabled:text-ink-subtle disabled:opacity-60 disabled:hover:bg-transparent"
          >
            Clear
          </button>
          {status}
        </div>
      </form>
    );
  }

  const count = activeChips(filters, today).length;
  return (
    <div>
      <div className="flex items-center gap-2">
        <PresetToggle filters={filters} today={today} onChange={onChange} short />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-label={count > 0 ? `Filters, ${count} active` : undefined}
          className="tap flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-muted"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-muted">
            <path d="M2.5 4h11M4.5 8h7M6.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Filters
          {count > 0 ? (
            <span aria-hidden className="rounded-full bg-sound-strong px-1.5 text-[11px] leading-[18px] text-white">
              {count}
            </span>
          ) : null}
        </button>
      </div>
      <ActiveFilterChips filters={filters} today={today} onChange={onChange} onClear={onClear} />
      <div className="sr-only">{status}</div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              disabled={isDefault}
              className="tap rounded-md px-3 text-sm font-medium text-sound-strong hover:bg-sound-soft disabled:text-ink-subtle disabled:opacity-60"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="tap flex-1 rounded-lg bg-sound-strong px-4 text-sm font-medium text-white hover:bg-sound-deep"
            >
              {busy ? "Updating…" : matching !== null ? `Show ${formatCount(matching)} requests` : "Done"}
            </button>
          </div>
        }
      >
        <form aria-label="Filter service requests" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-xs font-medium text-ink-muted">Reported in the last</legend>
            <PresetToggle filters={filters} today={today} onChange={onChange} short={false} />
          </fieldset>
          <DateRange filters={filters} today={today} onChange={onChange} hideLabel={false} />
          <FacetFields filters={filters} facets={props.facets} onChange={onChange} hideLabels={false} />
        </form>
      </FilterSheet>
    </div>
  );
}
