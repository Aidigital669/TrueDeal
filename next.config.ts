import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@crawlee/cheerio", "@crawlee/core", "crawlee"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
