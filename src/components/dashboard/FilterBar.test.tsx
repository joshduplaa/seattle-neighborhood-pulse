import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { activeChips } from "@/components/dashboard/ActiveFilterChips";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { defaultFilters, presetRange, type DashboardFilters } from "@/lib/filters";

const today = "2026-10-26";
const base = defaultFilters(today);

function renderBar(filters: DashboardFilters, onChange = vi.fn(), onClear = vi.fn()) {
  render(
    <FilterBar filters={filters} today={today} facets={null} matching={120} onChange={onChange} onClear={onClear} isDefault={false} busy={false} />,
  );
  return { onChange, onClear };
}

describe("activeChips", () => {
  it("lists only non-default filters, with a custom date range as a chip", () => {
    expect(activeChips(base, today)).toEqual([]);
    const chips = activeChips({ ...base, start: "2026-09-01", category: "Pothole", area: "BALLARD", district: "6" }, today);
    expect(chips.map((c) => c.label)).toEqual(["Sep 1 – Oct 25", "Pothole", "Ballard", "District 6"]);
    // Removing the date chip returns to the default preset.
    expect(chips[0]!.update).toEqual(presetRange("30d", today));
  });
});

describe("FilterBar (phone layout)", () => {
  it("shows active filters as removable chips and counts them on the Filters button", async () => {
    const { onChange, onClear } = renderBar({ ...base, category: "Pothole", status: "Closed" });
    expect(screen.getByRole("button", { name: "Filters, 2 active" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove filter: Pothole" }));
    expect(onChange).toHaveBeenCalledWith({ category: null });
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClear).toHaveBeenCalled();
  });

  it("opens the remaining filters in a dialog", async () => {
    const { onChange } = renderBar(base);
    const trigger = screen.getByRole("button", { name: "Filters" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const dialog = screen.getByRole("dialog", { name: "Filters", hidden: true });
    expect(within(dialog).getByLabelText("Request type", { selector: "select" })).toBeInTheDocument();
    expect(within(dialog).getByRole("combobox", { name: "Neighborhood", hidden: true })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "12 months", hidden: true }));
    expect(onChange).toHaveBeenCalledWith(presetRange("365d", today));
    await userEvent.click(within(dialog).getByRole("button", { name: "Show 120 requests", hidden: true }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("uses short preset labels with full accessible names", () => {
    renderBar(base);
    expect(screen.getByRole("button", { name: "Last 30 days" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Last 30 days" })).toHaveTextContent("30d");
  });
});
