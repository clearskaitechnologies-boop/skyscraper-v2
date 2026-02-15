const isLocalBuild =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_URL?.includes("localhost");

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || "https://skaiscrape.com",
  generateRobotsTxt: false, // We have a custom robots.txt
  exclude: ["/server-sitemap.xml"],
  generateIndexSitemap: false,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  outDir: isLocalBuild ? "./.next/sitemaps-local" : "./public",
  transform: async (cfg, path) => {
    if (isLocalBuild) {
      return null;
    }

    // Custom priority and changefreq based on path
    const customPaths = {
      "/": { priority: 1.0, changefreq: "daily" },
      "/pricing": { priority: 0.9, changefreq: "weekly" },
      "/features": { priority: 0.8, changefreq: "weekly" },
      "/about": { priority: 0.7, changefreq: "monthly" },
      "/contact": { priority: 0.7, changefreq: "monthly" },
    };

    const customConfig = customPaths[path];

    return {
      loc: path,
      changefreq: customConfig?.changefreq || cfg.changefreq,
      priority: customConfig?.priority || cfg.priority,
      lastmod: cfg.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

export default config;
