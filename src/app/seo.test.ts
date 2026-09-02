import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import OpenGraphImage, { contentType as openGraphImageContentType, size as openGraphImageSize } from "@/app/opengraph-image";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("search metadata routes", () => {
  it("publishes a feed-sized social image instead of the favicon", () => {
    expect(openGraphImageSize).toEqual({ width: 1200, height: 630 });
    expect(openGraphImageContentType).toBe("image/png");
  });

  it("renders the social card as a PNG response", async () => {
    const icon = await readFile(new URL("./icon.png", import.meta.url));
    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

      if (new URL(url).pathname === "/icon.png") {
        return Promise.resolve(new Response(icon, {
          headers: { "content-type": "image/png" }
        }));
      }

      return originalFetch(input, init);
    }));

    try {
      const response = OpenGraphImage();

      expect(response.headers.get("content-type")).toContain("image/png");
      expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
    } finally {
      vi.unstubAllGlobals();
    }
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
