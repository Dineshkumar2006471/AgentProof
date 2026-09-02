import { describe, expect, it } from "vitest";
import { countRunsInWindow } from "@/lib/beta";

describe("daily verification safeguards", () => {
  it("counts only runs from the rolling 24-hour window", () => {
    const now = Date.parse("2026-08-27T12:00:00.000Z");

    expect(countRunsInWindow([
      { startedAt: "2026-08-27T11:59:00.000Z" },
      { startedAt: "2026-08-26T12:00:00.000Z" },
      { startedAt: "2026-08-26T11:59:59.000Z" },
      { startedAt: "not-a-date" }
    ], now)).toBe(2);
  });
});
