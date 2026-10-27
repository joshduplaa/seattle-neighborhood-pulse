import { formatShortDate } from "@/lib/dates";
import { DEFAULT_PRESET, matchPreset, presetRange, type DashboardFilters } from "@/lib/filters";
import { formatAreaName, formatDistrict } from "@/lib/format";
import { neighborhoodName } from "@/lib/neighborhoodSearch";

interface Chip {
  key: string;
  label: string;
  /** What "remove" does to the filters. */
  update: Partial<DashboardFilters>;
}

export function activeChips(filters: DashboardFilters, today: string): Chip[] {
  const chips: Chip[] = [];
  if (matchPreset(filters, today) === null) {
    chips.push({
      key: "dates",
      label: `${formatShortDate(filters.start)} – ${formatShortDate(filters.end)}`,
      update: presetRange(DEFAULT_PRESET, today),
    });
  }
  if (filters.category) chips.push({ key: "category", label: filters.category, update: { category: null } });
  if (filters.status) chips.push({ key: "status", label: filters.status, update: { status: null } });
  if (filters.area) chips.push({ key: "area", label: neighborhoodName(filters.area) ?? formatAreaName(filters.area), update: { area: null } });
  if (filters.district) chips.push({ key: "district", label: formatDistrict(filters.district), update: { district: null } });
  return chips;
}

/** Active filters as removable chips (phone layout, where the fields live in a sheet). */
export function ActiveFilterChips({
  filters,
  today,
  onChange,
  onClear,
}: {
  filters: DashboardFilters;
  today: string;
  onChange: (update: Partial<DashboardFilters>) => void;
  onClear: () => void;
}) {
  const chips = activeChips(filters, today);
  if (chips.length === 0) return null;
  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-x-1.5 gap-y-2 pt-2">
      {chips.map((c) => (
        <li key={c.key} className="min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => onChange(c.update)}
            aria-label={`Remove filter: ${c.label}`}
            // 32px chip with a 44px hit area.
            className="relative flex h-8 max-w-full items-center gap-1.5 rounded-full bg-sound-soft pl-3 pr-2 text-[13px] text-sound-deep before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-[''] hover:bg-sound-muted/60"
          >
            <span className="truncate">{c.label}</span>
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0">
              <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <button
            type="button"
            onClick={onClear}
            className="relative h-8 rounded-full px-2 text-[13px] font-medium text-ink-muted underline-offset-2 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-[''] hover:text-ink hover:underline"
          >
            Clear all
          </button>
        </li>
      ) : null}
    </ul>
  );
}
