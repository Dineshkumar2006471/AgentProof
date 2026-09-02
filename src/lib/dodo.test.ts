import { describe, expect, it } from "vitest";
import { dodoCheckoutEnabled, dodoPlanFromProductId } from "@/lib/dodo";

describe("Dodo production gate", () => {
  it("keeps checkout disabled until complete live configuration is available", () => {
    expect(dodoCheckoutEnabled()).toBe(false);
  });

  it("does not infer a plan from an absent product identifier", () => {
    expect(dodoPlanFromProductId(undefined)).toBeUndefined();
  });
});
