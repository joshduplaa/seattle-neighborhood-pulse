import { describe, expect, it } from "vitest";

import { formatAgo } from "@/components/dashboard/DataProvenance";

describe("formatAgo", () => {
  const now = Date.parse("2026-10-26T20:00:00Z");
  it("rounds down to the largest whole unit", () => {
    expect(formatAgo("2026-10-26T19:59:40Z", now)).toBe("just now");
    expect(formatAgo("2026-10-26T19:48:00Z", now)).toBe("12m ago");
    expect(formatAgo("2026-10-26T17:30:00Z", now)).toBe("2h ago");
    expect(formatAgo("2026-10-24T19:00:00Z", now)).toBe("2d ago");
  });
  it("never reports a future time as negative", () => {
    expect(formatAgo("2026-10-26T20:05:00Z", now)).toBe("just now");
  });
});
