import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/evidence", "/templates/designer"],
      },
    ],
    sitemap: "https://skaiscrape.com/sitemap.xml",
  };
}
