import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/faq", "/terms", "/privacy", "/legal-notice"],
        disallow: ["/admin", "/creator/", "/discover", "/messages", "/settings", "/auth"],
      },
    ],
    sitemap: "https://conectrz.com/sitemap.xml",
  };
}
