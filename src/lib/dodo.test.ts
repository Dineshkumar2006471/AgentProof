import { describe, expect, it } from "vitest";
import { dodoCheckoutEnabled, dodoPlanFromProductId } from "@/lib/dodo";

describe("Dodo beta gate", () => {
  it("keeps checkout disabled unless the server-side gate is enabled", () => {
    expect(dodoCheckoutEnabled("test-user")).toBe(false);
  });

  it("does not infer a plan from an absent product identifier", () => {
    expect(dodoPlanFromProductId(undefined)).toBeUndefined();
  });
});
