/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://skaiscrape.com",
  generateRobotsTxt: false, // We have our custom robots.txt
  exclude: ["/admin/*", "/api/*", "/settings/*", "/sign-in", "/sign-up", "/_next/*"],
  additionalPaths: async (config) => [
    await config.transform(config, "/"),
    await config.transform(config, "/dashboard"),
    await config.transform(config, "/ai-suite"),
    await config.transform(config, "/pricing"),
    await config.transform(config, "/demo"),
    await config.transform(config, "/contact"),
    await config.transform(config, "/features"),
    await config.transform(config, "/branding"),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/settings/"],
      },
    ],
  },
};
