import type { MetadataRoute } from "next";

const canonicalOrigin = "https://agent-proof.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: canonicalOrigin, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${canonicalOrigin}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${canonicalOrigin}/verify/demo`, lastModified, changeFrequency: "monthly", priority: 0.7 }
  ];
}
