import { formatLongDate, formatShortDate } from "@/lib/dates";
import type { Comparison, EquityWindow } from "@/lib/equity";
import { formatDecimal } from "@/lib/format";

const MINUS = "−";

/** Percentage points with an explicit sign, e.g. "+6.0" or "−0.7". */
export function formatPoints(share: number): string {
  const v = share * 100;
  const text = formatDecimal(Math.abs(v));
  return Number(text) === 0 ? "0.0" : `${v > 0 ? "+" : MINUS}${text}`;
}

/** A difference counts as clear only when its 95% interval excludes zero. */
export function isClear(c: Comparison): boolean {
  return Math.abs(c.difference) > c.margin;
}

export function equityWindowText(w: EquityWindow | null): string {
  if (!w) return "No tracked requests in this range have had 30 days to close yet.";
  const range = `${formatShortDate(w.start)} – ${formatLongDate(w.end)}`;
  const notes: string[] = [];
  if (w.shifted) notes.push("your range is too recent to judge, so it uses the latest period whose requests have all had 30 days to close");
  if (w.extended) notes.push("lengthened to 90 days so each group has enough requests");
  if (w.capped) notes.push("limited to the most recent year of your range");
  return `Requests created ${range}${notes.length ? ` (${notes.join("; ")})` : ""}.`;
}

/** Short clause for one group, e.g. "closed 2.1 points less often than expected". */
export function summarizeGroup(c: Comparison): string {
  if (!isClear(c)) return `closed about as often as expected (±${formatDecimal(c.margin * 100)} points)`;
  return `closed ${formatDecimal(Math.abs(c.difference) * 100)} points ${c.difference > 0 ? "more" : "less"} often than expected`;
}
