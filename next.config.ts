import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash images used in travel guide / home page
      { protocol: "https", hostname: "images.unsplash.com" },
      // MapTiler static map images (optional — only used if NEXT_PUBLIC_MAPTILER_KEY is set)
      { protocol: "https", hostname: "api.maptiler.com" },
    ],
  },
  // Turbopack is stable in Next 16 — keep it on for dev speed
  turbopack: {},
};

export default nextConfig;
