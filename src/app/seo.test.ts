import { describe, expect, it } from "vitest";
import OpenGraphImage, { contentType as openGraphImageContentType, size as openGraphImageSize } from "@/app/opengraph-image";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("search metadata routes", () => {
  it("publishes a feed-sized social image instead of the favicon", () => {
    expect(openGraphImageSize).toEqual({ width: 1200, height: 630 });
    expect(openGraphImageContentType).toBe("image/png");
  });

  it("renders the social card as a PNG response", async () => {
    const response = OpenGraphImage();

    expect(response.headers.get("content-type")).toContain("image/png");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });

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
