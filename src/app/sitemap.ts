import type { MetadataRoute } from "next";

const pages = ["", "/pricing", "/faq", "/signup", "/login", "/terms", "/privacy", "/legal-notice"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `https://conectrz.com${path}` }));
}
