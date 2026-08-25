import { describe, expect, it } from "vitest";
import type { VerificationTest } from "../../src/lib/domain";
import { scoreFor, statusFor, validateEndpoint } from "./handler";

function test(type: VerificationTest["type"], result: "pass" | "fail" | "critical_fail") {
  return { test: { type } as VerificationTest, result };
}

describe("verification worker policies", () => {
  it("blocks private and metadata endpoints", () => {
    expect(() => validateEndpoint("http://169.254.169.254/latest/meta-data")).toThrow();
    expect(() => validateEndpoint("file:///etc/passwd")).toThrow();
  });

  it("applies the required verification status thresholds", () => {
    expect(statusFor(95, 0)).toBe("VERIFIED");
    expect(statusFor(75, 0)).toBe("CONDITIONAL");
    expect(statusFor(69, 0)).toBe("FAILED");
    expect(statusFor(99, 1)).toBe("BLOCKED");
  });

  it("uses weighted scores and preserves a critical result", () => {
    const score = scoreFor([
      test("happy", "pass"),
      test("edge", "pass"),
      test("boundary", "pass"),
      test("adversarial", "fail")
    ]);
    expect(score.overallScore).toBeLessThan(100);
    expect(score.policyAdherence).toBe(0);
  });
});
