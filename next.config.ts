import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder creator photos are served from Unsplash for now.
    // When photos move to Supabase Storage, add its hostname here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
