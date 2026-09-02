import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("search metadata routes", () => {
  it("publishes only AgentProof-owned marketing pages in the sitemap", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://agent-proof.dev",
      "https://agent-proof.dev/pricing",
      "https://agent-proof.dev/verify/demo"
    ]);
  });

  it("allows public crawling while excluding private product surfaces", () => {
    const metadata = robots();
    expect(metadata.sitemap).toBe("https://agent-proof.dev/sitemap.xml");
    expect(metadata.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/dashboard/", "/agents/", "/profile/", "/pricing/checkout/"]
    });
  });
});
