import { describe, expect, it } from "vitest";
import { isEligibleForBadge } from "@/lib/report-badge";

describe("verified report badge eligibility", () => {
  const now = Date.parse("2026-09-02T00:00:00.000Z");

  it("allows only current verified reports", () => {
    expect(isEligibleForBadge({ status: "VERIFIED", validUntil: "2026-09-03T00:00:00.000Z" }, now)).toBe(true);
  });

  it("rejects conditional and expired reports", () => {
    expect(isEligibleForBadge({ status: "CONDITIONAL", validUntil: "2026-09-03T00:00:00.000Z" }, now)).toBe(false);
    expect(isEligibleForBadge({ status: "VERIFIED", validUntil: "2026-09-01T00:00:00.000Z" }, now)).toBe(false);
  });
});
