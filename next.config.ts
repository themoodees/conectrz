import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Creator photos/portfolio: Supabase Storage (public buckets) + Unsplash placeholders.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kwjpvlxnuquphjblydcy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
