import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.skaiscrape.com";

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/ai-suite`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/network`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/features`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/case-study`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/sign-in`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sign-up`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
