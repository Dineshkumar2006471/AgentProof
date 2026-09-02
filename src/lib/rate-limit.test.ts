import { describe, expect, it } from "vitest";
import { rateLimitSubject } from "@/lib/rate-limit";

describe("rate-limit subject", () => {
  it("hashes a stable identifier without retaining the original value", () => {
    const subject = rateLimitSubject("user@example.com:203.0.113.10");
    expect(subject).toHaveLength(32);
    expect(subject).not.toContain("user@example.com");
    expect(subject).toBe(rateLimitSubject("user@example.com:203.0.113.10"));
  });
});
