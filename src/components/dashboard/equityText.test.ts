import { describe, expect, it } from "vitest";

import { equityWindowText, formatPoints, isClear, summarizeGroup } from "@/components/dashboard/equityText";
import type { Comparison } from "@/lib/equity";

const cmp = (difference: number, margin: number): Comparison => ({ observed: 0.5 + difference, expected: 0.5, difference, margin });

describe("equity wording", () => {
  it("formats signed percentage points", () => {
    expect(formatPoints(0.06)).toBe("+6.0");
    expect(formatPoints(-0.007)).toBe("−0.7");
    expect(formatPoints(0.0001)).toBe("0.0");
  });

  it("only calls a difference clear when its interval excludes zero", () => {
    expect(isClear(cmp(0.06, 0.013))).toBe(true);
    expect(isClear(cmp(-0.007, 0.011))).toBe(false);
  });

  it("explains how the window was chosen", () => {
    expect(equityWindowText({ start: "2026-06-23", end: "2026-09-20", shifted: true, extended: true, capped: false })).toBe(
      "Requests created Jun 23 – Sep 20, 2026 (your range is too recent to judge, so it uses the latest period whose requests have all had 30 days to close; lengthened to 90 days so each group has enough requests).",
    );
    expect(equityWindowText(null)).toMatch(/30 days to close/);
  });
});

describe("summarizeGroup", () => {
  it("states a clear difference in points and treats the rest as within the margin", () => {
    expect(summarizeGroup({ observed: 0.5, expected: 0.52, difference: -0.021, margin: 0.01 })).toBe("closed 2.1 points less often than expected");
    expect(summarizeGroup({ observed: 0.6, expected: 0.54, difference: 0.06, margin: 0.013 })).toBe("closed 6.0 points more often than expected");
    expect(summarizeGroup({ observed: 0.5, expected: 0.505, difference: -0.005, margin: 0.013 })).toBe("closed about as often as expected (±1.3 points)");
  });
});
