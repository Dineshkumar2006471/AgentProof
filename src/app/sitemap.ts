import type { MetadataRoute } from "next";
import { caseStudy, guides } from "@/lib/public-content";

const canonicalOrigin = "https://agent-proof.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: canonicalOrigin, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${canonicalOrigin}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${canonicalOrigin}/verify/demo`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${canonicalOrigin}/docs`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${canonicalOrigin}/case-studies/customer-support-agent-safety`, lastModified: new Date(caseStudy.updatedAt), changeFrequency: "monthly", priority: 0.7 },
    ...guides.map((guide) => ({ url: `${canonicalOrigin}/docs/${guide.slug}`, lastModified: new Date(guide.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 }))
  ];
}
