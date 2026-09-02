import type { MetadataRoute } from "next";

const canonicalOrigin = "https://agent-proof.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/dashboard/", "/agents/", "/profile/", "/pricing/checkout/"]
    },
    sitemap: `${canonicalOrigin}/sitemap.xml`,
    host: canonicalOrigin
  };
}
