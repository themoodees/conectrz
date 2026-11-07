import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Creator photos/portfolio: Supabase Storage (private buckets, signed URLs) + Unsplash placeholders.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kwjpvlxnuquphjblydcy.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
